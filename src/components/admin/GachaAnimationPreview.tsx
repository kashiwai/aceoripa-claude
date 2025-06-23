'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AnimationSettings {
  SS: string
  S: string
  A: string
  B: string
  C: string
}

interface GachaAnimationPreviewProps {
  animationSettings: AnimationSettings
}

export default function GachaAnimationPreview({ animationSettings }: GachaAnimationPreviewProps) {
  const [selectedRarity, setSelectedRarity] = useState<string>('SS')
  const [isPlaying, setIsPlaying] = useState(false)
  
  const rarityColors = {
    SS: 'from-yellow-400 via-red-500 to-pink-500',
    S: 'from-purple-400 to-pink-400',
    A: 'from-blue-400 to-cyan-400',
    B: 'from-green-400 to-emerald-400',
    C: 'from-gray-400 to-gray-500'
  }
  
  const getAnimationClass = (rarity: string, type: string) => {
    if (type === 'premium') {
      return 'animate-pulse scale-110 rotate-3'
    } else if (type === 'special') {
      return 'animate-bounce scale-105'
    }
    return ''
  }
  
  const handlePreview = () => {
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 3000)
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-medium text-gray-700 mb-3">演出プレビュー</h3>
      
      <div className="flex space-x-2 mb-4">
        {Object.keys(animationSettings).map((rarity) => (
          <button
            key={rarity}
            onClick={() => setSelectedRarity(rarity)}
            className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
              selectedRarity === rarity
                ? `bg-gradient-to-r ${rarityColors[rarity as keyof typeof rarityColors]} text-white`
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {rarity}賞
          </button>
        ))}
      </div>
      
      <div className="relative w-48 h-48 mx-auto mb-4 bg-gray-900 rounded-lg overflow-hidden">
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          isPlaying ? getAnimationClass(selectedRarity, animationSettings[selectedRarity as keyof AnimationSettings]) : ''
        }`}>
          <div className={`w-32 h-32 bg-gradient-to-r ${rarityColors[selectedRarity as keyof typeof rarityColors]} rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-2xl">{selectedRarity}</span>
          </div>
        </div>
        
        {/* 演出エフェクト */}
        {isPlaying && animationSettings[selectedRarity as keyof AnimationSettings] === 'premium' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </>
        )}
        
        {isPlaying && animationSettings[selectedRarity as keyof AnimationSettings] === 'special' && (
          <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 bg-gradient-to-t from-yellow-400 to-transparent animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${Math.random() * 1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <button
          onClick={handlePreview}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          演出を再生
        </button>
        <p className="text-xs text-gray-500">
          現在の設定: {animationSettings[selectedRarity as keyof AnimationSettings] === 'premium' ? 'プレミアム演出' : 
                     animationSettings[selectedRarity as keyof AnimationSettings] === 'special' ? '特別演出' : '通常演出'}
        </p>
      </div>
    </div>
  )
}