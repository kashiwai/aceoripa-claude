# Supabase認証問題の解決方法

## 問題
- 新規登録したユーザーがAuth管理画面に表示されない
- 確認メールが送信されない
- ログインができない

## 解決方法

### 方法1: メール確認を無効化（開発環境推奨）

1. Supabaseダッシュボード → Authentication → Settings
2. **Email Auth**セクション
3. **Enable email confirmations**を**OFF**にする
4. 保存

これにより、ユーザーは登録後すぐにログイン可能になります。

### 方法2: カスタムSMTP設定（本番環境推奨）

1. Supabaseダッシュボード → Settings → Auth
2. **SMTP Settings**セクション
3. カスタムSMTPサーバーを設定：
   - SendGrid
   - Amazon SES
   - その他のSMTPサービス

### 方法3: ローカル開発用の設定

`.env.local`に以下を追加：
```
# メール確認をスキップ（開発環境のみ）
NEXT_PUBLIC_SUPABASE_DISABLE_EMAIL_CONFIRMATION=true
```

### 方法4: 手動でユーザーを確認

Supabaseダッシュボードで：
1. Authentication → Users
2. 該当ユーザーの行をクリック
3. "Confirm email"ボタンをクリック

## デバッグ用SQLクエリ

Supabaseの SQL Editorで実行：

```sql
-- すべてのユーザーを表示（確認済み・未確認含む）
SELECT id, email, email_confirmed_at, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 未確認のユーザーを確認
SELECT id, email, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- 特定のユーザーを手動で確認（メールアドレスを置き換え）
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

## 推奨設定

### 開発環境
- メール確認を無効化
- ローカルテスト用のユーザーを作成

### 本番環境
- カスタムSMTPを設定
- メール確認を有効化
- レート制限に注意