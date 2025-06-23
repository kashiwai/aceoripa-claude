import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, apiKey } = body

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'プロバイダーとAPIキーが必要です' },
        { status: 400 }
      )
    }

    // 実際のAPI実装では、各プロバイダーのテストエンドポイントを呼び出します
    let testResult = false
    let message = ''

    switch (provider) {
      case 'openai':
        // OpenAI APIのテスト
        // const response = await fetch('https://api.openai.com/v1/models', {
        //   headers: { 'Authorization': `Bearer ${apiKey}` }
        // })
        // testResult = response.ok
        testResult = true // デモ用
        message = 'OpenAI API接続成功'
        break
        
      case 'stability':
        // Stability AI APIのテスト
        testResult = true // デモ用
        message = 'Stability AI API接続成功'
        break
        
      case 'runway':
        // Runway ML APIのテスト
        testResult = true // デモ用
        message = 'Runway ML API接続成功'
        break
        
      case 'midjourney':
        // Midjourney APIのテスト
        testResult = true // デモ用
        message = 'Midjourney API接続成功'
        break
        
      default:
        return NextResponse.json(
          { error: '不明なプロバイダーです' },
          { status: 400 }
        )
    }

    if (testResult) {
      return NextResponse.json({
        success: true,
        message,
        provider
      })
    } else {
      return NextResponse.json(
        { error: 'API接続に失敗しました。APIキーを確認してください。' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error testing API connection:', error)
    return NextResponse.json(
      { error: 'API接続テスト中にエラーが発生しました' },
      { status: 500 }
    )
  }
}