'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DynamicBanner } from '@/components/effects';
import { AuthHeader } from '@/components/layout';

interface UserStats {
  totalCards: number;
  ssrCards: number;
  srCards: number;
  rCards: number;
  nCards: number;
  battleWins: number;
  battleLosses: number;
  winRate: number;
  rank: string;
  level: number;
  exp: number;
  nextLevelExp: number;
}

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'collection' | 'stats' | 'settings'>('profile');
  
  // 仮のユーザーデータ
  const userData = {
    name: 'プレイヤー',
    id: 'ACE12345',
    level: 42,
    rank: 'プラチナ',
    joinDate: '2024年1月15日',
    avatar: '/api/placeholder/200/200'
  };

  const userStats: UserStats = {
    totalCards: 523,
    ssrCards: 12,
    srCards: 47,
    rCards: 156,
    nCards: 308,
    battleWins: 234,
    battleLosses: 98,
    winRate: 70.5,
    rank: 'プラチナII',
    level: 42,
    exp: 3250,
    nextLevelExp: 5000
  };

  const recentCards = [
    { id: '1', name: '伝説の英雄', rarity: 'SSR', date: '12/20' },
    { id: '2', name: '闇の魔術師', rarity: 'SR', date: '12/19' },
    { id: '3', name: '光の戦士', rarity: 'SR', date: '12/18' },
    { id: '4', name: '炎の精霊', rarity: 'R', date: '12/18' },
    { id: '5', name: '風の守護者', rarity: 'R', date: '12/17' }
  ];

  return (
    <>
      <AuthHeader />
      <main className="min-h-screen bg-gray-900 text-white">

      {/* プロフィールヘッダー */}
      <section className="bg-gradient-to-r from-purple-900 to-pink-900 p-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img 
                src={userData.avatar} 
                alt="アバター" 
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              <div className="absolute bottom-0 right-0 bg-yellow-500 text-black rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {userData.level}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{userData.name}</h2>
              <p className="text-gray-300 mb-1">ID: {userData.id}</p>
              <p className="text-gray-300 mb-4">参加日: {userData.joinDate}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                  ランク: {userData.rank}
                </span>
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                  総カード数: {userStats.totalCards}
                </span>
                <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                  勝率: {userStats.winRate}%
                </span>
              </div>
            </div>
          </div>
          
          {/* 経験値バー */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>レベル {userStats.level}</span>
              <span>{userStats.exp} / {userStats.nextLevelExp} EXP</span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                style={{ width: `${(userStats.exp / userStats.nextLevelExp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* タブナビゲーション */}
      <section className="bg-gray-800 sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'profile' 
                  ? 'text-white border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              プロフィール
            </button>
            <button
              onClick={() => setActiveTab('collection')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'collection' 
                  ? 'text-white border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              コレクション
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'stats' 
                  ? 'text-white border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              戦績
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'settings' 
                  ? 'text-white border-b-2 border-purple-500' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              設定
            </button>
          </div>
        </div>
      </section>

      {/* タブコンテンツ */}
      <section className="container mx-auto p-4 md:p-8">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* 実績バナー */}
            <DynamicBanner
              imageUrl="/api/placeholder/1200/200"
              title="連続ログイン30日達成！"
              subtitle="特別報酬を獲得しました"
              ctaText="報酬を確認"
              onClick={() => console.log('Check rewards')}
            />

            {/* 最近の獲得カード */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">最近の獲得カード</h3>
              <div className="space-y-3">
                {recentCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-8 rounded ${
                        card.rarity === 'SSR' ? 'bg-yellow-400' :
                        card.rarity === 'SR' ? 'bg-purple-400' :
                        card.rarity === 'R' ? 'bg-blue-400' : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="font-semibold">{card.name}</p>
                        <p className="text-sm text-gray-400">{card.rarity}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{card.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* フレンドリスト */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">フレンド</h3>
                <span className="text-gray-400">12 / 50</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <img 
                      src={`/api/placeholder/80/80`} 
                      alt={`フレンド${i}`}
                      className="w-20 h-20 rounded-full mx-auto mb-2"
                    />
                    <p className="text-sm font-semibold">フレンド{i}</p>
                    <p className="text-xs text-gray-400">Lv.{20 + i * 5}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="space-y-6">
            {/* コレクション統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold mb-2">{userStats.ssrCards}</p>
                <p className="text-sm">SSR</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold mb-2">{userStats.srCards}</p>
                <p className="text-sm">SR</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold mb-2">{userStats.rCards}</p>
                <p className="text-sm">R</p>
              </div>
              <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold mb-2">{userStats.nCards}</p>
                <p className="text-sm">N</p>
              </div>
            </div>

            {/* カードギャラリー */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">カードギャラリー</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer">
                    <img 
                      src="/api/placeholder/150/200" 
                      alt={`カード${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
                もっと見る
              </button>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* バトル戦績 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">バトル戦績</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-500">{userStats.battleWins}</p>
                  <p className="text-gray-400">勝利</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-500">{userStats.battleLosses}</p>
                  <p className="text-gray-400">敗北</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-500">{userStats.winRate}%</p>
                  <p className="text-gray-400">勝率</p>
                </div>
              </div>
            </div>

            {/* ランキング */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">現在のランキング</h3>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold">#1,234</p>
                  <p className="text-gray-400">全国ランキング</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{userStats.rank}</p>
                  <p className="text-gray-400">現在のランク</p>
                </div>
              </div>
            </div>

            {/* 月間成績 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">今月の成績</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">バトル回数</span>
                  <span className="font-semibold">45回</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">連勝記録</span>
                  <span className="font-semibold">12連勝</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">獲得ポイント</span>
                  <span className="font-semibold">2,450pt</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">使用デッキ</span>
                  <span className="font-semibold">炎属性デッキ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* アカウント設定 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">アカウント設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">プレイヤー名</label>
                  <input 
                    type="text" 
                    value={userData.name}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">自己紹介</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="自己紹介を入力..."
                  />
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-semibold transition-colors">
                  保存
                </button>
              </div>
            </div>

            {/* 通知設定 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">通知設定</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>バトル招待通知</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>フレンド申請通知</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>イベント開始通知</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>メンテナンス通知</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </label>
              </div>
            </div>

            {/* その他 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">その他</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                  利用規約
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                  プライバシーポリシー
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-700 rounded-lg transition-colors">
                  お問い合わせ
                </button>
                <button className="w-full text-left p-3 text-red-500 hover:bg-gray-700 rounded-lg transition-colors">
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
      </main>
    </>
  );
}