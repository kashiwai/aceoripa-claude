/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // 画像の外部ドメイン許可（AI生成画像用）
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net'],
  },
}

module.exports = nextConfig
