# 各端末セットアップガイド

## 共通セットアップ（全端末必須）

### 1. リポジトリのクローン
```bash
git clone https://github.com/kashiwai/aceoripa-claude.git
cd aceoripa-claude
git checkout aceoripa_claude
```

### 2. 環境構築
```bash
# セットアップスクリプトの実行
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh

# 環境変数の設定
cp .env.example .env.local
# エディタで.env.localを開き、必要な値を設定
```

### 3. Supabase設定確認
各端末の担当者は以下の情報を端末6から受け取ってください：
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY（端末2、4のみ）

## 端末別セットアップ

### 端末1: フロントエンド開発
```bash
# 開発サーバー起動
npm run dev

# Storybook起動（UIコンポーネント開発）
npm run storybook
```

**確認項目**:
- http://localhost:3000 でアプリが表示される
- レスポンシブデザインが機能する

### 端末2: バックエンド開発
```bash
# Supabase CLIのインストール
npm install -g supabase

# ローカルSupabase起動
supabase start

# マイグレーション実行
supabase db push
```

**確認項目**:
- Supabase Studioでテーブル確認
- APIエンドポイントの動作確認

### 端末3: ガチャシステム開発
```bash
# テスト環境セットアップ
npm run test:watch

# ガチャシミュレーター起動
npm run gacha:simulator
```

**確認項目**:
- 確率計算のユニットテスト
- ガチャシミュレーション結果

### 端末4: Admin・決済開発
```bash
# Square Sandbox設定
# .env.localに以下を設定：
# SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxxx
# SQUARE_ACCESS_TOKEN=sandbox-sq0atb-xxxxx

# 管理画面起動
npm run admin:dev
```

**確認項目**:
- 管理画面へのアクセス
- Square決済のテスト

### 端末5: 演出・エンタメ開発
```bash
# アセット管理ツール起動
npm run assets:manage

# パフォーマンス計測
npm run perf:measure
```

**確認項目**:
- アニメーション動作
- パフォーマンス指標

## 開発フロー

### 1. ブランチ作成
```bash
git checkout -b feature/機能名
```

### 2. 開発・コミット
```bash
git add .
git commit -m "機能: 実装内容"
```

### 3. プッシュ・PR作成
```bash
git push origin feature/機能名
# GitHubでPull Request作成
```

## 緊急時の連携

### Slack通知設定
```bash
# .env.localに追加
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx
```

### エラー報告テンプレート
```
【エラー報告】
端末番号: 
発生時刻: 
エラー内容: 
再現手順: 
影響範囲: 
対応状況: 
```

## トラブルシューティング

### npm installエラー
```bash
# キャッシュクリア
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Supabase接続エラー
```bash
# 環境変数確認
echo $NEXT_PUBLIC_SUPABASE_URL
# Supabaseダッシュボードで接続設定確認
```

### ビルドエラー
```bash
# 型チェック
npm run type-check
# ESLint修正
npm run lint:fix
```

## 定時報告フォーマット

```
【進捗報告】端末X - HH:MM
完了タスク:
- タスク1
- タスク2

進行中:
- タスク3（進捗率: XX%）

次の1時間:
- タスク4
- タスク5

ブロッカー:
- なし / あり（詳細）
```