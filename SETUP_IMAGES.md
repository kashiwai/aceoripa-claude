# 🖼️ 画像セットアップガイド

## 方法1: ローカル画像を使う（推奨）

### 1. 画像を配置
```
public/
  images/
    banners/
      pokemon-151.jpg
      shiny-treasure.jpg
      limited-time.jpg
    cards/
      pikachu.jpg
      charizard.jpg
```

### 2. コードを更新
`src/app/page.tsx` のバナー部分を編集：

```typescript
const banners = [
  { 
    id: 1, 
    title: 'ポケモンカード151', 
    subtitle: 'リザードンex確率UP!', 
    color: 'bg-gradient-to-r from-red-500 to-orange-500',
    image: '/images/banners/pokemon-151.jpg'  // ← ここを変更
  },
  // ...
]
```

## 方法2: 外部画像URLを使う

DOPAサイトのような画像を使いたい場合：

```typescript
const banners = [
  { 
    id: 1, 
    title: 'ポケモンカード151', 
    subtitle: 'リザードンex確率UP!', 
    color: 'bg-gradient-to-r from-red-500 to-orange-500',
    image: 'https://example.com/banner-image.jpg'  // 外部URL
  },
]
```

## 方法3: AI画像生成を有効化

### OpenAI APIキーを設定
1. Netlifyダッシュボード → Site settings → Environment variables
2. 追加：
   ```
   OPENAI_API_KEY = sk-xxxxx...（あなたのAPIキー）
   ```
3. 再デプロイ

### 画像生成APIを使う
Admin画面から：
1. `/admin/image-generator` にアクセス
2. カード画像やバナーを生成
3. 生成された画像URLを使用

## 方法4: 手動でバナー画像を作成

### 推奨サイズ
- バナー: 1200x500px
- カード: 300x400px
- アイコン: 100x100px

### 画像の命名規則
```
banners/
  main-campaign.jpg     # メインキャンペーン
  limited-gacha.jpg     # 期間限定ガチャ
  new-release.jpg       # 新商品
  
cards/
  ssr-charizard.jpg     # SSRリザードン
  sr-pikachu.jpg        # SRピカチュウ
```

## 🚀 クイックスタート

最も簡単な方法：
1. 好きな画像を `public/images/` に入れる
2. `src/app/page.tsx` の画像パスを更新
3. `git add . && git commit -m "Add images" && git push`
4. Netlifyが自動で再デプロイ

これで画像が表示されます！