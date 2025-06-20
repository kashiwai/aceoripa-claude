'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Notification {
  id: string
  title: string
  content: string
  imageUrl?: string
  type: 'info' | 'campaign' | 'warning' | 'update'
  priority: 'high' | 'medium' | 'low'
  showOnlyOnce?: boolean
  validUntil?: string
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  notification: Notification | null
}

export function NotificationModal({ isOpen, onClose, notification }: NotificationModalProps) {
  if (!notification) return null

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'campaign': return '🎉'
      case 'warning': return '⚠️'
      case 'update': return '🆕'
      default: return 'ℹ️'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'campaign': return 'from-yellow-400 to-orange-500'
      case 'warning': return 'from-red-400 to-red-600'
      case 'update': return 'from-blue-400 to-blue-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getTypeColor(notification.type)} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  <h2 className="text-lg font-bold">{notification.title}</h2>
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

            {/* Image */}
            {notification.imageUrl && (
              <div className="relative h-48">
                <Image
                  src={notification.imageUrl}
                  alt={notification.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: notification.content }}
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className={`w-full bg-gradient-to-r ${getTypeColor(notification.type)} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition`}
              >
                確認
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}