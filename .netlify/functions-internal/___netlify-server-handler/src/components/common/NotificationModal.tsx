'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  notification: {
    id: string
    title: string
    content: string
    type: 'campaign' | 'info' | 'warning'
    priority: 'high' | 'medium' | 'low'
    imageUrl?: string
  } | null
}

export function NotificationModal({ isOpen, onClose, notification }: NotificationModalProps) {
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    if (isOpen && notification) {
      // 3秒後にCTAボタンを表示
      const timer = setTimeout(() => {
        setShowCTA(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, notification])

  if (!notification) return null

  const getTypeColor = () => {
    switch (notification.type) {
      case 'campaign': return 'from-purple-600 to-pink-600'
      case 'info': return 'from-blue-600 to-cyan-600'
      case 'warning': return 'from-yellow-600 to-orange-600'
      default: return 'from-gray-600 to-gray-800'
    }
  }

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'campaign': return '🎉'
      case 'info': return 'ℹ️'
      case 'warning': return '⚠️'
      default: return '📢'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black bg-opacity-50"
          />
          
          {/* モーダル */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* ヘッダー */}
            <div className={`bg-gradient-to-r ${getTypeColor()} p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getTypeIcon()}</span>
                  <h2 className="text-xl font-bold">{notification.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 画像 */}
            {notification.imageUrl && (
              <div className="relative h-48">
                <img
                  src={notification.imageUrl}
                  alt={notification.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* コンテンツ */}
            <div className="p-6">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: notification.content }}
              />

              {/* 画像生成エンジン専用のCTA */}
              {notification.id === 'auto-generate' && (
                <AnimatePresence>
                  {showCTA && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 space-y-3"
                    >
                      <Link
                        href="/admin/image-generator"
                        className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-3 px-6 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105"
                      >
                        🎨 今すぐ画像生成
                      </Link>
                      <button
                        onClick={onClose}
                        className="block w-full bg-gray-200 text-gray-700 text-center py-2 px-6 rounded-lg hover:bg-gray-300 transition"
                      >
                        後で設定する
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}

              {/* 一般的なCTA */}
              {notification.id !== 'auto-generate' && notification.type === 'campaign' && (
                <AnimatePresence>
                  {showCTA && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <Link
                        href="/gacha"
                        className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 px-6 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
                      >
                        今すぐガチャを回す！
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* フッター */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}