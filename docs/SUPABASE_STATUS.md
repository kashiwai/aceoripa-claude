# Supabase開発環境状況

## ローカル環境
✅ **Supabaseローカル環境起動済み**

### 接続情報
- **API URL**: http://127.0.0.1:54321
- **GraphQL URL**: http://127.0.0.1:54321/graphql/v1
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Inbucket URL**: http://127.0.0.1:54324 (メールテスト用)
- **Studio URL**: http://127.0.0.1:54323 (管理画面)

### 認証キー（開発用）
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

## データベーススキーマ
✅ **マイグレーション適用済み**
- `/supabase/migrations/001_initial_schema.sql` が自動適用されています

### テーブル一覧
- `users` - ユーザー情報
- `cards` - カード情報
- `user_cards` - ユーザーのカードコレクション
- `gacha_products` - ガチャ商品
- `gacha_pools` - ガチャの排出設定
- `transactions` - 取引履歴
- `gacha_results` - ガチャ結果
- `user_points` - ユーザーポイント
- `point_transactions` - ポイント取引履歴

## 本番環境への準備

### 1. Supabaseクラウドプロジェクト作成
1. https://supabase.com/dashboard にアクセス
2. 新規プロジェクト作成
3. プロジェクト名: `aceoripa-prod`
4. データベースパスワード設定

### 2. 本番環境の環境変数
プロジェクト作成後、Settings > API から以下を取得：
- Project URL
- anon public key
- service_role key

### 3. マイグレーション適用
```bash
# 本番環境に接続
supabase link --project-ref [PROJECT_REF]

# マイグレーション適用
supabase db push
```

## 管理者アカウント設定
- メール: `admin@aceoripa.com`
- パスワード: `AceoripaAdmin2024!`
- 環境変数で管理（ハードコード削除済み）

## 次のステップ
1. 本番Supabaseプロジェクト作成
2. Square決済の設定
3. LINE/Google認証の設定
4. Netlifyへの環境変数設定