'use client'

import { useState, useEffect } from 'react'
import { SQUARE_CONFIG } from '@/lib/square/config'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function PaymentPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [userPoints, setUserPoints] = useState({ free: 0, paid: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  
  useEffect(() => {
    fetchUserPoints()
  }, [user])
  
  const fetchUserPoints = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/user/points')
      if (response.ok) {
        const data = await response.json()
        setUserPoints({
          free: data.free_points,
          paid: data.paid_points
        })
      }
    } catch (error) {
      console.error('Failed to fetch points:', error)
    }
  }
  
  const handlePurchase = async (packageIndex: number) => {
    setIsProcessing(true)
    const selectedPkg = SQUARE_CONFIG.pointPackages[packageIndex]
    
    try {
      // Square決済ページへのリダイレクト（実装簡略版）
      toast.success(`${selectedPkg.points + selectedPkg.bonus}ポイントの購入を開始します`)
      
      // 実際の実装では、Square Web Payments SDKを使用
      // またはサーバーサイドでSquare Checkout APIを使用してリダイレクト
      
      // デモ用：ポイント付与のシミュレーション
      setTimeout(() => {
        fetchUserPoints()
        toast.success('ポイントが付与されました！')
        setIsProcessing(false)
      }, 2000)
      
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('購入処理に失敗しました')
      setIsProcessing(false)
    }
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">ログインが必要です</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← トップに戻る
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">ポイント購入</h1>
        
        {/* 現在のポイント */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">現在の所持ポイント</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">無料ポイント</p>
              <p className="text-2xl font-bold text-blue-600">
                {userPoints.free.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">有料ポイント</p>
              <p className="text-2xl font-bold text-green-600">
                {userPoints.paid.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">合計</p>
              <p className="text-2xl font-bold">
                {(userPoints.free + userPoints.paid).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        {/* ポイントパッケージ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">ポイントパッケージを選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SQUARE_CONFIG.pointPackages.map((pkg, index) => (
              <button
                key={index}
                onClick={() => handlePurchase(index)}
                disabled={isProcessing}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-2xl font-bold">{pkg.points}pt</p>
                    {pkg.bonus > 0 && (
                      <p className="text-sm text-green-600 font-semibold">
                        +{pkg.bonus}ptボーナス
                      </p>
                    )}
                  </div>
                  <p className="text-xl font-bold">¥{pkg.price.toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-500">
                  合計 {(pkg.points + pkg.bonus).toLocaleString()}pt
                </p>
                {pkg.bonus > 0 && (
                  <div className="mt-2 bg-green-50 text-green-700 text-xs px-2 py-1 rounded inline-block">
                    {Math.round((pkg.bonus / pkg.points) * 100)}%お得！
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Square決済に関する注意事項 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">決済について</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 決済はSquareの安全な決済システムを使用します</li>
            <li>• クレジットカード・デビットカードがご利用いただけます</li>
            <li>• 購入後、即座にポイントが付与されます</li>
            <li>• 有料ポイントは無料ポイントより優先的に消費されます</li>
          </ul>
        </div>
      </div>
    </main>
  )
}