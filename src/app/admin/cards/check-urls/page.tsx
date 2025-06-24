'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  'https://vshkekffhjbvszzpagjt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE'
)

export default function CheckUrlsPage() {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    checkUrls()
  }, [])

  const checkUrls = async () => {
    const { data } = await supabaseAdmin
      .from('pokemon_cards')
      .select('image_url')
      .limit(10)

    const uniqueUrls = [...new Set(data?.map(d => d.image_url) || [])]
    setUrls(uniqueUrls)
  }

  return (
    <div className="container mt-5">
      <h1>データベース内の画像URL確認</h1>
      
      <table className="table">
        <thead>
          <tr>
            <th>URL</th>
            <th>テスト画像</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url, index) => (
            <tr key={index}>
              <td><code>{url}</code></td>
              <td>
                <img 
                  src={url} 
                  alt="Test" 
                  width="100" 
                  height="140"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.border = '2px solid red'
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <p>ファイルシステム上の正確なパス: <code>/images/ngcard.jpg</code> (小文字)</p>
        <img src="/images/ngcard.jpg" alt="Direct test" width="200" />
      </div>
    </div>
  )
}