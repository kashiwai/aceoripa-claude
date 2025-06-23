'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AnnouncementModal } from './AnnouncementModal'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  image_url?: string
  show_popup: boolean
  popup_delay_seconds: number
  cta_text?: string
  cta_url?: string
  is_read?: boolean
}

export default function AnnouncementPopupManager() {
  // データベーステーブル作成後は下記コメントアウトを削除
  // return null
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAnnouncements()
    
    // リアルタイム更新の購読
    const channel = supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          fetchAnnouncements()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements')
      if (response.ok) {
        const data = await response.json()
        // ポップアップ表示が有効で未読のお知らせのみフィルタ
        const popupAnnouncements = data.announcements.filter(
          (a: Announcement) => a.show_popup && !a.is_read
        )
        setAnnouncements(popupAnnouncements)
        
        // 最初のお知らせを表示
        if (popupAnnouncements.length > 0) {
          setTimeout(() => {
            setShowModal(true)
          }, (popupAnnouncements[0].popup_delay_seconds || 0) * 1000)
        }
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    }
  }

  const markAsRead = async (announcementId: string) => {
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId })
      })
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleClose = () => {
    // 現在のお知らせを既読にする
    if (announcements[currentIndex]) {
      markAsRead(announcements[currentIndex].id)
    }
    
    setShowModal(false)
    
    // 次のお知らせがある場合は表示
    if (currentIndex < announcements.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
        setShowModal(true)
      }, 1000) // 1秒後に次を表示
    }
  }

  const handleAction = () => {
    const current = announcements[currentIndex]
    if (current?.cta_url) {
      // 既読にしてからリンクを開く
      markAsRead(current.id)
      window.location.href = current.cta_url
    }
  }

  const currentAnnouncement = announcements[currentIndex]

  if (!currentAnnouncement || !showModal) {
    return null
  }

  return (
    <AnnouncementModal
      isOpen={showModal}
      onClose={handleClose}
      title={currentAnnouncement.title}
      message={currentAnnouncement.content}
      type={currentAnnouncement.type}
      imageUrl={currentAnnouncement.image_url}
      ctaText={currentAnnouncement.cta_text}
      onAction={currentAnnouncement.cta_url ? handleAction : undefined}
    />
  )
}