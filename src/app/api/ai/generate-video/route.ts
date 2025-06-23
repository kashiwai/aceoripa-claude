import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { effectType, scene, settings, prompt } = body

    console.log('Video generation request:', {
      effectType,
      scene,
      settings,
      prompt
    })

    // 現在はモック実装（デモ用）
    // 実際の動画生成AIサービスとの連携は今後実装予定
    
    // シミュレーションのため少し待機
    await new Promise(resolve => setTimeout(resolve, 2000))

    // モックデータ生成
    const timestamp = Date.now()
    const effectTypeMap = {
      normal_reveal: 'ノーマル開封',
      rare_reveal: 'レア開封', 
      super_rare_reveal: 'スーパーレア開封',
      ultra_rare_reveal: 'ウルトラレア開封',
      gacha_animation: 'ガチャ回転演出'
    }

    // サンプル動画URL（実際のプロジェクトでは本物の動画ファイル）
    const sampleVideoUrl = getSampleVideoUrl(effectType)
    const sampleThumbnail = getSampleThumbnailUrl(effectType)
    
    return NextResponse.json({
      videoUrl: sampleVideoUrl,
      thumbnail: sampleThumbnail,
      duration: getDurationByEffect(effectType),
      format: 'mp4',
      resolution: settings.resolution || '1080p',
      fps: settings.fps || '60',
      effectName: effectTypeMap[effectType as keyof typeof effectTypeMap] || 'カスタム演出',
      createdAt: new Date().toISOString(),
      status: 'completed'
    })

  } catch (error) {
    console.error('Error generating video:', error)
    return NextResponse.json(
      { error: '動画生成中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// サンプル動画URL取得
function getSampleVideoUrl(effectType: string): string {
  // 実際のプロジェクトでは、public/videos/samples/ に配置されたサンプル動画
  const videoMap = {
    normal_reveal: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    rare_reveal: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    super_rare_reveal: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    ultra_rare_reveal: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    gacha_animation: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  }

  return videoMap[effectType as keyof typeof videoMap] || videoMap.normal_reveal
}

// サンプルサムネイル取得
function getSampleThumbnailUrl(effectType: string): string {
  const thumbnailMap = {
    normal_reveal: 'https://via.placeholder.com/640x360/4ade80/ffffff?text=Normal+Reveal',
    rare_reveal: 'https://via.placeholder.com/640x360/3b82f6/ffffff?text=Rare+Reveal',
    super_rare_reveal: 'https://via.placeholder.com/640x360/a855f7/ffffff?text=Super+Rare',
    ultra_rare_reveal: 'https://via.placeholder.com/640x360/f59e0b/ffffff?text=Ultra+Rare',
    gacha_animation: 'https://via.placeholder.com/640x360/ef4444/ffffff?text=Gacha+Animation'
  }

  return thumbnailMap[effectType as keyof typeof thumbnailMap] || thumbnailMap.normal_reveal
}

// エフェクトタイプ別の動画長さ
function getDurationByEffect(effectType: string): string {
  const durations = {
    normal_reveal: '3秒',
    rare_reveal: '5秒',
    super_rare_reveal: '8秒',
    ultra_rare_reveal: '12秒',
    gacha_animation: '10秒'
  }

  return durations[effectType as keyof typeof durations] || '5秒'
}