'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  KeyIcon,
  CogIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

// API設定タイプ
const API_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'DALL-E 3, GPT-4 Vision',
    icon: '🤖',
    endpoints: {
      'dall-e-3': 'DALL-E 3 (画像生成)',
      'gpt-4-vision': 'GPT-4 Vision (画像解析)'
    }
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description: 'Stable Diffusion XL',
    icon: '🎨',
    endpoints: {
      'sdxl': 'Stable Diffusion XL',
      'sdxl-turbo': 'SDXL Turbo (高速版)'
    }
  },
  {
    id: 'runway',
    name: 'Runway ML',
    description: '動画生成AI',
    icon: '🎬',
    endpoints: {
      'gen2': 'Gen-2 (動画生成)',
      'gen1': 'Gen-1 (動画編集)'
    }
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: '高品質イラスト生成',
    icon: '🖼️',
    endpoints: {
      'v6': 'Midjourney v6',
      'niji': 'Niji (アニメスタイル)'
    }
  }
]

// プロンプトテンプレート
const PROMPT_TEMPLATES = [
  {
    id: 'gacha_banner',
    name: 'ガチャバナーテンプレート',
    category: 'banner',
    template: `Create a premium gacha banner for Pokemon card game.
Theme: {{theme}}
Colors: {{colors}}
Style: {{style}}
Size: 1024x1024px
Include: Title "{{title}}", Price "{{price}}", Limited stock indicator`
  },
  {
    id: 'card_rare',
    name: 'レアカードテンプレート',
    category: 'card',
    template: `Generate a {{rarity}} rarity Pokemon trading card.
Pokemon: {{pokemon_name}}
Type: {{type}}
HP: {{hp}}
Include holographic effects and premium card texture`
  },
  {
    id: 'effect_reveal',
    name: '開封演出テンプレート',
    category: 'effect',
    template: `Create a {{duration}} second reveal animation.
Rarity: {{rarity}}
Effects: {{effects}}
Background: {{scene}}
Include particle effects and dramatic lighting`
  }
]

export default function AISettingsPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [selectedProvider, setSelectedProvider] = useState(API_PROVIDERS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    defaultQuality: 'hd',
    defaultStyle: 'vivid',
    maxRetries: 3,
    timeout: 60,
    cacheEnabled: true,
    cacheDuration: 3600,
    rateLimit: 100,
    monthlyBudget: 50000,
    alertThreshold: 80
  })
  const [promptTemplates, setPromptTemplates] = useState(PROMPT_TEMPLATES)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  const saveApiKey = async (provider: string) => {
    setIsLoading(true)
    try {
      // 実際はここでSupabaseに保存
      toast.success(`${provider} APIキーを保存しました`)
    } catch (error) {
      console.error('Error saving API key:', error)
      toast.error('APIキーの保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // 実際はここでSupabaseに保存
      toast.success('設定を保存しました')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('設定の保存に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const testApiConnection = async (provider: string) => {
    setIsLoading(true)
    try {
      // API接続テスト
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKeys[provider] })
      })
      
      if (response.ok) {
        toast.success('API接続テスト成功！')
      } else {
        toast.error('API接続テスト失敗')
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      toast.error('接続テストでエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/admin" className="hover:text-gray-700">
            管理画面
          </Link>
          <span className="mx-2">/</span>
          <Link href="/admin/ai-generator" className="hover:text-gray-700">
            AI生成管理
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">AI設定</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">AI生成設定</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* API設定 */}
        <div className="lg:col-span-2 space-y-6">
          {/* APIキー管理 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center">
                <KeyIcon className="w-5 h-5 mr-2 text-gray-600" />
                APIキー管理
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {API_PROVIDERS.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{provider.icon}</span>
                      <div>
                        <h3 className="font-semibold">{provider.name}</h3>
                        <p className="text-sm text-gray-600">{provider.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => testApiConnection(provider.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      接続テスト
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        value={apiKeys[provider.id] || ''}
                        onChange={(e) => setApiKeys({ ...apiKeys, [provider.id]: e.target.value })}
                        placeholder={`${provider.name} APIキー`}
                        className="flex-1 border-gray-300 rounded-md shadow-sm"
                      />
                      <button
                        onClick={() => saveApiKey(provider.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        保存
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      対応エンドポイント: {Object.values(provider.endpoints).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 生成設定 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center">
                <CogIcon className="w-5 h-5 mr-2 text-gray-600" />
                生成設定
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    デフォルト品質
                  </label>
                  <select
                    value={settings.defaultQuality}
                    onChange={(e) => setSettings({ ...settings, defaultQuality: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="standard">標準</option>
                    <option value="hd">HD (高画質)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    デフォルトスタイル
                  </label>
                  <select
                    value={settings.defaultStyle}
                    onChange={(e) => setSettings({ ...settings, defaultStyle: e.target.value })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="natural">ナチュラル</option>
                    <option value="vivid">ビビッド</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大リトライ回数
                  </label>
                  <input
                    type="number"
                    value={settings.maxRetries}
                    onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイムアウト (秒)
                  </label>
                  <input
                    type="number"
                    value={settings.timeout}
                    onChange={(e) => setSettings({ ...settings, timeout: parseInt(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">キャッシュ設定</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.cacheEnabled}
                      onChange={(e) => setSettings({ ...settings, cacheEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm">生成結果をキャッシュする</span>
                  </label>
                  
                  {settings.cacheEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        キャッシュ保持時間 (秒)
                      </label>
                      <input
                        type="number"
                        value={settings.cacheDuration}
                        onChange={(e) => setSettings({ ...settings, cacheDuration: parseInt(e.target.value) })}
                        className="w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                設定を保存
              </button>
            </div>
          </div>

          {/* プロンプトテンプレート */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-600" />
                プロンプトテンプレート
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {promptTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {template.category}
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingTemplate(template.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      編集
                    </button>
                  </div>
                  
                  {editingTemplate === template.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={template.template}
                        onChange={(e) => {
                          const updated = promptTemplates.map(t =>
                            t.id === template.id ? { ...t, template: e.target.value } : t
                          )
                          setPromptTemplates(updated)
                        }}
                        className="w-full h-32 border-gray-300 rounded-md shadow-sm font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTemplate(null)
                            toast.success('テンプレートを保存しました')
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingTemplate(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {template.template}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1 space-y-6">
          {/* 使用量制限 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2 text-gray-600" />
              使用量制限
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1時間あたりの生成上限
                </label>
                <input
                  type="number"
                  value={settings.rateLimit}
                  onChange={(e) => setSettings({ ...settings, rateLimit: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月間予算上限 (円)
                </label>
                <input
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => setSettings({ ...settings, monthlyBudget: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  アラート閾値 (%)
                </label>
                <input
                  type="number"
                  value={settings.alertThreshold}
                  onChange={(e) => setSettings({ ...settings, alertThreshold: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  予算の{settings.alertThreshold}%に達したら通知
                </p>
              </div>
            </div>
          </div>

          {/* セキュリティ設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-gray-600" />
              セキュリティ設定
            </h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">APIキーを暗号化して保存</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">不適切コンテンツフィルター</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">生成ログを記録</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">IPアドレス制限</span>
              </label>
            </div>
          </div>

          {/* 使用状況サマリー */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="font-semibold text-yellow-800">現在の使用状況</h3>
                <div className="mt-2 text-sm text-yellow-700 space-y-1">
                  <p>今月の使用料金: ¥12,450 / ¥50,000</p>
                  <p>使用率: 24.9%</p>
                  <p>残り日数: 18日</p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '24.9%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}