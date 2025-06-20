import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aceoripa TCG - トレーディングカードゲーム',
  description: '最高のカードゲーム体験を提供するAceoripa TCG',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-gray-900 text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
