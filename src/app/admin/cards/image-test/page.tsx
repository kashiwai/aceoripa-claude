'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function ImageTestPage() {
  const [imageError, setImageError] = useState<string | null>(null)

  return (
    <div className="container mt-5">
      <h1 className="mb-4">画像テスト</h1>
      
      <div className="row">
        {/* テスト1: 直接imgタグ */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>テスト1: 通常のimgタグ</h5>
            </div>
            <div className="card-body">
              <img 
                src="/images/ngcard.jpg" 
                alt="NGカード" 
                style={{ width: '100%', height: 'auto' }}
                onError={(e) => {
                  console.error('Image load error:', e)
                  setImageError('imgタグでエラー')
                }}
                onLoad={() => {/* console.log('imgタグで画像読み込み成功') */}}
              />
            </div>
          </div>
        </div>

        {/* テスト2: Next.js Imageコンポーネント */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>テスト2: Next.js Image</h5>
            </div>
            <div className="card-body">
              <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                <Image
                  src="/images/ngcard.jpg"
                  alt="NGカード"
                  fill
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    console.error('Next Image error:', e)
                    setImageError('Next.js Imageでエラー')
                  }}
                  onLoad={() => {/* console.log('Next.js Imageで画像読み込み成功') */}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* テスト3: 絶対パス */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-header">
              <h5>テスト3: 様々なパス</h5>
            </div>
            <div className="card-body">
              <p>パス1: /images/ngcard.jpg</p>
              <img 
                src="/images/ngcard.jpg" 
                alt="Test1" 
                style={{ width: '100px', height: '150px', border: '1px solid #ddd', marginBottom: '10px' }}
              />
              
              <p>パス2: /images/NGcard.jpg (大文字)</p>
              <img 
                src="/images/NGcard.jpg" 
                alt="Test2" 
                style={{ width: '100px', height: '150px', border: '1px solid #ddd', marginBottom: '10px' }}
              />
              
              <p>パス3: ./images/ngcard.jpg</p>
              <img 
                src="./images/ngcard.jpg" 
                alt="Test3" 
                style={{ width: '100px', height: '150px', border: '1px solid #ddd', marginBottom: '10px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 他の画像もテスト */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5>その他の画像テスト</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <p>banner1.jpg</p>
                  <img src="/images/banner1.jpg" alt="Banner" style={{ width: '100%', height: 'auto' }} />
                </div>
                <div className="col-md-3">
                  <p>campaign.png.bak</p>
                  <img src="/images/campaign.png.bak" alt="Campaign" style={{ width: '100%', height: 'auto' }} />
                </div>
                <div className="col-md-3">
                  <p>pokemon-151.jpg</p>
                  <img src="/images/pokemon-151.jpg" alt="Pokemon" style={{ width: '100%', height: 'auto' }} />
                </div>
                <div className="col-md-3">
                  <p>box-style.png</p>
                  <img src="/images/box-style.png" alt="Box" style={{ width: '100%', height: 'auto' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {imageError && (
        <div className="alert alert-danger mt-4">
          エラー: {imageError}
        </div>
      )}

      <div className="mt-4">
        <a href="/admin/cards" className="btn btn-secondary">← カード管理に戻る</a>
      </div>
    </div>
  )
}