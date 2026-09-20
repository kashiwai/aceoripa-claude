'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface SystemInfo {
  nextJs: {
    version: string
    environment: string
  }
  deployment: {
    vercelUrl: string | null
    environment: string
  }
  database: {
    totalUsers: number
    totalCards: number
    totalTransactions: number
    totalGachaProducts: number
    totalAdmins: number
  }
  systemHealth: {
    dbConnection: boolean
    apiConnection: boolean
    storageConnection: boolean
    errors: string[]
  }
  integrations: {
    supabaseUrl: string | null
    openai: boolean
    fincode: boolean
    vapid: boolean
    line: boolean
    googleOAuth: boolean
  }
}

interface AdminCredential {
  id: string
  username: string
  role: string
  created_at: string
  last_login?: string
  is_active: boolean
}

export default function SystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [adminCredentials, setAdminCredentials] = useState<AdminCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'admin' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchSystemInfo()
    fetchAdminCredentials()
  }, [])

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch('/api/admin/system')
      if (!response.ok) throw new Error('failed')
      const data = await response.json()
      setSystemInfo(data.info)
    } catch (error) {
      console.error('Error fetching system info:', error)
      toast.error('システム情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminCredentials = async () => {
    try {
      const response = await fetch('/api/admin/system/admins')
      if (!response.ok) throw new Error('failed')
      const data = await response.json()
      setAdminCredentials(data.admins || [])
    } catch (error) {
      console.error('Error fetching admin credentials:', error)
    }
  }

  const createAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      toast.error('ユーザー名とパスワードを入力してください')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/admin/system/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || '作成に失敗しました')
      }

      toast.success('管理者アカウントを作成しました')
      setNewAdmin({ username: '', password: '', role: 'admin' })
      setShowCreateAdmin(false)
      fetchAdminCredentials()
    } catch (error: any) {
      console.error('Error creating admin:', error)
      toast.error(error.message || '管理者アカウントの作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const deleteAdmin = async (id: string) => {
    if (!confirm('この管理者アカウントを削除しますか？')) return

    try {
      const response = await fetch(`/api/admin/system/admins?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('failed')

      toast.success('管理者アカウントを削除しました')
      fetchAdminCredentials()
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  const StatusBadge = ({ ok }: { ok: boolean }) => (
    <span className={`badge ${ok ? 'bg-success' : 'bg-secondary'}`}>{ok ? '設定済み' : '未設定'}</span>
  )

  return (
    <div className="container-fluid mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">システム設定</h1>
        <button className="btn btn-primary" onClick={() => { fetchSystemInfo(); toast.success('最新情報に更新しました') }}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          再読み込み
        </button>
      </div>

      {/* システムヘルスステータス */}
      {systemInfo?.systemHealth && (
        <div className="row mb-4">
          <div className="col">
            <div className={`card border-${systemInfo.systemHealth.errors.length === 0 ? 'success' : 'danger'}`}>
              <div className="card-header">
                <h3 className="card-title mb-0">
                  <i className="bi bi-heart-pulse me-2"></i>
                  システムヘルスステータス
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="text-center">
                      <h6>データベース接続</h6>
                      <span className={`badge ${systemInfo.systemHealth.dbConnection ? 'bg-success' : 'bg-danger'}`}>
                        {systemInfo.systemHealth.dbConnection ? 'OK' : 'エラー'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <h6>ストレージ接続</h6>
                      <span className={`badge ${systemInfo.systemHealth.storageConnection ? 'bg-success' : 'bg-danger'}`}>
                        {systemInfo.systemHealth.storageConnection ? 'OK' : 'エラー'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="text-center">
                      <h6>全体ステータス</h6>
                      <span className={`badge ${systemInfo.systemHealth.errors.length === 0 ? 'bg-success' : 'bg-danger'}`}>
                        {systemInfo.systemHealth.errors.length === 0 ? '正常' : `${systemInfo.systemHealth.errors.length}件のエラー`}
                      </span>
                    </div>
                  </div>
                </div>

                {systemInfo.systemHealth.errors.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-danger mb-3">検出されたエラー</h6>
                    <div className="list-group">
                      {systemInfo.systemHealth.errors.map((error, index) => (
                        <div key={index} className="list-group-item list-group-item-danger">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">🔧 システム情報</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-4">
                  <h5>Next.js</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td>バージョン</td>
                        <td><code>{systemInfo?.nextJs.version}</code></td>
                      </tr>
                      <tr>
                        <td>環境</td>
                        <td>
                          <span className={`badge ${systemInfo?.nextJs.environment === 'production' ? 'bg-success' : 'bg-warning'}`}>
                            {systemInfo?.nextJs.environment}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="col-md-6 mb-4">
                  <h5>データベース統計</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr><td>ユーザー数</td><td><strong>{systemInfo?.database.totalUsers}</strong></td></tr>
                      <tr><td>カード数</td><td><strong>{systemInfo?.database.totalCards}</strong></td></tr>
                      <tr><td>取引数</td><td><strong>{systemInfo?.database.totalTransactions}</strong></td></tr>
                      <tr><td>ガチャ商品数</td><td><strong>{systemInfo?.database.totalGachaProducts}</strong></td></tr>
                      <tr><td>管理者数</td><td><strong>{systemInfo?.database.totalAdmins}</strong></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 外部サービス連携状況(値は表示しない・設定有無のみ) */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">🔗 外部サービス連携状況</h3>
            </div>
            <div className="card-body">
              <p className="text-muted small mb-3">
                セキュリティのため、APIキーやシークレットの値そのものはここには表示されません。値の確認・変更はVercelの環境変数設定から行ってください。
              </p>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td style={{ width: '260px' }}>Supabase URL</td>
                    <td><code className="small">{systemInfo?.integrations.supabaseUrl || '未設定'}</code></td>
                  </tr>
                  <tr>
                    <td>OpenAI API</td>
                    <td><StatusBadge ok={!!systemInfo?.integrations.openai} /></td>
                  </tr>
                  <tr>
                    <td>fincode決済</td>
                    <td><StatusBadge ok={!!systemInfo?.integrations.fincode} /></td>
                  </tr>
                  <tr>
                    <td>Web Push (VAPID)</td>
                    <td><StatusBadge ok={!!systemInfo?.integrations.vapid} /></td>
                  </tr>
                  <tr>
                    <td>LINEログイン</td>
                    <td><StatusBadge ok={!!systemInfo?.integrations.line} /></td>
                  </tr>
                  <tr>
                    <td>Google OAuth</td>
                    <td><StatusBadge ok={!!systemInfo?.integrations.googleOAuth} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚡ 管理リンク</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6>Supabase</h6>
                  <ul className="list-unstyled">
                    <li><a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">📊 Dashboard</a></li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>Vercel</h6>
                  <ul className="list-unstyled">
                    <li><a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">🚀 Dashboard</a></li>
                    <li><a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">🔐 Environment Variables</a></li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>AI・決済</h6>
                  <ul className="list-unstyled">
                    <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">🔑 OpenAI API Keys</a></li>
                    <li><a href="https://dashboard.fincode.jp" target="_blank" rel="noopener noreferrer">💳 fincode Dashboard</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">👤 管理者アカウント</h3>
              <button className="btn btn-sm btn-primary" onClick={() => setShowCreateAdmin(!showCreateAdmin)}>
                ➕ 追加
              </button>
            </div>
            <div className="card-body">
              {showCreateAdmin && (
                <div className="border rounded p-3 mb-3">
                  <h6>新規管理者作成</h6>
                  <div className="mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="ユーザー名"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="パスワード"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <select
                      className="form-select form-select-sm"
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                    >
                      <option value="admin">管理者</option>
                      <option value="superadmin">スーパー管理者</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-success" onClick={createAdmin} disabled={creating}>
                      {creating ? '作成中...' : '作成'}
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setShowCreateAdmin(false)}>
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>ユーザー名</th>
                      <th>役割</th>
                      <th>作成日</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCredentials.map((admin) => (
                      <tr key={admin.id}>
                        <td><strong>{admin.username}</strong></td>
                        <td>
                          <span className={`badge ${admin.role === 'superadmin' ? 'bg-danger' : 'bg-primary'}`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="small text-muted">
                          {new Date(admin.created_at).toLocaleDateString('ja-JP')}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAdmin(admin.id)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {adminCredentials.length === 0 && (
                  <div className="text-center text-muted py-3">管理者アカウントがありません</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
