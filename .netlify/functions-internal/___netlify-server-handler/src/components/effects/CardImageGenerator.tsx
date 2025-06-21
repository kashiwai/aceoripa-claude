'use client';

import { useEffect, useRef } from 'react';

interface CardImageGeneratorProps {
  text: string;
  width?: number;
  height?: number;
  category?: 'pokemon' | 'onepiece' | 'yugioh' | 'weiss' | 'other';
}

export const CardImageGenerator = ({ 
  text, 
  width = 400, 
  height = 600,
  category = 'other' 
}: CardImageGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // カテゴリー別の色設定
    const categoryColors = {
      pokemon: { primary: '#FF6B6B', secondary: '#FFE66D', accent: '#4ECDC4' },
      onepiece: { primary: '#FF4757', secondary: '#FFA502', accent: '#2F3542' },
      yugioh: { primary: '#5F27CD', secondary: '#00D2D3', accent: '#FFD93D' },
      weiss: { primary: '#F368E0', secondary: '#FF9FF3', accent: '#48DBFB' },
      other: { primary: '#667EEA', secondary: '#764BA2', accent: '#F093FB' }
    };

    const colors = categoryColors[category];

    // グラデーション背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.accent);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // カードフレーム
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // 内側フレーム
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // キラキラエフェクト
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    }

    // テキスト
    ctx.font = `bold ${width / 10}px "Dela Gothic One", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // テキストの影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText(text, width / 2 + 3, height / 2 + 3);
    
    // メインテキスト
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, width / 2, height / 2);

    // レアリティマーク
    const rarityGradient = ctx.createRadialGradient(
      width - 60, 60, 0,
      width - 60, 60, 40
    );
    rarityGradient.addColorStop(0, '#FFD700');
    rarityGradient.addColorStop(1, '#FFA500');
    
    ctx.beginPath();
    ctx.arc(width - 60, 60, 30, 0, Math.PI * 2);
    ctx.fillStyle = rarityGradient;
    ctx.fill();
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SR', width - 60, 60);

  }, [text, width, height, category]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="w-full h-full object-cover"
    />
  );
};