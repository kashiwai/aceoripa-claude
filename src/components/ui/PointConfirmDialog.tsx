'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

interface PointConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName: string
  count: number
  price: number
  totalCost: number
}

export default function PointConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  productName,
  count,
  price,
  totalCost
}: PointConfirmDialogProps) {
  const { points } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const hasEnoughPoints = points >= totalCost

  const handleConfirm = async () => {
    if (!hasEnoughPoints) {
      // ポイント不足の場合は課金ページへ
      window.location.href = '/purchase'
      return
    }

    setIsLoading(true)
    await onConfirm()
    setIsLoading(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />

          {/* ダイアログ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] p-6">
              <h2 className="text-2xl font-black text-white text-center">
                ガチャ購入確認
              </h2>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-6">
              {/* 商品情報 */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">{productName}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>回数</span>
                    <span className="font-bold">{count}回</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>単価</span>
                    <span className="font-bold">¥{price}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between text-white">
                      <span className="font-bold">合計</span>
                      <span className="text-2xl font-black text-[#FF0033]">¥{totalCost}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ポイント情報 */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-2">所持ポイント</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">現在のポイント</span>
                    <span className={`text-xl font-bold ${hasEnoughPoints ? 'text-green-400' : 'text-red-400'}`}>
                      {points.toLocaleString()}pt
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">必要ポイント</span>
                    <span className="text-xl font-bold text-white">
                      -{totalCost.toLocaleString()}pt
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">購入後</span>
                      <span className={`text-xl font-black ${hasEnoughPoints ? 'text-white' : 'text-red-400'}`}>
                        {hasEnoughPoints ? (points - totalCost).toLocaleString() : '不足'}pt
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 警告メッセージ */}
              {!hasEnoughPoints && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500 rounded-lg p-4"
                >
                  <p className="text-red-400 text-sm font-bold">
                    ⚠️ ポイントが不足しています。購入するにはポイントをチャージしてください。
                  </p>
                </motion.div>
              )}

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition"
                  disabled={isLoading}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 font-bold py-3 rounded-xl transition ${
                    hasEnoughPoints
                      ? 'bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white hover:scale-105'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:scale-105'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      処理中...
                    </span>
                  ) : hasEnoughPoints ? (
                    'ガチャを引く'
                  ) : (
                    'ポイントチャージ'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}