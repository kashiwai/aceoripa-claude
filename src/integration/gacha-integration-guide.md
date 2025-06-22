# ガチャシステム統合ガイド

## 概要
このドキュメントは、フロントエンドチームがガチャシステムを統合するためのガイドです。

## 主要コンポーネント

### 1. GachaUI Component
メインのガチャUIコンポーネント

```jsx
import GachaUI from './components/GachaUI';

function App() {
  const handleGachaComplete = (results) => {
    console.log('ガチャ結果:', results);
    // 結果の処理（在庫更新、履歴保存など）
  };

  return (
    <GachaUI onGachaComplete={handleGachaComplete} />
  );
}
```

### 2. GachaEffectController
エフェクト制御システム（自動的にGachaUI内で使用されます）

## 必要なアセット

以下のアセットがpublic/images/配下に配置されています：

### バナー画像
- `/images/banners/1024x1024/` - 各レアリティのバナー画像
- `/images/banners/1024x1024/main-gacha-banner.png` - メインバナー

### ガチャボタン
- `/images/gacha-buttons/single-gacha.png` - 1回ガチャボタン
- `/images/gacha-buttons/ten-gacha.png` - 10連ガチャボタン
- `/images/gacha-buttons/custom-gacha.png` - 指定数ガチャボタン

### レアリティアイコン
- `/images/rarity-icons/n-icon.png` - Nレアアイコン
- `/images/rarity-icons/r-icon.png` - Rレアアイコン
- `/images/rarity-icons/sr-icon.png` - SRレアアイコン
- `/images/rarity-icons/ssr-icon.png` - SSRレアアイコン
- `/images/rarity-icons/ur-icon.png` - URレアアイコン
- `/images/rarity-icons/psa10-icon.png` - PSA10アイコン

### UIエレメント
- `/images/ui-elements/loading-icon.png` - ローディングアイコン
- `/images/ui-elements/star-icon.png` - スターアイコン
- `/images/ui-elements/explosion-effect.png` - 爆発エフェクト

### ポケモンカード
- `/images/pokemon-cards/card-1.png` から `card-10.png` - サンプルカード画像

## API連携

### ガチャ結果取得API
現在は仮実装になっています。実際のAPIに置き換えてください：

```javascript
// src/components/GachaUI.js の fetchGachaResults を修正
const fetchGachaResults = async (count) => {
  const response = await fetch('/api/gacha/draw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count })
  });
  
  return await response.json();
};
```

### 期待されるレスポンス形式
```json
[
  {
    "id": "unique-card-id",
    "rarity": "SSR",
    "image": "/path/to/card/image.png",
    "name": "カード名"
  }
]
```

## 音声ファイル（要準備）

以下の音声ファイルを準備してください：

### BGM
- `/audio/bgm/epic-gacha-bgm.mp3` - メインBGM
- `/audio/bgm/tension-buildup.mp3` - 演出用BGM

### 効果音
- `/audio/sfx/button-click.mp3` - ボタンクリック音
- `/audio/sfx/gacha-spin.mp3` - ガチャ回転音
- `/audio/sfx/explosion.mp3` - 爆発音
- `/audio/sfx/sparkle.mp3` - キラキラ音
- `/audio/sfx/normal-reveal.mp3` - N公開音
- `/audio/sfx/rare-reveal.mp3` - R公開音
- `/audio/sfx/super-rare-reveal.mp3` - SR公開音
- `/audio/sfx/ssr-reveal.mp3` - SSR公開音
- `/audio/sfx/ur-reveal.mp3` - UR公開音
- `/audio/sfx/psa10-reveal.mp3` - PSA10公開音

## カスタマイズ

### レアリティ確率の変更
`src/components/GachaUI.js` のレアリティ確率表示を更新：

```jsx
<div className="rarity-item">
  <img src="/images/rarity-icons/ssr-icon.png" alt="SSR" />
  <span>SSR: 4%</span> {/* ここを変更 */}
</div>
```

### エフェクトのカスタマイズ
`src/components/GachaEffectController.js` でエフェクトを調整：

```javascript
const effects = {
  SSR: { particles: 50, color: '#FF6B6B' }, // パーティクル数と色を変更
};
```

### アニメーション時間の調整
```javascript
const revealDuration = {
  SSR: 3000, // ミリ秒単位で調整
};
```

## トラブルシューティング

### 音声が再生されない場合
- ブラウザの自動再生ポリシーにより、ユーザーインタラクション前の音声再生が制限される場合があります
- 初回クリック時にAudioContextを初期化するようにしてください

### アニメーションがカクつく場合
- CSS animationの代わりにrequestAnimationFrameを使用
- will-changeプロパティを適切に設定
- GPU合成を活用（transform、opacityを使用）

### 画像が表示されない場合
- public/images/ 配下に全てのアセットが配置されているか確認
- 画像パスが正しいか確認（先頭の/を忘れずに）

## 連携チェックリスト

- [ ] GachaUIコンポーネントをアプリに統合
- [ ] ガチャAPIエンドポイントの実装
- [ ] 音声ファイルの準備と配置
- [ ] 課金システムとの連携
- [ ] 在庫管理システムとの連携
- [ ] ユーザー履歴の保存機能
- [ ] エラーハンドリングの実装
- [ ] ローディング状態の管理
- [ ] レスポンシブ対応の確認

## 問い合わせ

バナー動画演出に関する質問は、バナー動画演出担当まで。