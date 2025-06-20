# ガチャ回数オプション実装例

## 管理画面からの設定フロー

### 1. 基本的な回数オプション
```json
// デフォルトで用意すべきオプション
[
  {
    "pull_count": 1,
    "display_name": "1回",
    "price_multiplier": 1.0,
    "order_index": 0
  },
  {
    "pull_count": 3,
    "display_name": "3回",
    "price_multiplier": 2.8,
    "order_index": 1,
    "is_discount": true
  },
  {
    "pull_count": 5,
    "display_name": "5回",
    "price_multiplier": 4.5,
    "order_index": 2,
    "is_discount": true
  },
  {
    "pull_count": 10,
    "display_name": "10連",
    "price_multiplier": 9.0,
    "order_index": 3,
    "is_popular": true,
    "is_discount": true
  }
]
```

### 2. カスタム回数オプションの例
```json
// イベント限定オプション
{
  "pull_count": 30,
  "display_name": "30連大爆発",
  "icon_url": "/images/icons/pull-30-special.png",
  "price_multiplier": 25.0,
  "is_popular": true,
  "is_discount": true,
  "order_index": 4
}

// 初心者向けオプション
{
  "pull_count": 1,
  "display_name": "お試し1回",
  "icon_url": "/images/icons/pull-trial.png",
  "price_multiplier": 0.5,
  "is_discount": true,
  "order_index": 0
}
```

## アイコン生成ガイドライン

### 推奨仕様
- **サイズ**: 256x256px
- **形式**: PNG（透過背景）
- **スタイル**: ゲームUI風、光沢感のある3Dレンダリング

### カラーパレット
- 1回: ゴールド系 (#FFD700)
- 3回: シルバー系 (#C0C0C0)
- 5回: レインボー/グラデーション
- 10回: プラチナ/ダイヤモンド系
- 特別: イベントテーマに合わせた色

## 実装時の注意点

1. **価格設定**
   - 複数回購入時は必ず割引を適用
   - 10回 = 9回分の価格が一般的

2. **表示順序**
   - 少ない回数から多い回数へ
   - 特別オプションは最後に配置

3. **UI/UX**
   - 最も人気のオプションを視覚的に強調
   - お得感を明確に表示

## トラブルシューティング

### よくある問題と解決方法

1. **アイコンが表示されない**
   - Supabaseストレージのパブリックアクセス設定を確認
   - 画像URLが正しいか確認

2. **新しいオプションが反映されない**
   - キャッシュをクリア
   - `order_index`が重複していないか確認

3. **価格計算が合わない**
   - `price_multiplier`の値を確認
   - フロントエンドの計算ロジックを確認