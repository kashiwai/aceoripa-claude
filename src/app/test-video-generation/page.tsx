'use client';

import { useState } from 'react';
import { AIVideoGenerator } from '@/components/effects/AIVideoGenerator';

export default function TestAIVideoPage() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState({
    name: 'ピカチュウ',
    type: 'electric',
    rarity: 'SSR' as const
  });
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);

  const pokemonList = [
    { name: 'ピカチュウ', type: 'electric', emoji: '⚡' },
    { name: 'リザードン', type: 'fire', emoji: '🔥' },
    { name: 'ゼニガメ', type: 'water', emoji: '💧' },
    { name: 'フシギダネ', type: 'grass', emoji: '🌱' },
    { name: 'イーブイ', type: 'normal', emoji: '✨' },
    { name: 'ルカリオ', type: 'fighting', emoji: '👊' },
    { name: 'ガルデvoir', type: 'psychic', emoji: '🔮' },
    { name: 'ギャラドス', type: 'water', emoji: '🐉' }
  ];

  const handleVideoComplete = (videoUrl: string) => {
    console.log('✅ Generated video URL:', videoUrl);
    setGeneratedVideos(prev => [videoUrl, ...prev]);
    setShowGenerator(false);
    
    // 成功通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎬 AI動画生成完了！', {
        body: `${selectedPokemon.name}の${selectedPokemon.rarity}演出が完成しました`,
        icon: '/favicon.ico'
      });
    }
  };

  const handleError = (error: string) => {
    console.error('❌ Video generation error:', error);
    alert(`動画生成エラー: ${error}`);
    setShowGenerator(false);
  };

  const startGeneration = () => {
    // 通知許可をリクエスト
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    setShowGenerator(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🎬 AI動画生成テスト
          </h1>
          <p className="text-lg text-gray-300">
            OpenAI Sora / Leonardo.ai でポケモンガチャ演出を生成
          </p>
        </div>

        {/* 設定パネル */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-center">生成設定</h2>
            
            {/* ポケモン選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">ポケモン選択</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pokemonList.map((pokemon) => (
                  <button
                    key={pokemon.name}
                    onClick={() => setSelectedPokemon({
                      ...selectedPokemon,
                      name: pokemon.name,
                      type: pokemon.type
                    })}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedPokemon.name === pokemon.name
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pokemon.emoji}</div>
                    <div className="text-sm font-medium">{pokemon.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* レアリティ選択 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">レアリティ</label>
              <div className="grid grid-cols-4 gap-3">
                {(['SSR', 'SR', 'R', 'N'] as const).map((rarity) => (
                  <button
                    key={rarity}
                    onClick={() => setSelectedPokemon({...selectedPokemon, rarity})}
                    className={`p-3 rounded-lg text-center font-bold transition-all ${
                      selectedPokemon.rarity === rarity
                        ? getRarityButtonStyle(rarity, true)
                        : getRarityButtonStyle(rarity, false)
                    }`}
                  >
                    {rarity}
                  </button>
                ))}
              </div>
            </div>

            {/* 生成予測時間 */}
            <div className="mb-6 p-4 bg-blue-500/20 rounded-lg">
              <h3 className="font-semibold mb-2">📊 予測生成時間</h3>
              <div className="text-sm space-y-1">
                <div>• SSR: 3-5分（最高品質・複雑エフェクト）</div>
                <div>• SR: 2-3分（高品質・派手エフェクト）</div>
                <div>• R: 1-2分（標準品質・美しいエフェクト）</div>
                <div>• N: 30秒-1分（シンプル・高速生成）</div>
              </div>
            </div>

            {/* 生成ボタン */}
            <button
              onClick={startGeneration}
              disabled={showGenerator}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 active:scale-95"
            >
              {showGenerator ? (
                <>
                  <span className="inline-block animate-spin mr-2">🎬</span>
                  生成中...
                </>
              ) : (
                <>
                  🚀 AI動画生成開始
                </>
              )}
            </button>

            {/* 現在の設定表示 */}
            <div className="mt-4 text-center text-sm text-gray-300">
              {selectedPokemon.name} ({selectedPokemon.type}) - {selectedPokemon.rarity}
            </div>
          </div>
        </div>

        {/* 生成された動画一覧 */}
        {generatedVideos.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              🎥 生成された動画 ({generatedVideos.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedVideos.map((videoUrl, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg mb-3"
                    style={{ aspectRatio: '9/16' }}
                    poster="/images/video-placeholder.png"
                  />
                  <div className="text-center">
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = videoUrl;
                        a.download = `pokemon-gacha-${Date.now()}.mp4`;
                        a.click();
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      📥 ダウンロード
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API情報 */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-green-300 mb-2">✅ API設定状況</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>OpenAI API:</span>
                <span className="text-green-300">設定済み</span>
              </div>
              <div className="flex justify-between">
                <span>Leonardo API:</span>
                <span className="text-yellow-300">オプション</span>
              </div>
              <div className="flex justify-between">
                <span>対応フォーマット:</span>
                <span>9:16 縦型</span>
              </div>
            </div>
          </div>
        </div>

        {/* 使用方法 */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-300 mb-2">🔧 使用方法</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>上記でポケモンとレアリティを選択</li>
              <li>「AI動画生成開始」ボタンをクリック</li>
              <li>生成完了まで待機（数分かかります）</li>
              <li>完成した動画をプレビュー・ダウンロード</li>
            </ol>
          </div>
        </div>
      </div>

      {/* AI動画生成コンポーネント */}
      {showGenerator && (
        <AIVideoGenerator
          pokemonName={selectedPokemon.name}
          pokemonType={selectedPokemon.type}
          rarity={selectedPokemon.rarity}
          onComplete={handleVideoComplete}
          onError={handleError}
          preferredService="auto"
        />
      )}
    </div>
  );
}

// レアリティボタンスタイル
function getRarityButtonStyle(rarity: string, selected: boolean): string {
  const baseStyles = selected ? '' : 'opacity-70 hover:opacity-90';
  
  const rarityStyles = {
    SSR: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black',
    SR: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
    R: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
    N: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
  };
  
  return `${rarityStyles[rarity as keyof typeof rarityStyles]} ${baseStyles}`;
}