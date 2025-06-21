'use client';

import { useState, useEffect } from 'react';
import { GachaEffectSystem, GachaVideoPlayer } from '@/components/effects';
import Link from 'next/link';
import { useGacha } from '@/hooks/useGacha';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// 仮のガチャID（実際はAPIから取得）
const DEFAULT_GACHA_ID = 'g001';

export default function GachaPage() {
  const [showEffect, setShowEffect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentRarity, setCurrentRarity] = useState<'SSR' | 'SR' | 'R' | 'N'>('N');
  const [resultCards, setResultCards] = useState<any[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [userPoints, setUserPoints] = useState({ total: 0, free: 0, paid: 0 });
  
  const { executeGacha, isLoading, clearResults } = useGacha();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('ログインが必要です');
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // ユーザーポイント取得
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/points');
        if (response.ok) {
          const data = await response.json();
          setUserPoints({
            total: data.free_points + data.paid_points,
            free: data.free_points,
            paid: data.paid_points
          });
        }
      } catch (error) {
        console.error('Failed to fetch user points:', error);
      }
    };
    
    fetchUserPoints();
  }, [user]);

  const performGacha = async (count: 1 | 10) => {
    if (!user) {
      toast.error('ログインが必要です');
      router.push('/auth/login');
      return;
    }
    
    const requiredPoints = count === 1 ? 150 : 1500;
    if (userPoints.total < requiredPoints) {
      toast.error('ポイントが不足しています');
      // 決済ページへリダイレクト
      router.push('/payment');
      return;
    }
    
    try {
      // APIを呼び出してガチャを実行
      const response = await executeGacha(DEFAULT_GACHA_ID, count);
      
      if (response.success) {
        // 結果をセット
        setResultCards(response.results);
        
        // 最高レアリティを判定
        const rarities = response.results.map(r => r.rarity);
        const maxRarity = rarities.includes('SSR') ? 'SSR' : 
                         rarities.includes('SR') ? 'SR' : 
                         rarities.includes('R') ? 'R' : 'N';
        
        setCurrentRarity(maxRarity);
        
        // ポイント更新
        setUserPoints(response.remainingPoints);
        
        // エフェクト表示
        setShowResult(false);
        setShowEffect(true);
      }
    } catch (error) {
      console.error('Gacha failed:', error);
      toast.error('ガチャの実行に失敗しました');
    }
  };

  const handleEffectComplete = () => {
    setShowEffect(false);
    setShowResult(true);
    
    // SSRの場合は動画も表示
    if (currentRarity === 'SSR') {
      setShowVideo(true);
    }
  };

  const handleVideoComplete = () => {
    setShowVideo(false);
  };

  const resetGacha = () => {
    setShowEffect(false);
    setShowResult(false);
    setShowVideo(false);
    setResultCards([]);
    clearResults();
  };

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white">
        {/* ポイント表示ヘッダー */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">ガチャ</h1>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">💎</span>
              <span>{userPoints.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      {/* エフェクト表示 */}
      {showEffect && (
        <div className="fixed inset-0 z-50">
          <GachaEffectSystem 
            rarity={currentRarity}
            onComplete={handleEffectComplete}
          />
        </div>
      )}

      {/* 動画表示 */}
      {showVideo && (
        <div className="fixed inset-0 z-40 bg-black">
          <GachaVideoPlayer
            result={{
              rarity: 'SSR',
              item: {
                id: 'temp-id',
                name: 'テストカード',
                imageUrl: '/api/placeholder/300/400'
              }
            }}
            onComplete={handleVideoComplete}
          />
        </div>
      )}

      {/* 結果表示 */}
      {showResult && !showVideo && (
        <div className="fixed inset-0 z-30 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-center mb-6">ガチャ結果</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {resultCards.map((card) => (
                <div 
                  key={card.cardId} 
                  className={`relative rounded-lg overflow-hidden transform transition-all hover:scale-105 ${
                    card.rarity === 'SSR' ? 'ring-4 ring-yellow-400' :
                    card.rarity === 'SR' ? 'ring-4 ring-purple-400' :
                    card.rarity === 'R' ? 'ring-4 ring-blue-400' : ''
                  }`}
                >
                  <img src={card.imageUrl} alt={card.cardName} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 text-xs font-bold">
                    {card.rarity}
                  </div>
                  {card.isNew && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-red-600 text-xs font-bold">
                      NEW!
                    </div>
                  )}
                  {card.isPickup && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-yellow-600 text-xs font-bold">
                      PICKUP
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetGacha}
                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-colors"
              >
                もう一度
              </button>
              <Link 
                href="/"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
              >
                ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      {!showEffect && !showResult && (
        <div className="container mx-auto px-4 py-8">
          {/* バナーセクション */}
          <section className="mb-8">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src="/api/placeholder/1200/400" 
                alt="期間限定ガチャ" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2">期間限定！伝説の英雄ガチャ</h2>
                  <p className="text-lg opacity-90">SSR確率2倍キャンペーン実施中</p>
                </div>
              </div>
            </div>
          </section>

          {/* ガチャボタン */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => performGacha(1)}
                disabled={isLoading || userPoints.total < 150}
                className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-2xl p-8 transform transition-all hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="text-6xl mb-4">🎲</div>
                <h3 className="text-2xl font-bold mb-2">単発ガチャ</h3>
                <p className="text-lg opacity-90 mb-4">1回引く</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-yellow-400 text-2xl">💎</span>
                  <span className="text-3xl font-bold">150</span>
                </div>
              </button>

              <button
                onClick={() => performGacha(10)}
                disabled={isLoading || userPoints.total < 1500}
                className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl p-8 transform transition-all hover:scale-105 shadow-2xl relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  SR以上確定！
                </div>
                <div className="text-6xl mb-4">🎰</div>
                <h3 className="text-2xl font-bold mb-2">10連ガチャ</h3>
                <p className="text-lg opacity-90 mb-4">10回引く</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-yellow-400 text-2xl">💎</span>
                  <span className="text-3xl font-bold">1,500</span>
                </div>
              </button>
            </div>
          </section>

          {/* 提供割合 */}
          <section className="mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-center">提供割合</h3>
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                    <span>SSR</span>
                  </span>
                  <span className="font-bold">3.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-purple-400 rounded-full"></span>
                    <span>SR</span>
                  </span>
                  <span className="font-bold">12.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                    <span>R</span>
                  </span>
                  <span className="font-bold">25.0%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span>N</span>
                  </span>
                  <span className="font-bold">60.0%</span>
                </div>
              </div>
            </div>
          </section>

          {/* 注意事項 */}
          <section className="text-center text-gray-400 text-sm">
            <p>※ ゲーム内通貨でのガチャとなります</p>
            <p>※ 獲得したカードは重複する場合があります</p>
          </section>
        </div>
      )}
      </main>
    </>
  );
}