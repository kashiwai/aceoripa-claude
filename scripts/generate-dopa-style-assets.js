#!/usr/bin/env node

/**
 * DOPAスタイル アセット生成スクリプト
 * 背景白・赤ベースのデザインに変更
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 DOPAスタイル アセット生成開始');
console.log('=' .repeat(60));
console.log('🎯 カラースキーム: 背景白・赤ベース (DOPAスタイル)');
console.log('=' .repeat(60));

// DOPAスタイルのカラーパレット
const DOPA_COLORS = {
  background: '#FFFFFF',      // 白背景
  primary: '#FF0033',        // 赤 (メインカラー)
  secondary: '#FF6B6B',      // 薄い赤
  accent: '#FFD700',         // ゴールド (レア演出)
  dark: '#1A1A1A',          // ダークグレー
  text: '#333333',          // テキスト
  gradient: 'linear-gradient(135deg, #FF0033 0%, #FF6B6B 100%)'
};

// 1. Tailwind設定を更新
async function updateTailwindConfig() {
  console.log('\n1️⃣ Tailwind設定を更新中...');
  
  const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dopa-red': '#FF0033',
        'dopa-red-light': '#FF6B6B',
        'dopa-gold': '#FFD700',
        'dopa-dark': '#1A1A1A',
      },
      backgroundImage: {
        'dopa-gradient': 'linear-gradient(135deg, #FF0033 0%, #FF6B6B 100%)',
        'dopa-radial': 'radial-gradient(circle at center, #FF0033 0%, #FF6B6B 100%)',
      },
      animation: {
        'dopa-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dopa-glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 0, 51, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 0, 51, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
  `;
  
  fs.writeFileSync(path.join(process.cwd(), 'tailwind.config.js'), tailwindConfig);
  console.log('✅ Tailwind設定更新完了');
}

// 2. グローバルCSSを更新
async function updateGlobalStyles() {
  console.log('\n2️⃣ グローバルスタイルを更新中...');
  
  const globalStyles = `
@tailwind base;
@tailwind components;
@tailwind utilities;

/* DOPAスタイル グローバル設定 */
:root {
  --dopa-red: #FF0033;
  --dopa-red-light: #FF6B6B;
  --dopa-gold: #FFD700;
  --dopa-white: #FFFFFF;
  --dopa-dark: #1A1A1A;
}

body {
  background-color: var(--dopa-white);
  color: var(--dopa-dark);
}

/* DOPAスタイル ガチャボタン */
.dopa-gacha-button {
  background: linear-gradient(135deg, #FF0033 0%, #FF6B6B 100%);
  color: white;
  font-weight: bold;
  padding: 20px 40px;
  border-radius: 50px;
  font-size: 1.5rem;
  box-shadow: 0 10px 30px rgba(255, 0, 51, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dopa-gacha-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(255, 0, 51, 0.4);
}

.dopa-gacha-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: rotate(45deg);
  transition: all 0.5s;
}

.dopa-gacha-button:hover::before {
  animation: shine 0.5s ease-in-out;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

/* DOPAスタイル カード */
.dopa-card {
  background: white;
  border: 2px solid #FF0033;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dopa-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(255, 0, 51, 0.2);
}

/* DOPAスタイル レアリティ */
.dopa-rarity-ssr {
  background: linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B);
  animation: rainbow 3s linear infinite;
}

.dopa-rarity-sr {
  background: linear-gradient(45deg, #FFD700, #FFA500);
}

.dopa-rarity-r {
  background: #FF6B6B;
}

@keyframes rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
  `;
  
  fs.writeFileSync(path.join(process.cwd(), 'src/app/globals.css'), globalStyles);
  console.log('✅ グローバルスタイル更新完了');
}

// 3. レイアウトを更新
async function updateLayout() {
  console.log('\n3️⃣ レイアウトをDOPAスタイルに更新中...');
  
  const layoutContent = `
import type { Metadata } from 'next'
import { Inter, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })
const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '700', '900']
})

export const metadata: Metadata = {
  title: 'Aceoripa - オンラインオリパ',
  description: 'DOPAスタイル オンラインオリパサイト',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={notoSansJP.className}>
      <body className="bg-white">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FF0033',
              color: '#fff',
              border: '2px solid #FF6B6B',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
  `;
  
  fs.writeFileSync(path.join(process.cwd(), 'src/app/layout.tsx'), layoutContent);
  console.log('✅ レイアウト更新完了');
}

// 4. ホームページを更新
async function updateHomePage() {
  console.log('\n4️⃣ ホームページをDOPAスタイルに更新中...');
  
  const homePageContent = `
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const banners = [
    { id: 1, title: 'ポケモンカード151', subtitle: 'リザードンex確率UP!', color: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { id: 2, title: 'シャイニートレジャー', subtitle: 'SSR確定オリパ', color: 'bg-gradient-to-r from-yellow-400 to-red-500' },
    { id: 3, title: '期間限定', subtitle: '10連ガチャ20%OFF', color: 'bg-gradient-to-r from-red-600 to-pink-500' },
  ]

  const gachaProducts = [
    { id: 1, name: 'ポケモン151オリパ', price: 800, image: '/api/placeholder/300/400' },
    { id: 2, name: 'シャイニートレジャー', price: 1200, image: '/api/placeholder/300/400' },
    { id: 3, name: 'クラシックオリパ', price: 500, image: '/api/placeholder/300/400' },
    { id: 4, name: 'プレミアムオリパ', price: 2000, image: '/api/placeholder/300/400' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-dopa-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <h1 className="text-4xl font-black text-dopa-red">ACEORIPA</h1>
              <span className="ml-3 bg-dopa-red text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                ONLINE
              </span>
            </div>
            <nav className="flex items-center space-x-8">
              <Link href="/gacha" className="text-dopa-dark hover:text-dopa-red font-bold text-lg transition">
                ガチャ
              </Link>
              <Link href="/mypage" className="text-dopa-dark hover:text-dopa-red font-bold text-lg transition">
                マイページ
              </Link>
              <button className="bg-dopa-gradient text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition transform">
                ポイント購入
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* メインバナー */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="h-[500px]"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className={\`h-full \${banner.color} flex items-center justify-center\`}>
                <div className="text-center text-white">
                  <h2 className="text-6xl font-black mb-4 drop-shadow-lg">{banner.title}</h2>
                  <p className="text-3xl font-bold drop-shadow-md">{banner.subtitle}</p>
                  <button className="mt-8 bg-white text-red-600 font-black text-2xl px-12 py-6 rounded-full hover:scale-110 transition transform shadow-2xl">
                    今すぐ引く！
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ガチャ商品一覧 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-center text-dopa-red mb-12">
            オリパラインナップ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {gachaProducts.map((product) => (
              <Link key={product.id} href={\`/gacha/\${product.id}\`}>
                <div className="dopa-card cursor-pointer group">
                  <div className="relative h-64 bg-gray-100">
                    <div className="absolute inset-0 bg-dopa-gradient opacity-0 group-hover:opacity-20 transition"></div>
                    <div className="flex items-center justify-center h-full text-4xl font-bold text-gray-400">
                      {product.name}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-dopa-dark mb-2">{product.name}</h3>
                    <p className="text-3xl font-black text-dopa-red">¥{product.price}</p>
                    <button className="mt-4 w-full dopa-gacha-button text-lg">
                      ガチャを引く
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-dopa-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xl font-bold mb-4">ACEORIPA - オンラインオリパ</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/terms" className="hover:text-dopa-red transition">利用規約</Link>
            <Link href="/privacy" className="hover:text-dopa-red transition">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:text-dopa-red transition">お問い合わせ</Link>
          </div>
        </div>
      </footer>

      {loading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 border-8 border-dopa-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-2xl font-bold text-dopa-red">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}
  `;
  
  fs.writeFileSync(path.join(process.cwd(), 'src/app/page.tsx'), homePageContent.trim());
  console.log('✅ ホームページ更新完了');
}

// 5. 画像生成APIを使用してバナー生成
async function generateBanners() {
  console.log('\n5️⃣ DOPAスタイルバナーを生成中...');
  
  // public/imagesディレクトリを作成
  const imagesDir = path.join(process.cwd(), 'public/images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // バナー生成リクエスト（実際のAPIコール例）
  console.log('   - メインバナー1: ポケモンカード151');
  console.log('   - メインバナー2: シャイニートレジャー');
  console.log('   - メインバナー3: 期間限定キャンペーン');
  console.log('   - ガチャ商品画像×4');
  
  console.log('✅ バナー生成完了（プレースホルダー使用中）');
}

// メイン実行
async function main() {
  try {
    await updateTailwindConfig();
    await updateGlobalStyles();
    await updateLayout();
    await updateHomePage();
    await generateBanners();
    
    console.log('\n✨ DOPAスタイル変換完了！');
    console.log('=' .repeat(60));
    console.log('🎨 カラースキーム: 白背景・赤ベース');
    console.log('🚀 開発サーバーを再起動してください: npm run dev');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

main();