'use client';

import { BannerCarousel, DynamicBanner } from '@/components/effects';
import { AuthHeader } from '@/components/layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <AuthHeader />
      <main className="min-h-screen bg-gray-900">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        <BannerCarousel 
          banners={[
            { id: '1', imageUrl: '/api/placeholder/1920/600', title: '新SSRカード登場！', subtitle: '期間限定ガチャ開催中' },
            { id: '2', imageUrl: '/api/placeholder/1920/600', title: '初心者応援キャンペーン', subtitle: '今なら10連ガチャ無料' },
            { id: '3', imageUrl: '/api/placeholder/1920/600', title: 'バトルイベント開催', subtitle: '豪華報酬をゲット！' }
          ]}
        />
      </section>

      {/* メインメニュー */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/gacha" className="group">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-center transform transition-all hover:scale-105">
              <div className="text-4xl mb-2">🎰</div>
              <h3 className="text-white font-bold text-lg">ガチャ</h3>
              <p className="text-white/80 text-sm mt-1">新カードを入手</p>
            </div>
          </Link>

          <Link href="/battle" className="group">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-center transform transition-all hover:scale-105">
              <div className="text-4xl mb-2">⚔️</div>
              <h3 className="text-white font-bold text-lg">バトル</h3>
              <p className="text-white/80 text-sm mt-1">対戦開始</p>
            </div>
          </Link>

          <Link href="/deck" className="group">
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-center transform transition-all hover:scale-105">
              <div className="text-4xl mb-2">🎴</div>
              <h3 className="text-white font-bold text-lg">デッキ</h3>
              <p className="text-white/80 text-sm mt-1">編成・管理</p>
            </div>
          </Link>

          <Link href="/mypage" className="group">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-6 text-center transform transition-all hover:scale-105">
              <div className="text-4xl mb-2">👤</div>
              <h3 className="text-white font-bold text-lg">マイページ</h3>
              <p className="text-white/80 text-sm mt-1">プロフィール</p>
            </div>
          </Link>
        </div>
      </section>

      {/* イベントバナー */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">開催中のイベント</h2>
        <div className="space-y-4">
          <DynamicBanner
            imageUrl="/api/placeholder/1200/300"
            title="期間限定！SSR確率2倍キャンペーン"
            subtitle="12/31まで"
            ctaText="詳細を見る"
            onClick={() => console.log('Event clicked')}
          />
          <DynamicBanner
            imageUrl="/api/placeholder/1200/300"
            title="初心者応援ログインボーナス"
            subtitle="7日間連続ログインで豪華報酬"
            ctaText="今すぐ参加"
            onClick={() => console.log('Login bonus clicked')}
          />
        </div>
      </section>

      {/* お知らせセクション */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">お知らせ</h2>
        <div className="bg-gray-800 rounded-xl p-4">
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">📢</span>
              <div>
                <p className="text-white font-semibold">【重要】メンテナンスのお知らせ</p>
                <p className="text-gray-400 text-sm">12/25 2:00〜6:00</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">🎉</span>
              <div>
                <p className="text-white font-semibold">新カードパック「伝説の英雄」リリース</p>
                <p className="text-gray-400 text-sm">12/20</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">🏆</span>
              <div>
                <p className="text-white font-semibold">ランキングイベント結果発表</p>
                <p className="text-gray-400 text-sm">12/18</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-800 mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 Aceoripa TCG. All rights reserved.</p>
        </div>
      </footer>
    </main>
    </>
  );
}