# Aceoripa - ガチャアプリ

## 緊急開発体制（残り44時間）

### プロジェクト概要
- **URL**: https://classy-concha-73607d.netlify.app
- **GitHub**: https://github.com/kashiwai/aceoripa-claude (branch: aceoripa_claude)
- **技術スタック**: Next.js 14, Supabase, Square Payment, Netlify

### 6端末開発体制
- 端末1: フロントエンド UI/UX（スマホファースト）
- 端末2: バックエンド API・データベース
- 端末3: ガチャシステム・確率エンジン
- 端末4: Admin管理・決済システム
- 端末5: 演出・エンタメ（AI生成パーツ）
- 端末6: QC・インフラ・DevOps

### 環境構築手順

#### 1. 依存関係のインストール
```bash
npm install
```

#### 2. 環境変数の設定
`.env.local`ファイルを作成し、`.env.example`を参考に必要な値を設定：
```bash
cp .env.example .env.local
```

#### 3. Supabaseプロジェクトの設定
1. [Supabase](https://app.supabase.com)でプロジェクトを作成
2. プロジェクトURLとAPIキーを取得
3. `.env.local`に設定を追加

#### 4. 開発サーバーの起動
```bash
npm run dev
```

### データベーススキーマ

#### Users
- id (UUID, PK)
- email (String, Unique)
- created_at (Timestamp)
- updated_at (Timestamp)

#### Cards
- id (UUID, PK)
- name (String)
- rarity (String)
- image_url (String)
- created_at (Timestamp)

#### User_Cards
- id (UUID, PK)
- user_id (UUID, FK)
- card_id (UUID, FK)
- obtained_at (Timestamp)

#### Gacha_Products
- id (UUID, PK)
- name (String)
- price (Integer)
- currency (String)
- card_count (Integer)
- created_at (Timestamp)

#### Transactions
- id (UUID, PK)
- user_id (UUID, FK)
- product_id (UUID, FK)
- amount (Integer)
- status (String)
- created_at (Timestamp)

### デプロイ設定

#### Netlify
- Build command: `npm run build`
- Publish directory: `.next`
- 環境変数はNetlifyダッシュボードで設定

### 緊急連絡体制
- 1時間毎: 進捗報告
- 2時間毎: プルリクエスト
- 問題発生時: 即座に報告

### セキュリティ注意事項
- 環境変数は絶対にコミットしない
- `.env.local`は`.gitignore`に含める
- APIキーは適切な権限設定を行う