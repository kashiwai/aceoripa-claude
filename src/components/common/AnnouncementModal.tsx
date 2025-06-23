'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'news' | 'maintenance' | 'campaign' | 'important' | string
  imageUrl?: string
  ctaText?: string
  onAction?: () => void
}

export function AnnouncementModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type, 
  imageUrl, 
  ctaText, 
  onAction 
}: AnnouncementModalProps) {

  const getTypeColor = () => {
    switch (type) {
      case 'campaign': return 'from-purple-600 to-pink-600'
      case 'important': return 'from-red-600 to-orange-600'
      case 'maintenance': return 'from-yellow-600 to-orange-600'
      case 'news': return 'from-blue-600 to-cyan-600'
      default: return 'from-gray-600 to-gray-800'
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'campaign': return '🎉'
      case 'important': return '‼️'
      case 'maintenance': return '🔧'
      case 'news': return '📰'
      default: return '📢'
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'campaign': return 'キャンペーン'
      case 'important': return '重要なお知らせ'
      case 'maintenance': return 'メンテナンス'
      case 'news': return 'ニュース'
      default: return 'お知らせ'
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
                  <div>
                    <p className="text-sm opacity-80">{getTypeLabel()}</p>
                    <h2 className="text-xl font-bold">{title}</h2>
                  </div>
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
            {imageUrl && (
              <div className="relative h-48">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* コンテンツ */}
            <div className="p-6">
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: message }}
              />

              {/* CTAボタン */}
              {ctaText && onAction && (
                <div className="mt-6">
                  <button
                    onClick={onAction}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 px-6 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
                  >
                    {ctaText}
                  </button>
                </div>
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