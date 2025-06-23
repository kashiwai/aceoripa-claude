'use client'

import { useState } from 'react'

export default function TestAnimationsPage() {
  const [isShaking, setIsShaking] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)

  const testShake = () => {
    console.log('🎯 震動テスト開始')
    setIsShaking(true)
    document.body.style.animation = 'shake 0.5s'
    setTimeout(() => {
      document.body.style.animation = ''
      setIsShaking(false)
      console.log('✅ 震動完了')
    }, 500)
  }

  const testSpin = () => {
    console.log('🌀 スピンテスト開始')
    setIsSpinning(true)
    setTimeout(() => {
      setIsSpinning(false)
      console.log('✅ スピン完了')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">アニメーションテスト</h1>
        
        {/* テストボタン */}
        <div className="space-y-4 mb-8">
          <button
            onClick={testShake}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600"
            disabled={isShaking}
          >
            {isShaking ? '震動中...' : '🎯 画面震動テスト'}
          </button>
          
          <button
            onClick={testSpin}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 ml-4"
            disabled={isSpinning}
          >
            {isSpinning ? 'スピン中...' : '🌀 スピンテスト'}
          </button>
        </div>

        {/* アニメーション要素 */}
        <div className="grid grid-cols-2 gap-8">
          {/* Tailwind標準アニメーション */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Tailwind アニメーション</h2>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-500 animate-spin rounded-full border-4 border-t-transparent"></div>
              <div className="w-16 h-16 bg-green-500 animate-bounce rounded-full"></div>
              <div className="w-16 h-16 bg-yellow-500 animate-pulse rounded-full"></div>
            </div>
          </div>

          {/* カスタムアニメーション */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">カスタム アニメーション</h2>
            <div className="space-y-4">
              {isSpinning && (
                <div className="w-32 h-32 border-8 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              )}
              <div className="text-center">
                <div className="text-6xl animate-bounce">🎰</div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animation テスト */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">CSS Keyframes テスト</h2>
          <div className="space-y-4">
            <div 
              className="w-16 h-16 bg-purple-500 rounded-lg card-reveal-animation"
              style={{animation: 'cardFlip 2s infinite'}}
            ></div>
            <div 
              className="w-16 h-16 bg-red-500 rounded-lg"
              style={{animation: 'shake 2s infinite'}}
            ></div>
          </div>
        </div>

        {/* 戻るリンク */}
        <div className="mt-8">
          <a href="/gacha/1" className="text-blue-400 hover:text-blue-300">
            ← ガチャページに戻る
          </a>
        </div>
      </div>
    </div>
  )
}