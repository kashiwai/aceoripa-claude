'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function ConvertImagePage() {
  const [converting, setConverting] = useState(false)
  const [pngDataUrl, setPngDataUrl] = useState<string>('')

  const convertToPng = async () => {
    setConverting(true)
    try {
      // 画像を読み込む
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = '/api/test-image' // APIルート経由で読み込む
      })

      // Canvasに描画
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')
      
      ctx.drawImage(img, 0, 0)
      
      // PNGとして取得
      const pngDataUrl = canvas.toDataURL('image/png')
      setPngDataUrl(pngDataUrl)
      
      // ダウンロードリンクを作成
      const link = document.createElement('a')
      link.download = 'ngcard.png'
      link.href = pngDataUrl
      link.click()
      
      toast.success('PNG変換完了！ダウンロードが開始されます。')
    } catch (error) {
      console.error('Conversion error:', error)
      toast.error('変換に失敗しました')
    } finally {
      setConverting(false)
    }
  }

  const updateAllCards = async () => {
    try {
      const supabaseAdmin = (await import('@supabase/supabase-js')).createClient(
        'https://vshkekffhjbvszzpagjt.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
      )

      // /api/test-imageを使用している全カードを/images/ngcard.pngに更新
      const { error } = await supabaseAdmin
        .from('pokemon_cards')
        .update({ image_url: '/images/ngcard.png' })
        .eq('image_url', '/api/test-image')

      if (error) throw error
      
      toast.success('全カードの画像URLを更新しました')
    } catch (error) {
      console.error('Update error:', error)
      toast.error('更新に失敗しました')
    }
  }

  return (
    <div className="container mt-5">
      <h1>ngcard画像をPNGに変換</h1>
      
      <div className="alert alert-info">
        <p>ngcard.jpgが表示されない問題を解決するため、PNG形式に変換します。</p>
        <ol>
          <li>まず「PNG変換」ボタンをクリックして、ngcard.pngをダウンロード</li>
          <li>ダウンロードしたngcard.pngを /public/images/ フォルダにアップロード</li>
          <li>「データベース更新」ボタンをクリックして、全カードのURLを更新</li>
        </ol>
      </div>

      <div className="mb-4">
        <button 
          className="btn btn-primary me-2"
          onClick={convertToPng}
          disabled={converting}
        >
          {converting ? '変換中...' : 'PNG変換'}
        </button>
        
        <button 
          className="btn btn-success"
          onClick={updateAllCards}
        >
          データベース更新
        </button>
      </div>

      {pngDataUrl && (
        <div>
          <h3>変換結果プレビュー</h3>
          <img 
            src={pngDataUrl} 
            alt="Converted PNG"
            style={{ maxWidth: '300px', border: '1px solid #ddd' }}
          />
          <p className="mt-2">
            <a href={pngDataUrl} download="ngcard.png" className="btn btn-sm btn-secondary">
              再ダウンロード
            </a>
          </p>
        </div>
      )}

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-secondary">カード管理に戻る</a>
      </div>
    </div>
  )
}