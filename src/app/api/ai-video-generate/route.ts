import { NextRequest, NextResponse } from 'next/server';
import { generateOpenAIGachaVideo } from '@/lib/ai/openai-video-api';
import { generateGachaVideo } from '@/lib/ai/leonardo-video-api';

export async function POST(request: NextRequest) {
  try {
    const { pokemonName, pokemonType, rarity, preferredService } = await request.json();

    if (!pokemonName || !pokemonType || !rarity) {
      return NextResponse.json({
        error: 'Missing required parameters: pokemonName, pokemonType, rarity'
      }, { status: 400 });
    }

    console.log(`🎬 AI動画生成開始: ${pokemonName} (${pokemonType}) - ${rarity}`);
    console.log(`優先サービス: ${preferredService || 'auto'}`);

    let result;
    let serviceUsed = '';

    // OpenAI (DALL-E 3 + アニメーション) を試行
    if (preferredService === 'openai' || preferredService === 'auto' || !preferredService) {
      try {
        console.log('🤖 OpenAI DALL-E 3での生成を試行...');
        result = await generateOpenAIGachaVideo(pokemonName, pokemonType, rarity);
        serviceUsed = 'OpenAI DALL-E 3';
        console.log('✅ OpenAI生成成功:', result);
      } catch (error) {
        console.warn('⚠️ OpenAI生成失敗:', error);
        if (preferredService === 'openai') {
          throw error;
        }
      }
    }

    // Leonardo.aiをフォールバックとして試行
    if (!result && (preferredService === 'leonardo' || preferredService === 'auto' || !preferredService)) {
      try {
        console.log('🎨 Leonardo.aiでの生成を試行...');
        result = await generateGachaVideo(pokemonName, pokemonType, rarity);
        serviceUsed = 'Leonardo.ai';
        console.log('✅ Leonardo生成成功:', result);
      } catch (error) {
        console.warn('⚠️ Leonardo生成失敗:', error);
        if (preferredService === 'leonardo') {
          throw error;
        }
      }
    }

    if (!result) {
      throw new Error('すべての動画生成サービスが利用できません');
    }

    return NextResponse.json({
      success: true,
      data: result,
      serviceUsed,
      pokemonName,
      rarity
    });

  } catch (error) {
    console.error('❌ AI動画生成エラー:', error);
    
    return NextResponse.json({
      error: 'AI動画生成に失敗しました',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}