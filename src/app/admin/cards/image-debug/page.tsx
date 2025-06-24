'use client'

export default function ImageDebugPage() {
  const testImages = [
    '/images/ngcard.jpg',
    '/images/banner1.jpg',
    '/images/pokemon-151.jpg',
    '/images/box-style.png',
    'images/ngcard.jpg',  // スラッシュなし
    './images/ngcard.jpg',  // 相対パス
  ]

  return (
    <div style={{ padding: '20px' }}>
      <h1>画像デバッグ</h1>
      
      <h2>画像パステスト</h2>
      {testImages.map((src, index) => (
        <div key={index} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px' }}>
          <p><strong>パス:</strong> {src}</p>
          <img 
            src={src} 
            alt={`Test ${index}`}
            width="200"
            height="300"
            style={{ border: '1px solid #000' }}
            onError={(e) => {
              console.error(`画像読み込みエラー: ${src}`)
              const target = e.target as HTMLImageElement
              target.style.backgroundColor = '#ffcccc'
            }}
            onLoad={() => {
              // console.log(`画像読み込み成功: ${src}`)
            }}
          />
        </div>
      ))}

      <h2>publicフォルダの確認</h2>
      <p>以下のファイルが存在することを確認してください：</p>
      <ul>
        <li>/public/images/ngcard.jpg</li>
        <li>/public/images/banner1.jpg</li>
        <li>/public/images/pokemon-151.jpg</li>
      </ul>

      <h2>直接URL確認</h2>
      <p>以下のリンクをクリックして画像が表示されるか確認：</p>
      <ul>
        <li><a href="/images/ngcard.jpg" target="_blank">/images/ngcard.jpg</a></li>
        <li><a href="/images/banner1.jpg" target="_blank">/images/banner1.jpg</a></li>
        <li><a href="/images/pokemon-151.jpg" target="_blank">/images/pokemon-151.jpg</a></li>
      </ul>
    </div>
  )
}