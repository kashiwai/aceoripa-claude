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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI生成管理</h1>
        <p className="text-gray-600 mt-2">
          AIを活用してガチャバナー、カード画像、演出効果を自動生成します
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AI_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {/* グラデーション背景 */}
            <div className={`absolute inset-0 ${tool.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative p-6">
              {/* アイコン */}
              <div className={`inline-flex p-3 rounded-lg ${tool.color} text-white mb-4`}>
                <tool.icon className="w-8 h-8" />
              </div>
              
              {/* タイトルと説明 */}
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {tool.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {tool.description}
              </p>
              
              {/* 機能リスト */}
              <div className="space-y-1">
                {tool.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
              
              {/* 矢印アイコン */}
              <div className="absolute bottom-4 right-4 transform translate-x-2 group-hover:translate-x-0 transition-transform">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 使用状況サマリー */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">今月のAI使用状況</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-blue-100 text-sm">バナー生成数</p>
            <p className="text-3xl font-bold">24</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">カード生成数</p>
            <p className="text-3xl font-bold">156</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">演出動画数</p>
            <p className="text-3xl font-bold">8</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">API使用料金</p>
            <p className="text-3xl font-bold">¥3,250</p>
          </div>
        </div>
      </div>
    </div>
  )
}