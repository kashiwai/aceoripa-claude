'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from 'react-hot-toast'
import { TruckIcon, PackageIcon, CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Shipment {
  id: string
  user_id: string
  user_email: string
  user_name: string
  shipping_address: {
    postal_code: string
    prefecture: string
    city: string
    address_line1: string
    address_line2?: string
    phone_number: string
  }
  items: ShipmentItem[]
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  tracking_number?: string
  shipping_company?: string
  total_amount: number
  shipping_fee: number
  created_at: string
  shipped_at?: string
  delivered_at?: string
  notes?: string
}

interface ShipmentItem {
  id: string
  card_id: string
  card_name: string
  quantity: number
  unit_price: number
}

export default function ShipmentsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [shipments, setShipments] = useState<Shipment[]>([])
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [editForm, setEditForm] = useState({
    status: '',
    tracking_number: '',
    shipping_company: '',
    notes: ''
  })

  useEffect(() => {
    fetchShipments()
  }, [])

  useEffect(() => {
    filterShipments()
  }, [shipments, searchTerm, statusFilter, dateFilter])

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          users(email, username),
          shipment_items(
            id,
            card_id,
            quantity,
            unit_price,
            cards(name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const processedShipments = data?.map((shipment: any) => ({
        id: shipment.id,
        user_id: shipment.user_id,
        user_email: shipment.users?.email || '',
        user_name: shipment.users?.username || '',
        shipping_address: shipment.shipping_address,
        items: shipment.shipment_items?.map((item: any) => ({
          id: item.id,
          card_id: item.card_id,
          card_name: item.cards?.name || '',
          quantity: item.quantity,
          unit_price: item.unit_price
        })) || [],
        status: shipment.status,
        tracking_number: shipment.tracking_number,
        shipping_company: shipment.shipping_company,
        total_amount: shipment.total_amount,
        shipping_fee: shipment.shipping_fee,
        created_at: shipment.created_at,
        shipped_at: shipment.shipped_at,
        delivered_at: shipment.delivered_at,
        notes: shipment.notes
      })) || []

      setShipments(processedShipments)
    } catch (error) {
      console.error('Error fetching shipments:', error)
      toast.error('発送データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const filterShipments = () => {
    let filtered = [...shipments]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(shipment => 
          new Date(shipment.created_at) >= filterDate
        )
      }
    }

    setFilteredShipments(filtered)
  }

  const updateShipmentStatus = async (shipmentId: string, newStatus: string, trackingNumber?: string, shippingCompany?: string, notes?: string) => {
    try {
      setLoading(true)

      const updateData: any = {
        status: newStatus,
        notes: notes || null
      }

      if (newStatus === 'shipped') {
        updateData.shipped_at = new Date().toISOString()
        updateData.tracking_number = trackingNumber || null
        updateData.shipping_company = shippingCompany || null
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', shipmentId)

      if (error) throw error

      toast.success('発送状況を更新しました')
      fetchShipments()
      setShowModal(false)
      setSelectedShipment(null)
    } catch (error) {
      console.error('Error updating shipment:', error)
      toast.error('更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const generateShippingLabel = async (shipment: Shipment) => {
    try {
      // 配送ラベル生成のAPI呼び出し（実装例）
      const response = await fetch('/api/admin/shipments/generate-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipmentId: shipment.id,
          shippingAddress: shipment.shipping_address,
          items: shipment.items
        }),
      })

      if (!response.ok) throw new Error('ラベル生成に失敗しました')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shipping-label-${shipment.id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('配送ラベルを生成しました')
    } catch (error) {
      console.error('Error generating shipping label:', error)
      toast.error('ラベル生成に失敗しました')
    }
  }

  const exportShipments = async () => {
    try {
      const csv = [
        ['発送ID', 'ユーザーメール', 'ユーザー名', '住所', '商品', '数量', 'ステータス', '追跡番号', '作成日'].join(','),
        ...filteredShipments.map(shipment => [
          shipment.id,
          shipment.user_email,
          shipment.user_name,
          `${shipment.shipping_address.prefecture}${shipment.shipping_address.city}${shipment.shipping_address.address_line1}`,
          shipment.items.map(item => `${item.card_name}(${item.quantity})`).join(';'),
          shipment.items.reduce((sum, item) => sum + item.quantity, 0),
          getStatusLabel(shipment.status),
          shipment.tracking_number || '',
          new Date(shipment.created_at).toLocaleDateString('ja-JP')
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `shipments-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('CSVファイルをダウンロードしました')
    } catch (error) {
      console.error('Error exporting shipments:', error)
      toast.error('エクスポートに失敗しました')
    }
  }

  const openEditModal = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setEditForm({
      status: shipment.status,
      tracking_number: shipment.tracking_number || '',
      shipping_company: shipment.shipping_company || '',
      notes: shipment.notes || ''
    })
    setShowModal(true)
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      pending: '受注待ち',
      preparing: '準備中',
      shipped: '発送済み',
      delivered: '配達完了',
      cancelled: 'キャンセル'
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: 'bg-gray-100 text-gray-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">発送管理</h1>
        <button
          onClick={exportShipments}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <PackageIcon className="h-5 w-5" />
          CSVエクスポート
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ユーザー名、メール、追跡番号で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全ステータス</option>
            <option value="pending">受注待ち</option>
            <option value="preparing">準備中</option>
            <option value="shipped">発送済み</option>
            <option value="delivered">配達完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>

        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全期間</option>
            <option value="today">今日</option>
            <option value="week">過去1週間</option>
            <option value="month">過去1ヶ月</option>
          </select>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'preparing', 'shipped', 'delivered'].map((status) => {
          const count = filteredShipments.filter(s => s.status === status).length
          return (
            <div key={status} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                  {status === 'pending' && <PackageIcon className="h-6 w-6" />}
                  {status === 'preparing' && <PackageIcon className="h-6 w-6" />}
                  {status === 'shipped' && <TruckIcon className="h-6 w-6" />}
                  {status === 'delivered' && <CheckCircleIcon className="h-6 w-6" />}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{getStatusLabel(status)}</p>
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 発送一覧 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              該当する発送がありません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      発送ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      配送先
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      追跡番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shipment.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.user_name || '名前なし'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shipment.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          〒{shipment.shipping_address.postal_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {shipment.shipping_address.prefecture}{shipment.shipping_address.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shipment.items.length}品目
                        </div>
                        <div className="text-sm text-gray-500">
                          計{shipment.items.reduce((sum, item) => sum + item.quantity, 0)}個
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{shipment.total_amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                          {getStatusLabel(shipment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.tracking_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(shipment.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(shipment)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            編集
                          </button>
                          {(shipment.status === 'preparing' || shipment.status === 'shipped') && (
                            <button
                              onClick={() => generateShippingLabel(shipment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              ラベル
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      {showModal && selectedShipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              発送情報編集
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ステータス
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">受注待ち</option>
                  <option value="preparing">準備中</option>
                  <option value="shipped">発送済み</option>
                  <option value="delivered">配達完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>

              {(editForm.status === 'shipped' || editForm.status === 'delivered') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      配送会社
                    </label>
                    <select
                      value={editForm.shipping_company}
                      onChange={(e) => setEditForm({ ...editForm, shipping_company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">選択してください</option>
                      <option value="yamato">ヤマト運輸</option>
                      <option value="sagawa">佐川急便</option>
                      <option value="japan_post">日本郵便</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      追跡番号
                    </label>
                    <input
                      type="text"
                      value={editForm.tracking_number}
                      onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="追跡番号を入力"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="備考を入力"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setSelectedShipment(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => updateShipmentStatus(
                    selectedShipment.id,
                    editForm.status,
                    editForm.tracking_number,
                    editForm.shipping_company,
                    editForm.notes
                  )}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '更新中...' : '更新'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}