'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
// import { useAuth } from '@/hooks/useAuth'
// import { toast } from 'react-hot-toast'

// ポイントパッケージ
const POINT_PACKAGES = [
  {
    id: 'pack_100',
    points: 100,
    price: 100,
    label: 'お試し',
    popular: false,
    bonus: 0
  },
  {
    id: 'pack_500',
    points: 500,
    price: 500,
    label: 'スタンダード',
    popular: false,
    bonus: 0
  },
  {
    id: 'pack_1000',
    points: 1100,
    price: 1000,
    label: '人気No.1',
    popular: true,
    bonus: 100
  },
  {
    id: 'pack_3000',
    points: 3300,
    price: 3000,
    label: 'お得',
    popular: false,
    bonus: 300
  },
  {
    id: 'pack_5000',
    points: 5500,
    price: 5000,
    label: '大容量',
    popular: false,
    bonus: 500
  },
  {
    id: 'pack_10000',
    points: 11500,
    price: 10000,
    label: '超お得',
    popular: false,
    bonus: 1500
  }
]

export default function PurchasePage() {
  const router = useRouter()
  // const { user, points } = useAuth()
  const user = null // 一時的にnullに設定
  const points = 3000 // 一時的なサンプル値
  const [selectedPackage, setSelectedPackage] = useState<typeof POINT_PACKAGES[0] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async () => {
    if (!selectedPackage) {
      alert('パッケージを選択してください')
      return
    }

    if (!user) {
      router.push('/login')
      return
    }

    setIsProcessing(true)
    
    try {
      // ここで実際の決済処理を行う
      // Stripe, PayPay, メルペイなどの決済APIを呼び出す
      
      // デモ用: 3秒待機して成功をシミュレート
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 成功メッセージ
      alert(`${selectedPackage.points}ポイントを購入しました！`)
      
      // トップページへ戻る
      router.push('/')
    } catch (error) {
      alert('購入処理に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-3xl font-black text-[#FF0033]">
                ポイント購入
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">現在のポイント</span>
              <span className="text-2xl font-black text-[#FF0033]">
                {points.toLocaleString()}pt
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* アラート */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-yellow-400 font-bold">
              ポイントが不足しています。ガチャを引くにはポイントを購入してください。
            </p>
          </div>
        </div>

        {/* ポイントパッケージ一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POINT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all ${
                selectedPackage?.id === pkg.id
                  ? 'ring-4 ring-[#FF0033] scale-105'
                  : 'hover:scale-102 hover:ring-2 hover:ring-white/50'
              }`}
            >
              {/* 人気ラベル */}
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white text-xs font-bold px-4 py-2 rounded-bl-xl">
                  人気No.1
                </div>
              )}

              {/* ボーナス表示 */}
              {pkg.bonus > 0 && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full">
                  +{pkg.bonus}ボーナス
                </div>
              )}

              <div className="p-6 space-y-4">
                {/* ポイント数 */}
                <div className="text-center">
                  <p className="text-5xl font-black text-white">
                    {pkg.points.toLocaleString()}
                  </p>
                  <p className="text-xl text-gray-400">ポイント</p>
                </div>

                {/* 価格 */}
                <div className="text-center bg-gray-800 rounded-xl p-4">
                  <p className="text-3xl font-black text-[#FF0033]">
                    ¥{pkg.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    (¥{(pkg.price / pkg.points).toFixed(2)}/pt)
                  </p>
                </div>

                {/* ラベル */}
                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {pkg.label}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 決済方法 */}
        <div className="mt-12 bg-gray-900 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">決済方法</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition">
              <Image
                src="/images/payment/credit-card.png"
                alt="クレジットカード"
                width={60}
                height={40}
                className="mx-auto mb-2"
              />
              <p className="text-xs text-gray-300">クレジットカード</p>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition">
              <Image
                src="/images/payment/paypay.png"
                alt="PayPay"
                width={60}
                height={40}
                className="mx-auto mb-2"
              />
              <p className="text-xs text-gray-300">PayPay</p>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition">
              <Image
                src="/images/payment/merpay.png"
                alt="メルペイ"
                width={60}
                height={40}
                className="mx-auto mb-2"
              />
              <p className="text-xs text-gray-300">メルペイ</p>
            </button>
            <button className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 transition">
              <Image
                src="/images/payment/convenience.png"
                alt="コンビニ"
                width={60}
                height={40}
                className="mx-auto mb-2"
              />
              <p className="text-xs text-gray-300">コンビニ</p>
            </button>
          </div>
        </div>

        {/* 購入ボタン */}
        <div className="mt-8 sticky bottom-0 bg-gradient-to-t from-[#1a1a1a] to-transparent pb-4 pt-8">
          <button
            onClick={handlePurchase}
            disabled={!selectedPackage || isProcessing}
            className={`w-full py-6 rounded-2xl font-black text-xl transition-all ${
              selectedPackage && !isProcessing
                ? 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white hover:scale-105 shadow-2xl'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                処理中...
              </span>
            ) : selectedPackage ? (
              `¥${selectedPackage.price.toLocaleString()} で ${selectedPackage.points.toLocaleString()}pt 購入する`
            ) : (
              'パッケージを選択してください'
            )}
          </button>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>※ 購入したポイントの有効期限は購入日から180日間です</p>
          <p>※ 購入後のキャンセル・返金はできません</p>
        </div>
      </div>
    </div>
  )
}