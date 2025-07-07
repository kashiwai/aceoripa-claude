'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

interface SystemInfo {
  nextJs: {
    version: string
    environment: string
  }
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey: string
  }
  deployment: {
    vercelUrl?: string
    vercelProjectId?: string
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
  apis: {
    openai: {
      apiKey: string
      organization?: string
      model: string
    }
    imageApis: {
      dalle: {
        enabled: boolean
        model: string
      }
      stability: {
        apiKey?: string
        enabled: boolean
      }
      midjourney: {
        enabled: boolean
        webhookUrl?: string
      }
    }
    payment: {
      stripe: {
        publicKey?: string
        secretKey?: string
        webhookSecret?: string
      }
      paypal: {
        clientId?: string
        clientSecret?: string
      }
    }
    notification: {
      firebase: {
        projectId?: string
        apiKey?: string
      }
      line: {
        channelId?: string
        channelSecret?: string
      }
    }
  }
}

interface AdminCredential {
  id: string
  username: string
  password_hash: string
  role: string
  created_at: string
  last_login?: string
}

export default function SystemPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [adminCredentials, setAdminCredentials] = useState<AdminCredential[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'admin' })
  const [creating, setCreating] = useState(false)
  const [healthCheckRunning, setHealthCheckRunning] = useState(false)

  useEffect(() => {
    fetchSystemInfo()
    fetchAdminCredentials()
  }, [])

  const runHealthCheck = async () => {
    const errors: string[] = []
    let dbConnection = false
    let apiConnection = false
    let storageConnection = false

    // データベース接続チェック
    try {
      const { data, error } = await supabaseAdmin
        .from('gacha_products')
        .select('id')
        .limit(1)
      
      if (error) {
        errors.push(`DB接続エラー: ${error.message}`)
      } else {
        dbConnection = true
      }
    } catch (error) {
      errors.push(`DB接続エラー: ${error}`)
    }

    // API接続チェック（OpenAI）
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        })
        if (response.ok) {
          apiConnection = true
        } else {
          errors.push(`OpenAI API接続エラー: ${response.statusText}`)
        }
      } catch (error) {
        errors.push(`OpenAI API接続エラー: ${error}`)
      }
    }

    // ストレージ接続チェック
    try {
      const { data, error } = await supabaseAdmin
        .storage
        .from('pokemon-cards')
        .list('', { limit: 1 })
      
      if (error) {
        errors.push(`ストレージ接続エラー: ${error.message}`)
      } else {
        storageConnection = true
      }
    } catch (error) {
      errors.push(`ストレージ接続エラー: ${error}`)
    }

    // 必須テーブルの存在チェック
    const requiredTables = ['users', 'pokemon_cards', 'gacha_products', 'gacha_pokemon_pools', 'transactions']
    for (const table of requiredTables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          errors.push(`テーブル '${table}' が見つかりません`)
        }
      } catch (error) {
        errors.push(`テーブル '${table}' のチェックエラー`)
      }
    }

    return {
      dbConnection,
      apiConnection,
      storageConnection,
      errors
    }
  }

  const fetchSystemInfo = async () => {
    try {
      // データベース統計を取得
      const [usersResult, cardsResult, transactionsResult, gachaResult, adminResult] = await Promise.all([
        supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('pokemon_cards').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('transactions').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('gacha_products').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('admin_credentials').select('*', { count: 'exact', head: true })
      ])

      // システムヘルスチェック
      const healthCheck = await runHealthCheck()

      const info: SystemInfo = {
        nextJs: {
          version: '14.2.5',
          environment: process.env.NODE_ENV || 'development'
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vshkekffhjbvszzpagjt.supabase.co',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
        },
        deployment: {
          vercelUrl: process.env.VERCEL_URL,
          vercelProjectId: process.env.VERCEL_PROJECT_ID,
          environment: process.env.VERCEL_ENV || 'development'
        },
        database: {
          totalUsers: usersResult.count || 0,
          totalCards: cardsResult.count || 0,
          totalTransactions: transactionsResult.count || 0,
          totalGachaProducts: gachaResult.count || 0,
          totalAdmins: adminResult.count || 0
        },
        systemHealth: healthCheck,
        apis: {
          openai: {
            apiKey: process.env.OPENAI_API_KEY || '',
            organization: process.env.OPENAI_ORG_ID,
            model: 'gpt-4o'
          },
          imageApis: {
            dalle: {
              enabled: !!process.env.OPENAI_API_KEY,
              model: 'dall-e-3'
            },
            stability: {
              apiKey: process.env.STABILITY_API_KEY,
              enabled: !!process.env.STABILITY_API_KEY
            },
            midjourney: {
              enabled: !!process.env.MIDJOURNEY_WEBHOOK_URL,
              webhookUrl: process.env.MIDJOURNEY_WEBHOOK_URL
            }
          },
          payment: {
            stripe: {
              publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
              secretKey: process.env.STRIPE_SECRET_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
            },
            paypal: {
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
              clientSecret: process.env.PAYPAL_CLIENT_SECRET
            }
          },
          notification: {
            firebase: {
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
            },
            line: {
              channelId: process.env.LINE_CHANNEL_ID,
              channelSecret: process.env.LINE_CHANNEL_SECRET
            }
          }
        }
      }

      setSystemInfo(info)
    } catch (error) {
      console.error('Error fetching system info:', error)
      toast.error('システム情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminCredentials = async () => {
    try {
      // admin_credentialsテーブルがない場合は作成
      const { data, error } = await supabaseAdmin
        .from('admin_credentials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error && error.code === '42P01') {
        // テーブルが存在しない場合は作成
        await createAdminTable()
      } else if (error) {
        throw error
      } else {
        setAdminCredentials(data || [])
      }
    } catch (error) {
      console.error('Error fetching admin credentials:', error)
    }
  }

  const createAdminTable = async () => {
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS admin_credentials (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'admin',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT TRUE
          );
          
          -- RLSを無効化（管理者テーブルなので）
          ALTER TABLE admin_credentials DISABLE ROW LEVEL SECURITY;
        `
      })

      if (error) throw error
      toast.success('管理者テーブルを作成しました')
    } catch (error) {
      console.error('Error creating admin table:', error)
      toast.error('管理者テーブルの作成に失敗しました')
    }
  }

  const createAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      toast.error('ユーザー名とパスワードを入力してください')
      return
    }

    setCreating(true)
    try {
      // パスワードのハッシュ化（実際のプロダクションではbcryptなどを使用）
      const passwordHash = btoa(newAdmin.password) // 簡易的なエンコーディング

      const { error } = await supabaseAdmin
        .from('admin_credentials')
        .insert({
          username: newAdmin.username,
          password_hash: passwordHash,
          role: newAdmin.role
        })

      if (error) throw error

      toast.success('管理者アカウントを作成しました')
      setNewAdmin({ username: '', password: '', role: 'admin' })
      setShowCreateAdmin(false)
      fetchAdminCredentials()
    } catch (error) {
      console.error('Error creating admin:', error)
      toast.error('管理者アカウントの作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const deleteAdmin = async (id: string) => {
    if (!confirm('この管理者アカウントを削除しますか？')) return

    try {
      const { error } = await supabaseAdmin
        .from('admin_credentials')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('管理者アカウントを削除しました')
      fetchAdminCredentials()
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('削除に失敗しました')
    }
  }

  const runFullHealthCheck = async () => {
    setHealthCheckRunning(true)
    try {
      const healthCheck = await runHealthCheck()
      setSystemInfo(prev => prev ? {...prev, systemHealth: healthCheck} : null)
      
      if (healthCheck.errors.length === 0) {
        toast.success('システムヘルスチェック完了: 問題なし')
      } else {
        toast.error(`エラーが${healthCheck.errors.length}件見つかりました`)
      }
    } catch (error) {
      toast.error('ヘルスチェックの実行に失敗しました')
    } finally {
      setHealthCheckRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container-fluid mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">システム設定</h1>
        <button 
          className="btn btn-primary"
          onClick={runFullHealthCheck}
          disabled={healthCheckRunning}
        >
          {healthCheckRunning ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ヘルスチェック実行中...
            </>
          ) : (
            <>
              <i className="bi bi-heart-pulse me-2"></i>
              ヘルスチェック実行
            </>
          )}
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
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className={`mb-2 ${systemInfo.systemHealth.dbConnection ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi ${systemInfo.systemHealth.dbConnection ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-1`}></i>
                      </div>
                      <h6>データベース接続</h6>
                      <span className={`badge ${systemInfo.systemHealth.dbConnection ? 'bg-success' : 'bg-danger'}`}>
                        {systemInfo.systemHealth.dbConnection ? 'OK' : 'エラー'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className={`mb-2 ${systemInfo.systemHealth.apiConnection ? 'text-success' : 'text-warning'}`}>
                        <i className={`bi ${systemInfo.systemHealth.apiConnection ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} fs-1`}></i>
                      </div>
                      <h6>API接続</h6>
                      <span className={`badge ${systemInfo.systemHealth.apiConnection ? 'bg-success' : 'bg-warning'}`}>
                        {systemInfo.systemHealth.apiConnection ? 'OK' : '未設定'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className={`mb-2 ${systemInfo.systemHealth.storageConnection ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi ${systemInfo.systemHealth.storageConnection ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-1`}></i>
                      </div>
                      <h6>ストレージ接続</h6>
                      <span className={`badge ${systemInfo.systemHealth.storageConnection ? 'bg-success' : 'bg-danger'}`}>
                        {systemInfo.systemHealth.storageConnection ? 'OK' : 'エラー'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className={`mb-2 ${systemInfo.systemHealth.errors.length === 0 ? 'text-success' : 'text-danger'}`}>
                        <i className={`bi ${systemInfo.systemHealth.errors.length === 0 ? 'bi-shield-check' : 'bi-shield-x'} fs-1`}></i>
                      </div>
                      <h6>全体ステータス</h6>
                      <span className={`badge ${systemInfo.systemHealth.errors.length === 0 ? 'bg-success' : 'bg-danger'}`}>
                        {systemInfo.systemHealth.errors.length === 0 ? '正常' : `${systemInfo.systemHealth.errors.length}件のエラー`}
                      </span>
                    </div>
                  </div>
                </div>
                
                {systemInfo.systemHealth.errors.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-danger mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      検出されたエラー
                    </h6>
                    <div className="list-group">
                      {systemInfo.systemHealth.errors.map((error, index) => (
                        <div key={index} className="list-group-item list-group-item-danger">
                          <i className="bi bi-x-circle me-2"></i>
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
        {/* システム情報 */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">🔧 システム情報</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Next.js情報 */}
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
                        <td><span className={`badge ${systemInfo?.nextJs.environment === 'production' ? 'bg-success' : 'bg-warning'}`}>
                          {systemInfo?.nextJs.environment}
                        </span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* データベース統計 */}
                <div className="col-md-6 mb-4">
                  <h5>データベース統計</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td>ユーザー数</td>
                        <td><strong>{systemInfo?.database.totalUsers}</strong></td>
                      </tr>
                      <tr>
                        <td>カード数</td>
                        <td><strong>{systemInfo?.database.totalCards}</strong></td>
                      </tr>
                      <tr>
                        <td>取引数</td>
                        <td><strong>{systemInfo?.database.totalTransactions}</strong></td>
                      </tr>
                      <tr>
                        <td>ガチャ商品数</td>
                        <td><strong>{systemInfo?.database.totalGachaProducts}</strong></td>
                      </tr>
                      <tr>
                        <td>管理者数</td>
                        <td><strong>{systemInfo?.database.totalAdmins}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 外部サービス情報 */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">🔗 外部サービス・API情報</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Supabase */}
                <div className="col-12 mb-4">
                  <h5>Supabase</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '200px'}}>URL</td>
                        <td>
                          <a href={systemInfo?.supabase.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            {systemInfo?.supabase.url}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Anon Key</td>
                        <td>
                          <code className="small">{systemInfo?.supabase.anonKey.substring(0, 50)}...</code>
                          <button 
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() => navigator.clipboard.writeText(systemInfo?.supabase.anonKey || '')}
                          >
                            コピー
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>Service Role Key</td>
                        <td>
                          <code className="small">{systemInfo?.supabase.serviceRoleKey.substring(0, 50)}...</code>
                          <button 
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() => navigator.clipboard.writeText(systemInfo?.supabase.serviceRoleKey || '')}
                          >
                            コピー
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Vercel */}
                <div className="col-12 mb-4">
                  <h5>Vercel</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '200px'}}>プロジェクトID</td>
                        <td><code>{systemInfo?.deployment.vercelProjectId || 'N/A'}</code></td>
                      </tr>
                      <tr>
                        <td>デプロイURL</td>
                        <td>
                          {systemInfo?.deployment.vercelUrl ? (
                            <a href={`https://${systemInfo.deployment.vercelUrl}`} target="_blank" rel="noopener noreferrer">
                              {systemInfo.deployment.vercelUrl}
                            </a>
                          ) : 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td>環境</td>
                        <td><span className="badge bg-info">{systemInfo?.deployment.environment}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* AI・画像API情報 */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">🤖 AI・画像API情報</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* OpenAI */}
                <div className="col-md-6 mb-4">
                  <h5>OpenAI</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>API Key</td>
                        <td>
                          {systemInfo?.apis.openai.apiKey ? (
                            <>
                              <code className="small">{systemInfo.apis.openai.apiKey.substring(0, 15)}...</code>
                              <button 
                                className="btn btn-sm btn-outline-secondary ms-2"
                                onClick={() => navigator.clipboard.writeText(systemInfo?.apis.openai.apiKey || '')}
                              >
                                コピー
                              </button>
                            </>
                          ) : (
                            <span className="text-muted">未設定</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Organization</td>
                        <td><code>{systemInfo?.apis.openai.organization || 'N/A'}</code></td>
                      </tr>
                      <tr>
                        <td>Model</td>
                        <td><span className="badge bg-primary">{systemInfo?.apis.openai.model}</span></td>
                      </tr>
                      <tr>
                        <td>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.openai.apiKey ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.openai.apiKey ? '設定済み' : '未設定'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* DALL-E */}
                <div className="col-md-6 mb-4">
                  <h5>DALL-E 3</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.imageApis.dalle.enabled ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.imageApis.dalle.enabled ? '有効' : '無効'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Model</td>
                        <td><span className="badge bg-info">{systemInfo?.apis.imageApis.dalle.model}</span></td>
                      </tr>
                      <tr>
                        <td>依存</td>
                        <td><code>OpenAI API Key</code></td>
                      </tr>
                      <tr>
                        <td>用途</td>
                        <td><small className="text-muted">カード画像生成</small></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Stability AI */}
                <div className="col-md-6 mb-4">
                  <h5>Stability AI</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>API Key</td>
                        <td>
                          {systemInfo?.apis.imageApis.stability.apiKey ? (
                            <>
                              <code className="small">{systemInfo.apis.imageApis.stability.apiKey.substring(0, 15)}...</code>
                              <button 
                                className="btn btn-sm btn-outline-secondary ms-2"
                                onClick={() => navigator.clipboard.writeText(systemInfo?.apis.imageApis.stability.apiKey || '')}
                              >
                                コピー
                              </button>
                            </>
                          ) : (
                            <span className="text-muted">未設定</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.imageApis.stability.enabled ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.imageApis.stability.enabled ? '有効' : '無効'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>用途</td>
                        <td><small className="text-muted">高品質画像生成</small></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Midjourney */}
                <div className="col-md-6 mb-4">
                  <h5>Midjourney</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>Webhook URL</td>
                        <td>
                          {systemInfo?.apis.imageApis.midjourney.webhookUrl ? (
                            <code className="small">{systemInfo.apis.imageApis.midjourney.webhookUrl.substring(0, 30)}...</code>
                          ) : (
                            <span className="text-muted">未設定</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.imageApis.midjourney.enabled ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.imageApis.midjourney.enabled ? '有効' : '無効'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>用途</td>
                        <td><small className="text-muted">アーティスティック画像生成</small></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 決済・通知API情報 */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">💳 決済・通知API情報</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Stripe */}
                <div className="col-md-6 mb-4">
                  <h5>Stripe</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>Public Key</td>
                        <td>
                          {systemInfo?.apis.payment.stripe.publicKey ? (
                            <code className="small">{systemInfo.apis.payment.stripe.publicKey.substring(0, 15)}...</code>
                          ) : (
                            <span className="text-muted">未設定</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Secret Key</td>
                        <td>
                          {systemInfo?.apis.payment.stripe.secretKey ? (
                            <>
                              <code className="small">{systemInfo.apis.payment.stripe.secretKey.substring(0, 15)}...</code>
                              <button 
                                className="btn btn-sm btn-outline-secondary ms-2"
                                onClick={() => navigator.clipboard.writeText(systemInfo?.apis.payment.stripe.secretKey || '')}
                              >
                                コピー
                              </button>
                            </>
                          ) : (
                            <span className="text-muted">未設定</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.payment.stripe.publicKey && systemInfo?.apis.payment.stripe.secretKey ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.payment.stripe.publicKey && systemInfo?.apis.payment.stripe.secretKey ? '設定済み' : '未設定'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* PayPal */}
                <div className="col-md-6 mb-4">
                  <h5>PayPal</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>Client ID</td>
                        <td>
                          {systemInfo?.apis.payment.paypal.clientId ? (
                            <code className="small">{systemInfo.apis.payment.paypal.clientId.substring(0, 15)}...</code>
                          ) : (
                            <span className="text-muted">未設定</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.payment.paypal.clientId ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.payment.paypal.clientId ? '設定済み' : '未設定'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Firebase */}
                <div className="col-md-6 mb-4">
                  <h5>Firebase (通知)</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>Project ID</td>
                        <td><code>{systemInfo?.apis.notification.firebase.projectId || 'N/A'}</code></td>
                      </tr>
                      <tr>
                        <td>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.notification.firebase.projectId ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.notification.firebase.projectId ? '設定済み' : '未設定'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* LINE */}
                <div className="col-md-6 mb-4">
                  <h5>LINE Messaging API</h5>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td style={{width: '120px'}}>Channel ID</td>
                        <td><code>{systemInfo?.apis.notification.line.channelId || 'N/A'}</code></td>
                      </tr>
                      <tr>
                        <td>状態</td>
                        <td>
                          <span className={`badge ${systemInfo?.apis.notification.line.channelId ? 'bg-success' : 'bg-danger'}`}>
                            {systemInfo?.apis.notification.line.channelId ? '設定済み' : '未設定'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 管理リンク */}
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
                    <li><a href="https://supabase.com/dashboard/project/vshkekffhjbvszzpagjt/editor" target="_blank" rel="noopener noreferrer">📝 SQL Editor</a></li>
                    <li><a href="https://supabase.com/dashboard/project/vshkekffhjbvszzpagjt/auth/users" target="_blank" rel="noopener noreferrer">👥 Auth Users</a></li>
                    <li><a href="https://supabase.com/dashboard/project/vshkekffhjbvszzpagjt/storage/buckets" target="_blank" rel="noopener noreferrer">📁 Storage</a></li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>Vercel</h6>
                  <ul className="list-unstyled">
                    <li><a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">🚀 Dashboard</a></li>
                    <li><a href="https://vercel.com/settings/environment-variables" target="_blank" rel="noopener noreferrer">🔐 Environment Variables</a></li>
                    <li><a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer">📈 Analytics</a></li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6>AI・API</h6>
                  <ul className="list-unstyled">
                    <li><a href="https://platform.openai.com/dashboard" target="_blank" rel="noopener noreferrer">🤖 OpenAI Dashboard</a></li>
                    <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">🔑 OpenAI API Keys</a></li>
                    <li><a href="https://platform.stability.ai/account/credits" target="_blank" rel="noopener noreferrer">🎨 Stability AI</a></li>
                    <li><a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">💳 Stripe Dashboard</a></li>
                    <li><a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer">🔔 Firebase Console</a></li>
                    <li><a href="https://developers.line.biz/console" target="_blank" rel="noopener noreferrer">📱 LINE Developers</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 管理者アカウント管理 */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">👤 管理者アカウント</h3>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
              >
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
                      onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="パスワード"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    />
                  </div>
                  <div className="mb-2">
                    <select 
                      className="form-select form-select-sm"
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                    >
                      <option value="admin">管理者</option>
                      <option value="superadmin">スーパー管理者</option>
                    </select>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={createAdmin}
                      disabled={creating}
                    >
                      {creating ? '作成中...' : '作成'}
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowCreateAdmin(false)}
                    >
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
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteAdmin(admin.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {adminCredentials.length === 0 && (
                  <div className="text-center text-muted py-3">
                    管理者アカウントがありません
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}