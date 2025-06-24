import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Canvas機能は一時的に無効化
    // Vercelデプロイ用に簡略化
    return NextResponse.json({
      error: 'Banner generation is temporarily disabled',
      message: 'Please use pre-generated banners or AI-generated images'
    }, { status: 503 })
  } catch (error) {
    console.error('Banner generation error:', error)
    return NextResponse.json({
      error: 'Banner generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}