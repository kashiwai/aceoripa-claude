'use client'

import { useState, useEffect } from 'react'

interface ExchangeItem {
  id: string
  name: string
  description: string
  point_cost: number
  stock_quantity: number
  category: string
  image_url: string
  rarity: string
  is_available: boolean
  created_at: string
}

export default function AdminPointExchangePage() {
  const [items, setItems] = useState<ExchangeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<ExchangeItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    point_cost: 0,
    stock_quantity: 0,
    category: 'pokemon_card',
    image_url: '',
    rarity: 'C',
    is_available: true
  })

  const categories = [
    { id: 'pokemon_card', name: 'ポケモンカード' },
    { id: 'special_item', name: 'スペシャルアイテム' },
    { id: 'digital_item', name: 'デジタルアイテム' }
  ]

  const rarities = ['SS', 'S', 'A', 'B', 'C']

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/point-exchange')
      const data = await response.json()
      
      if (data.success) {
        setItems(data.items)
      } else {
        console.error('Failed to fetch items:', data.error)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const body = editingItem 
        ? { ...formData, id: editingItem.id }
        : formData

      const response = await fetch('/api/admin/point-exchange', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      
      if (data.success) {
        alert(editingItem ? 'アイテムを更新しました' : 'アイテムを追加しました')
        fetchItems()
        resetForm()
      } else {
        alert(data.error || '操作に失敗しました')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('操作に失敗しました')
    }
  }

  const handleEdit = (item: ExchangeItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      point_cost: item.point_cost,
      stock_quantity: item.stock_quantity,
      category: item.category,
      image_url: item.image_url,
      rarity: item.rarity,
      is_available: item.is_available
    })
    setShowAddForm(true)
  }

  const handleDelete = async (itemId: string, itemName: string) => {
    if (!confirm(`「${itemName}」を削除しますか？`)) return

    try {
      const response = await fetch(`/api/admin/point-exchange?id=${itemId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        alert('アイテムを削除しました')
        fetchItems()
      } else {
        alert(data.error || '削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      point_cost: 0,
      stock_quantity: 0,
      category: 'pokemon_card',
      image_url: '',
      rarity: 'C',
      is_available: true
    })
    setEditingItem(null)
    setShowAddForm(false)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SS': return 'bg-red-100 text-red-800'
      case 'S': return 'bg-yellow-100 text-yellow-800'
      case 'A': return 'bg-blue-100 text-blue-800'
      case 'B': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ポイント交換管理</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          アイテム追加
        </button>
      </div>

      {/* アイテム追加/編集フォーム */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editingItem ? 'アイテム編集' : 'アイテム追加'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アイテム名 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    必要ポイント *
                  </label>
                  <input
                    type="number"
                    value={formData.point_cost}
                    onChange={(e) => setFormData({...formData, point_cost: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    在庫数 *
                  </label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリー *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    レアリティ
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {rarities.map(rarity => (
                      <option key={rarity} value={rarity}>{rarity}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  画像URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                  交換可能にする
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                >
                  {editingItem ? '更新' : '追加'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* アイテム一覧 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            登録アイテム ({items.length}件)
          </h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アイテム
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ポイント
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    在庫
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                          </div>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityColor(item.rarity)}`}>
                              {item.rarity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categories.find(c => c.id === item.category)?.name || item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.point_cost.toLocaleString()}pt
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.stock_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available ? '交換可能' : '交換停止'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500">
            登録されているアイテムがありません
          </div>
        )}
      </div>
    </div>
  )
}