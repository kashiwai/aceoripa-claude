# 🎮 Aceoripa ポケモンカード オリパサイト

DOPAスタイルのポケモンカード専用ガチャサイト

## 🚀 Netlifyへのデプロイ方法

### 1. GitHubリポジトリの準備
```bash
git add .
git commit -m "Netlify deployment ready"
git push origin main
```

### 2. Netlifyでのデプロイ手順

1. [Netlify](https://app.netlify.com/)にログイン
2. "Add new site" → "Import an existing project"をクリック
3. GitHubを選択し、このリポジトリを選択
4. ビルド設定は自動検出されます（netlify.tomlを使用）
5. 環境変数を設定:

#### 必須の環境変数
```
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名キー
SUPABASE_SERVICE_KEY=あなたのSupabaseサービスキー
```

#### オプション環境変数
```
# OpenAI API（設定しない場合はプレースホルダー画像使用）
OPENAI_API_KEY=sk-xxx...

# Square決済（本番環境用）
SQUARE_APPLICATION_ID=sandbox-sq0idb-xxx...
SQUARE_ACCESS_TOKEN=EAAAEA...
SQUARE_LOCATION_ID=L...
SQUARE_ENVIRONMENT=sandbox

# プッシュ通知
VAPID_PUBLIC_KEY=BN...
VAPID_PRIVATE_KEY=xxx...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN...
```

6. "Deploy site"をクリック

### 3. デプロイ後の確認

デプロイ完了後、以下のURLでアクセス可能:
- メインサイト: `https://your-site-name.netlify.app`
- Admin画面: `https://your-site-name.netlify.app/admin`

## 🎨 デザイン確認ポイント

1. **トップページ**
   - Swiperバナーのアニメーション
   - ガチャ商品のホバーエフェクト
   - レスポンシブデザイン（PC/タブレット/スマホ）

2. **ガチャページ**
   - ガチャ実行アニメーション
   - レアリティ演出（SSR/SR/R/N）
   - 動画生成エフェクト

3. **マイページ**
   - ユーザー情報表示
   - 獲得カード一覧
   - ポイント残高

4. **Admin画面**
   - ログイン機能
   - 各種管理機能
   - CSV一括インポート

## 📱 モバイル対応

- 375px以上の画面幅に対応
- タッチ操作最適化
- PWA対応（オフライン機能付き）

## 🔧 ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス可能

## 📝 注意事項

- Supabaseの設定が必須です
- OpenAI APIキーなしでも動作します（プレースホルダー画像使用）
- 初回アクセス時に自動で1000ポイント付与されます

## 技術スタック
- **Framework**: Next.js 15
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Payment**: Square
- **Deployment**: Netlify

### 主な機能
- 🏠 **ホーム画面**: DOPAスタイルのデザインでポケモンガチャ商品を表示
- 🎲 **ガチャシステム**: 端末5のエフェクトシステムを使用した本格的なガチャ演出
- 👤 **マイページ**: ユーザープロフィール、コレクション、統計情報
- 🔐 **認証システム**: Supabaseを使用したログイン・会員登録
- 📱 **PWA対応**: モバイルファーストのレスポンシブデザイン
- 🔔 **プッシュ通知**: Service Workerによる通知システム

### 6端末開発体制
- 端末1: フロントエンド UI/UX（スマホファースト）✅ **完了**
- 端末2: バックエンド API・データベース
- 端末3: ガチャシステム・確率エンジン
- 端末4: Admin管理・決済システム
- 端末5: 演出・エンタメ（AI生成パーツ）✅ **完了**
- 端末6: QC・インフラ・DevOps

## 🧪 テスト実行

### 全テスト実行
```bash
# 包括的テストスクリプト実行
npm run test:all
# または
./tests/run-tests.sh
```

### 個別テスト実行
```bash
# APIテスト
npm run test:api

# フロントエンドテスト（ブラウザ）
npm run test:frontend

# Lighthouseパフォーマンステスト
npm run test:lighthouse
```

### テストカバレッジ

#### フロントエンドテスト
- **TC-F001**: ページ読み込みテスト
- **TC-F002**: レスポンシブデザインテスト
- **TC-F003**: DOM要素存在確認
- **TC-F004**: ガチャアニメーション
- **TC-F005**: プッシュ通知システム

#### バックエンドテスト
- **TC-B001**: ガチャ商品取得API
- **TC-B002**: プレースホルダー画像API
- **TC-B003**: 認証API
- **TC-B004**: 管理画面API

#### 管理画面テスト
- **TC-A001**: ログイン機能
- **TC-A002**: 商品管理CRUD
- **TC-A003**: ユーザー管理
- **TC-A004**: 統計ダッシュボード

#### パフォーマンステスト
- **TC-P001**: ページ読み込み速度
- **TC-P002**: メモリ使用量
- **TC-P003**: モバイル性能

## 🛠️ 環境構築手順

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

## 🔧 開発コマンド

```bash
# 開発サーバー
npm run dev

# 型チェック・ビルド
npm run build

# 本番サーバー
npm start

# Linting
npm run lint

# データベースマイグレーション
npm run db:migrate

# データベースリセット
npm run db:reset

# サンプル画像生成
npm run generate:images
```

## 📁 プロジェクト構造

```
aceoripa-claude/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx        # ホーム画面
│   │   ├── gacha/          # ガチャページ
│   │   ├── mypage/         # マイページ
│   │   ├── auth/           # 認証ページ
│   │   └── api/            # API Routes
│   ├── components/         # 共通コンポーネント
│   │   ├── effects/        # 端末5エフェクトシステム
│   │   ├── layout/         # レイアウト
│   │   └── ui/             # UIコンポーネント
│   └── lib/                # ユーティリティ
├── tests/                  # テストファイル
│   ├── api.test.js        # API自動テスト
│   ├── frontend.test.html # ブラウザテスト
│   └── run-tests.sh       # 総合テストスクリプト
├── docs/                   # ドキュメント
│   └── TEST_CASES.md      # テストケース仕様
└── public/                 # 静的ファイル
```

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: `#667eea` → `#764ba2` (グラデーション)
- **セカンダリ**: `#f093fb` → `#f5576c`
- **成功**: `#22c55e`
- **警告**: `#f59e0b`
- **エラー**: `#ef4444`

### ブレークポイント
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `≥ 1024px`

## 📊 パフォーマンス目標

- **First Contentful Paint**: < 1.5秒
- **Largest Contentful Paint**: < 2.5秒
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Lighthouse Score**: > 90

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

## 🔒 セキュリティ強化

- Supabase Row Level Security (RLS) 有効
- HTTPS強制
- 環境変数による機密情報管理
- CSRFプロテクション
- 入力値バリデーション

## 🚀 デプロイ・環境変数

### 環境変数
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🤝 貢献方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👥 開発チーム

- **Aceoripa Team** - 初期開発・実装

---

🎮 **Happy Gaming with Aceoripa!** 🎮