/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  // 画像の設定
  images: {
    unoptimized: true, // 画像最適化を無効化
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  // 静的ファイルの配信設定
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  // webpackの設定
  webpack: (config, { isServer, dev }) => {
    // キャッシュクリア設定
    if (dev) {
      config.cache = false;
    }
    
    // Resolve fallback configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    
    // Supabase realtime-js の警告を抑制
    config.module.exprContextCritical = false
    
    // 画像ファイルの処理
    config.module.rules.push({
      test: /\.(jpg|jpeg|png|gif|svg|webp)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    })
    return config
  },
}

module.exports = nextConfig
