import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface AnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: string
  imageUrl?: string
  ctaText?: string
  onAction?: () => void
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  imageUrl,
  ctaText,
  onAction
}) => {
  if (!isOpen) return null

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'important': return 'from-red-500 to-red-600'
      case 'maintenance': return 'from-yellow-500 to-orange-500'
      case 'campaign': return 'from-purple-500 to-pink-500'
      default: return 'from-blue-500 to-blue-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getTypeColor(type)} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <h2 className="text-xl font-bold pr-8">{title}</h2>
          
          {/* Background decoration */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Content */}
        <div className="p-6">
          {imageUrl && (
            <div className="mb-4">
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full rounded-lg object-cover max-h-48"
              />
            </div>
          )}
          
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
          >
            閉じる
          </button>
          
          {ctaText && onAction && (
            <button
              onClick={onAction}
              className={`flex-1 py-3 px-4 bg-gradient-to-r ${getTypeColor(type)} hover:opacity-90 text-white rounded-lg font-medium transition`}
            >
              {ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}