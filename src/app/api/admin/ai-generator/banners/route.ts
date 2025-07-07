import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // データベースから全バナーを取得
    const { data: banners, error } = await supabase
      .from('ai_generated_banners')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Database error:', error)
      // テーブルがない場合はローカルストレージのデモデータを返す
      return NextResponse.json({
        banners: getDemoBanners()
      })
    }
    
    return NextResponse.json({ banners: banners || [] })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json({ banners: getDemoBanners() })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    
    const banner = {
      url: data.url,
      original_url: data.originalUrl,
      type: data.type,
      name: data.name || '新規バナー',
      prompt: data.prompt,
      has_text: data.hasText || false,
      current_usage: 'none',
      metadata: data.metadata || {}
    }
    
    const { data: newBanner, error } = await supabase
      .from('ai_generated_banners')
      .insert([banner])
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      // エラー時はローカルのデモとして返す
      return NextResponse.json({
        banner: { ...banner, id: Date.now().toString(), created_at: new Date().toISOString() }
      })
    }
    
    return NextResponse.json({ banner: newBanner })
  } catch (error) {
    console.error('Error saving banner:', error)
    return NextResponse.json(
      { error: 'バナーの保存に失敗しました' },
      { status: 500 }
    )
  }
}

// デモ用のバナーデータ
function getDemoBanners() {
  return [
    {
      id: '1',
      url: 'https://via.placeholder.com/300x300/667eea/ffffff?text=Sample+Banner+1',
      type: 'square',
      name: 'ピカチュウ大祭り',
      prompt: 'Pikachu festival banner',
      hasText: true,
      currentUsage: 'gacha-list',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      id: '2',
      url: 'https://via.placeholder.com/375x200/ff6b6b/ffffff?text=Mobile+Banner',
      type: 'top-mobile',
      name: '新ガチャ告知',
      prompt: 'New gacha announcement',
      hasText: true,
      currentUsage: 'top-slider',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: '3',
      url: 'https://via.placeholder.com/1920x400/4ecdc4/ffffff?text=Desktop+Banner',
      type: 'top-desktop',
      name: 'キャンペーンバナー',
      prompt: 'Campaign banner',
      hasText: false,
      currentUsage: 'campaign',
      createdAt: new Date().toISOString()
    }
  ]
}