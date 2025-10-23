// Fincode環境設定
// 重要: テスト環境と本番環境を正しく切り替えてください
const isTestMode = process.env.NEXT_PUBLIC_FINCODE_ENV === 'test';

export const FINCODE_CONFIG = {
  // 環境に応じてAPIキーを切り替え
  publicKey: isTestMode 
    ? process.env.NEXT_PUBLIC_FINCODE_TEST_PUBLIC_KEY!
    : process.env.NEXT_PUBLIC_FINCODE_PROD_PUBLIC_KEY!,
  secretKey: isTestMode
    ? process.env.FINCODE_TEST_SECRET_KEY!
    : process.env.FINCODE_PROD_SECRET_KEY!,
  shopId: isTestMode
    ? process.env.NEXT_PUBLIC_FINCODE_TEST_SHOP_ID!
    : process.env.NEXT_PUBLIC_FINCODE_PROD_SHOP_ID!,
  environment: process.env.NEXT_PUBLIC_FINCODE_ENV || 'test', // デフォルトはテスト環境
  
  // API URLs
  apiUrl: isTestMode ? 'https://api.test.fincode.jp' : 'https://api.fincode.jp',
  jsUrl: isTestMode ? 'https://js.test.fincode.jp/v1/fincode.js' : 'https://js.fincode.jp/v1/fincode.js',
  
  // ポイントパッケージ設定
  pointPackages: [
    {
      id: 'pack_150',
      points: 150,
      bonus: 0,
      price: 120,
      displayPrice: '¥120',
      popular: false,
    },
    {
      id: 'pack_500',
      points: 500,
      bonus: 50,
      price: 400,
      displayPrice: '¥400',
      originalPrice: 450,
      popular: false,
    },
    {
      id: 'pack_1000',
      points: 1000,
      bonus: 150,
      price: 800,
      displayPrice: '¥800',
      originalPrice: 920,
      popular: true,
    },
    {
      id: 'pack_3000',
      points: 3000,
      bonus: 600,
      price: 2400,
      displayPrice: '¥2,400',
      originalPrice: 2880,
      popular: false,
    },
    {
      id: 'pack_5000',
      points: 5000,
      bonus: 1200,
      price: 4000,
      displayPrice: '¥4,000',
      originalPrice: 4960,
      popular: false,
    },
    {
      id: 'pack_10000',
      points: 10000,
      bonus: 3000,
      price: 8000,
      displayPrice: '¥8,000',
      originalPrice: 10400,
      popular: false,
    },
  ],
}