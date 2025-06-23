'use client'

import Link from 'next/link'
import { 
  PhotoIcon, 
  SparklesIcon, 
  VideoCameraIcon, 
  CubeIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const AI_TOOLS = [
  {
    title: 'ガチャバナー生成',
    description: '1024×1024の高品質ガチャバナーをAIで自動生成',
    href: '/admin/ai-generator/gacha-banner',
    icon: PhotoIcon,
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    features: ['DALL-E 3使用', 'DOPAスタイル準拠', '即座に使用可能']
  },
  {
    title: 'カード画像生成',
    description: 'ポケモンカード風の画像をAIで生成',
    href: '/admin/ai-generator/card-image',
    icon: SparklesIcon,
    color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    features: ['レアリティ別デザイン', 'ホログラム効果', '背景自動生成']
  },
  {
    title: '演出動画生成',
    description: 'ガチャ演出用の動画をAIで自動作成',
    href: '/admin/ai-generator/effect-video',
    icon: VideoCameraIcon,
    color: 'bg-gradient-to-r from-green-600 to-emerald-600',
    features: ['レアリティ別演出', 'パーティクル効果', 'サウンド付き']
  },
  {
    title: '3Dモデル生成',
    description: 'カード表示用の3DモデルをAI生成',
    href: '/admin/ai-generator/3d-model',
    icon: CubeIcon,
    color: 'bg-gradient-to-r from-orange-600 to-red-600',
    features: ['リアルタイム表示', '回転アニメーション', 'WebGL対応']
  },
  {
    title: 'AI分析ダッシュボード',
    description: '生成コンテンツの効果を分析',
    href: '/admin/ai-generator/analytics',
    icon: ChartBarIcon,
    color: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    features: ['コンバージョン率', 'ユーザー反応', 'A/Bテスト']
  },
  {
    title: 'AI設定',
    description: 'AI生成の詳細設定とAPI管理',
    href: '/admin/ai-generator/settings',
    icon: Cog6ToothIcon,
    color: 'bg-gradient-to-r from-gray-600 to-gray-800',
    features: ['API使用量', 'プロンプト管理', 'コスト管理']
  }
]

export default function AIGeneratorPage() {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">AI生成管理</h1>
          <p className="text-muted">
            AIを活用してガチャバナー、カード画像、演出効果を自動生成します
          </p>
        </div>
      </div>

      <div className="row">
        {AI_TOOLS.map((tool) => (
          <div key={tool.href} className="col-xl-4 col-lg-6 mb-4">
            <Link
              href={tool.href}
              className="card h-100 text-decoration-none border-0 shadow-sm"
              style={{transition: 'all 0.3s ease'}}
            >
              <div className="card-body">
                {/* アイコン */}
                <div className="d-flex align-items-center mb-3">
                  <div className="p-2 rounded" style={{backgroundColor: getBootstrapColor(tool.color)}}>
                    <tool.icon className="text-white" style={{width: '24px', height: '24px'}} />
                  </div>
                  <h5 className="card-title mb-0 ms-3">{tool.title}</h5>
                </div>
                
                <p className="card-text text-muted mb-3">
                  {tool.description}
                </p>
                
                {/* 機能リスト */}
                <div className="mb-3">
                  {tool.features.map((feature, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-1">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <small className="text-muted">{feature}</small>
                    </div>
                  ))}
                </div>
                
                <div className="d-flex justify-content-end">
                  <i className="bi bi-arrow-right text-primary"></i>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 使用状況サマリー */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h4 className="card-title">今月のAI使用状況</h4>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <small className="text-light">バナー生成数</small>
                    <h3 className="mb-0">24</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <small className="text-light">カード生成数</small>
                    <h3 className="mb-0">156</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <small className="text-light">演出動画数</small>
                    <h3 className="mb-0">8</h3>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="text-center">
                    <small className="text-light">API使用料金</small>
                    <h3 className="mb-0">¥3,250</h3>
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

// Bootstrapの色に変換するヘルパー関数
function getBootstrapColor(gradientClass: string): string {
  if (gradientClass.includes('purple')) return '#6f42c1'
  if (gradientClass.includes('blue')) return '#0d6efd'
  if (gradientClass.includes('green')) return '#198754'
  if (gradientClass.includes('orange') || gradientClass.includes('red')) return '#dc3545'
  if (gradientClass.includes('indigo')) return '#6610f2'
  if (gradientClass.includes('gray')) return '#6c757d'
  return '#0d6efd' // デフォルト
}