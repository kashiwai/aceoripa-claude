/**
 * GachaUI - ガチャUI統合コンポーネント
 * フロントエンドチームが使用するメインインターフェース
 */

import React, { useState, useCallback } from 'react';
import { useGachaEffect } from './GachaEffectController';
import './GachaUI.css';

const GachaUI = ({ onGachaComplete }) => {
  const { isReady, playGacha } = useGachaEffect();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customCount, setCustomCount] = useState(5);

  /**
   * ガチャ実行
   */
  const executeGacha = useCallback(async (type, count = 1) => {
    if (!isReady || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // APIからガチャ結果を取得（仮実装）
      const results = await fetchGachaResults(count);
      
      // エフェクト再生
      await playGacha(type, results);
      
      // 完了コールバック
      if (onGachaComplete) {
        onGachaComplete(results);
      }
    } catch (error) {
      console.error('Gacha execution error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isReady, isProcessing, playGacha, onGachaComplete]);

  /**
   * ガチャ結果の取得（仮実装）
   */
  const fetchGachaResults = async (count) => {
    // 実際のAPIコールに置き換える
    const rarities = ['N', 'N', 'N', 'R', 'R', 'SR', 'SSR', 'UR', 'PSA10'];
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];
      results.push({
        id: `card-${Date.now()}-${i}`,
        rarity: rarity,
        image: `/images/pokemon-cards/card-${Math.floor(Math.random() * 10) + 1}.png`,
        name: `Card ${i + 1}`
      });
    }
    
    // レアリティでソート（高レアを後に）
    const rarityOrder = { N: 0, R: 1, SR: 2, SSR: 3, UR: 4, PSA10: 5 };
    results.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
    
    return results;
  };

  return (
    <div className="gacha-ui-container">
      {/* メインバナー */}
      <div className="gacha-banner">
        <img 
          src="/images/banners/1024x1024/main-gacha-banner.png" 
          alt="ガチャバナー"
          className="gacha-banner-image"
        />
      </div>

      {/* ガチャボタン */}
      <div className="gacha-buttons">
        {/* 1回ガチャ */}
        <button
          className="gacha-button single"
          onClick={() => executeGacha('single', 1)}
          disabled={!isReady || isProcessing}
        >
          <img src="/images/gacha-buttons/single-gacha.png" alt="1回ガチャ" />
        </button>

        {/* 10連ガチャ */}
        <button
          className="gacha-button ten"
          onClick={() => executeGacha('ten', 10)}
          disabled={!isReady || isProcessing}
        >
          <img src="/images/gacha-buttons/ten-gacha.png" alt="10連ガチャ" />
        </button>

        {/* 指定数ガチャ */}
        <div className="custom-gacha-container">
          <button
            className="gacha-button custom"
            onClick={() => executeGacha('custom', customCount)}
            disabled={!isReady || isProcessing}
          >
            <img src="/images/gacha-buttons/custom-gacha.png" alt="指定数ガチャ" />
          </button>
          <div className="custom-count-input">
            <button 
              onClick={() => setCustomCount(Math.max(1, customCount - 1))}
              disabled={isProcessing}
            >
              -
            </button>
            <input
              type="number"
              value={customCount}
              onChange={(e) => setCustomCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              min="1"
              max="100"
              disabled={isProcessing}
            />
            <button 
              onClick={() => setCustomCount(Math.min(100, customCount + 1))}
              disabled={isProcessing}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* レアリティ情報 */}
      <div className="rarity-info">
        <h3>レアリティ確率</h3>
        <div className="rarity-list">
          <div className="rarity-item">
            <img src="/images/rarity-icons/n-icon.png" alt="N" />
            <span>N: 50%</span>
          </div>
          <div className="rarity-item">
            <img src="/images/rarity-icons/r-icon.png" alt="R" />
            <span>R: 30%</span>
          </div>
          <div className="rarity-item">
            <img src="/images/rarity-icons/sr-icon.png" alt="SR" />
            <span>SR: 15%</span>
          </div>
          <div className="rarity-item">
            <img src="/images/rarity-icons/ssr-icon.png" alt="SSR" />
            <span>SSR: 4%</span>
          </div>
          <div className="rarity-item">
            <img src="/images/rarity-icons/ur-icon.png" alt="UR" />
            <span>UR: 0.9%</span>
          </div>
          <div className="rarity-item">
            <img src="/images/rarity-icons/psa10-icon.png" alt="PSA10" />
            <span>PSA10: 0.1%</span>
          </div>
        </div>
      </div>

      {/* ローディングオーバーレイ */}
      {isProcessing && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <img src="/images/ui-elements/loading-icon.png" alt="Loading" />
            <p>ガチャを回しています...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaUI;