'use client';

import { useState, useEffect } from 'react';
import { AuthHeader } from '@/components/layout';
import Link from 'next/link';
import Image from 'next/image';
import { JapaneseBannerSection } from '@/components/home/JapaneseBannerSection';

// メインバナーのデータ型
interface MainBanner {
  id: string;
  title: string;
  imageUrl: string;
  type: 'auto-generated' | 'uploaded';
  link: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // サンプルバナーデータ（実際はAPIから取得）
  const mainBanners: MainBanner[] = [
    {
      id: '1',
      title: 'レジェンドガチャ開催中',
      imageUrl: '/api/placeholder/1024/1024',
      type: 'auto-generated',
      link: '/gacha?type=legend'
    },
    {
      id: '2',
      title: '新キャラ「炎の覇者」登場',
      imageUrl: '/api/placeholder/1024/1024',
      type: 'uploaded',
      link: '/gacha?featured=fire-lord'
    },
    {
      id: '3',
      title: '期間限定イベント',
      imageUrl: '/api/placeholder/1024/1024',
      type: 'auto-generated',
      link: '/gacha?type=event'
    }
  ];

  useEffect(() => {
    setMounted(true);
    // バナー自動切り替え
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainBanners.length]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <AuthHeader />
      <main className="min-h-screen bg-gray-900">
        {/* 日本語フォント重視バナーセクション */}
        <JapaneseBannerSection />
        
        {/* 既存のメインバナーセクション（一時的に非表示） */}
        <section className="relative w-full bg-black" style={{ display: 'none' }}>
          <div className="max-w-[1024px] mx-auto">
            {/* バナー表示エリア（正方形） */}
            <div className="relative aspect-square w-full">
              {mainBanners.map((banner, index) => (
                <Link 
                  key={banner.id} 
                  href={banner.link}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      priority={index === 0}
                      className="object-cover"
                    />
                    {/* バナータイトルオーバーレイ */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                      <div className="p-6 md:p-8 w-full">
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                          {banner.title}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            banner.type === 'auto-generated' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-green-600 text-white'
                          }`}>
                            {banner.type === 'auto-generated' ? 'AI生成' : 'アップロード'}
                          </span>
                          <span className="text-white/80 text-sm">タップして詳細を見る</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* バナーインジケーター */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {mainBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentBannerIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* メインガチャボタン - スマホファースト */}
        <section className="px-4 py-8">
          <Link href="/gacha" className="block max-w-md mx-auto">
            <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-2xl font-bold py-6 rounded-2xl shadow-lg transform transition-all hover:scale-105 active:scale-95">
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">🎰</span>
                <span>ガチャを引く</span>
              </div>
            </button>
          </Link>
        </section>

        {/* ガチャタイプ選択 */}
        <section className="px-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Link href="/gacha?type=normal" className="block">
              <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 text-center transition-all">
                <div className="text-3xl mb-2">🎲</div>
                <h3 className="text-white font-bold text-lg mb-1">通常ガチャ</h3>
                <p className="text-gray-400 text-sm">300pt / 回</p>
              </div>
            </Link>
            
            <Link href="/gacha?type=premium" className="block">
              <div className="bg-gradient-to-br from-purple-800 to-pink-800 hover:from-purple-700 hover:to-pink-700 rounded-xl p-6 text-center transition-all relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                  おすすめ
                </div>
                <div className="text-3xl mb-2">💎</div>
                <h3 className="text-white font-bold text-lg mb-1">プレミアム10連</h3>
                <p className="text-white/80 text-sm">2700pt / 10回</p>
              </div>
            </Link>
            
            <Link href="/gacha?type=legend" className="block">
              <div className="bg-gradient-to-br from-indigo-800 to-purple-800 hover:from-indigo-700 hover:to-purple-700 rounded-xl p-6 text-center transition-all">
                <div className="text-3xl mb-2">⭐</div>
                <h3 className="text-white font-bold text-lg mb-1">レジェンドガチャ</h3>
                <p className="text-white/80 text-sm">500pt / 回</p>
              </div>
            </Link>
          </div>
        </section>

        {/* クイックメニュー */}
        <section className="px-4 pb-8">
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <Link href="/mypage" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all">
              <div className="text-2xl mb-1">👤</div>
              <p className="text-white text-sm">マイページ</p>
            </Link>
            <Link href="/history" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all">
              <div className="text-2xl mb-1">📜</div>
              <p className="text-white text-sm">履歴</p>
            </Link>
            <Link href="/shop" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all">
              <div className="text-2xl mb-1">🛒</div>
              <p className="text-white text-sm">ショップ</p>
            </Link>
          </div>
        </section>

        {/* お知らせ */}
        <section className="px-4 pb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-4">お知らせ</h2>
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-yellow-500">📢</span>
                <div>
                  <p className="text-white font-semibold">メンテナンスのお知らせ</p>
                  <p className="text-gray-400 text-sm">12/25 2:00〜6:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500">🎉</span>
                <div>
                  <p className="text-white font-semibold">新ガチャ追加</p>
                  <p className="text-gray-400 text-sm">レジェンドシリーズ開催中</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="bg-gray-800 py-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">© 2024 Aceoripa ガチャ</p>
          </div>
        </footer>
      </main>
    </>
  );
}