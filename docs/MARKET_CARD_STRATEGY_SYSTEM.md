# 市場カード戦略式システム 詳細仕様書

## 1. 概要

### 1.1 市場カード戦略式とは
市場カード戦略式は、リアルタイムの市場価格データと在庫状況を基に、ガチャの排出確率を動的に調整する革新的なシステムです。従来の固定確率式とは異なり、市場の需給バランスを反映した公正で持続可能なガチャ運営を実現します。

### 1.2 システムの目的
- **市場価格の安定化**: 高騰カードの適切な供給調整
- **在庫の最適化**: デッドストックの削減と人気カードの確保
- **収益の最大化**: 市場動向に応じた価格戦略
- **ユーザー満足度向上**: 公正で透明性の高い確率設定

## 2. 基本アルゴリズム

### 2.1 確率計算式
```typescript
// 基本的な市場戦略式
function calculateMarketStrategyWeight(
  baseWeight: number,        // 基本重み
  marketPrice: number,       // 現在の市場価格
  targetPrice: number,       // 目標価格
  stockLevel: number,        // 在庫レベル (0-100%)
  demandScore: number        // 需要スコア (0-100)
): number {
  // 価格係数の計算
  const priceRatio = marketPrice / targetPrice;
  const priceFactor = Math.max(0.5, Math.min(2.0, 1 / priceRatio));
  
  // 在庫係数の計算
  const stockFactor = stockLevel < 20 ? 0.7 : 
                     stockLevel > 80 ? 1.3 : 1.0;
  
  // 需要係数の計算
  const demandFactor = 1 + (demandScore - 50) / 100;
  
  // 最終的な重みの計算
  return baseWeight * priceFactor * stockFactor * demandFactor;
}
```

### 2.2 動的調整パラメータ

#### 価格調整係数
- **高騰時（市場価格 > 目標価格×1.5）**: 確率を50%減少
- **適正時（目標価格×0.8 < 市場価格 < 目標価格×1.2）**: 変更なし
- **下落時（市場価格 < 目標価格×0.5）**: 確率を100%増加

#### 在庫調整係数
- **過少在庫（< 20%）**: 確率を30%減少
- **適正在庫（20-80%）**: 変更なし
- **過剰在庫（> 80%）**: 確率を30%増加

## 3. データ収集と分析

### 3.1 価格監視システム
```typescript
interface PriceMonitoringData {
  cardId: string;
  sources: {
    cardrush: number;      // カードラッシュ価格
    mercari: number;       // メルカリ相場
    yahoo: number;         // ヤフオク落札相場
  };
  averagePrice: number;    // 加重平均価格
  trend: 'rising' | 'stable' | 'falling';
  lastUpdated: Date;
}
```

### 3.2 需要分析
- **検索頻度**: ユーザーの検索回数
- **ウィッシュリスト登録数**: お気に入り登録数
- **取引成立率**: 実際の売買成立率
- **SNSトレンド**: Twitter/Instagram等での言及数

## 4. 実装例

### 4.1 ガチャ実行時の確率計算
```typescript
async function executeMarketStrategyGacha(gachaId: string, userId: string) {
  // 1. カードプールの取得
  const cardPool = await getGachaCardPool(gachaId);
  
  // 2. 各カードの市場戦略重みを計算
  const adjustedPool = await Promise.all(
    cardPool.map(async (card) => {
      const marketData = await getMarketData(card.id);
      const stockData = await getStockData(card.id);
      
      const adjustedWeight = calculateMarketStrategyWeight(
        card.baseWeight,
        marketData.currentPrice,
        card.targetPrice,
        stockData.level,
        marketData.demandScore
      );
      
      return { ...card, weight: adjustedWeight };
    })
  );
  
  // 3. 重み付き抽選の実行
  const selectedCard = weightedRandom(adjustedPool);
  
  // 4. 市場戦略履歴の記録
  await recordMarketStrategyHistory({
    gachaId,
    userId,
    selectedCardId: selectedCard.id,
    marketPrice: selectedCard.marketPrice,
    adjustedWeight: selectedCard.weight,
    timestamp: new Date()
  });
  
  return selectedCard;
}
```

### 4.2 リアルタイム価格更新
```typescript
// 5分ごとに市場価格を更新
setInterval(async () => {
  const activeCards = await getActiveCards();
  
  for (const card of activeCards) {
    const newPrice = await fetchMarketPrice(card.id);
    const priceChange = (newPrice - card.lastPrice) / card.lastPrice;
    
    // 価格変動が10%以上の場合、即座に確率を調整
    if (Math.abs(priceChange) > 0.1) {
      await adjustGachaWeights(card.id, priceChange);
      await notifyPriceAlert(card.id, priceChange);
    }
  }
}, 5 * 60 * 1000); // 5分
```

## 5. 管理画面機能

### 5.1 市場戦略ダッシュボード
- **リアルタイム価格チャート**: 各カードの市場価格推移
- **確率調整履歴**: 自動調整の履歴表示
- **収益シミュレーション**: 戦略変更による収益予測
- **アラート設定**: 価格急変時の通知

### 5.2 戦略パラメータ設定
```typescript
interface MarketStrategyConfig {
  // 価格調整の感度
  priceSensitivity: 'low' | 'medium' | 'high';
  
  // 在庫調整の閾値
  stockThresholds: {
    low: number;   // デフォルト: 20%
    high: number;  // デフォルト: 80%
  };
  
  // 自動調整の有効/無効
  autoAdjustment: boolean;
  
  // 最大/最小確率の制限
  probabilityLimits: {
    min: number;   // デフォルト: 0.1%
    max: number;   // デフォルト: 10%
  };
}
```

## 6. 利点と特徴

### 6.1 運営側のメリット
- **在庫リスクの軽減**: 市場価格に連動した適切な排出
- **収益の安定化**: 需給バランスを考慮した価格設定
- **自動最適化**: AIによる24時間365日の監視と調整
- **透明性の向上**: 市場データに基づく公正な運営

### 6.2 ユーザー側のメリット
- **公正な確率**: 市場価値に応じた適切な排出率
- **価格の安定**: 極端な高騰・暴落の抑制
- **入手機会の増加**: 在庫状況に応じた確率調整
- **透明性**: 市場データの公開による信頼性向上

## 7. 導入事例とシミュレーション

### 7.1 ケーススタディ：人気カードの価格高騰時
```
初期状態:
- カード: ピカチュウ PSA10
- 基本確率: 1%
- 市場価格: 50,000円
- 目標価格: 30,000円

市場戦略式適用後:
- 価格係数: 0.6 (価格高騰により確率減少)
- 調整後確率: 0.6%
- 結果: 供給量の適正化により価格が安定
```

### 7.2 収益シミュレーション
```
従来方式（固定確率）:
- 月間売上: 1,000万円
- 原価率: 70%
- 利益: 300万円

市場戦略式導入後:
- 月間売上: 1,200万円（+20%）
- 原価率: 65%（-5%）
- 利益: 420万円（+40%）
```

## 8. 今後の拡張計画

### 8.1 AI予測モデルの導入
- 機械学習による価格予測
- 需要予測アルゴリズム
- 最適在庫量の自動計算

### 8.2 ブロックチェーン連携
- 排出履歴の透明化
- スマートコントラクトによる自動執行
- NFT化による真正性保証

### 8.3 グローバル市場対応
- 多通貨対応
- 地域別価格戦略
- 国際配送との連携

---

*市場カード戦略式は、Aceoripaが独自に開発した革新的なガチャシステムです。*