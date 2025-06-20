import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aceoripa Claude - ガチャ演出システム',
  description: 'AI生成デザイン・演出システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}