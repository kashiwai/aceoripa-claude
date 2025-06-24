# Google OAuth 設定ガイド

## 設定完了項目

### ✅ 1. Supabase ローカル設定 (config.toml)
- Google OAuth プロバイダーを有効化
- 必要な環境変数の参照設定
- リダイレクト URL の設定

### ✅ 2. 環境変数設定
- `.env.local`: 本番環境用の Google Client ID/Secret を設定
- `.env.google`: Google OAuth専用設定ファイル  
- `.env.example`: 設定例を追加

### ✅ 3. 認証フロー
- `/auth/callback` ページで適切なコールバック処理を実装
- 新規ユーザー/既存ユーザーの処理分岐
- エラーハンドリング

## Google Cloud Console で必要な設定

### 承認済みリダイレクト URI に以下を追加:

#### 開発環境
```
http://localhost:3000/auth/callback
```

#### 本番環境  
```
https://ace-oripa.com/auth/callback
```

### Supabase クラウド設定 (必要に応じて)

Supabase のプロジェクト設定 > Authentication > Providers で:

1. **Google を有効化**
2. **Client ID**: `YOUR_GOOGLE_CLIENT_ID_HERE`
3. **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET_HERE`
4. **リダイレクト URL**: 自動設定される Supabase の URL を使用

## テスト手順

1. ローカル環境でSupabaseを起動:
   ```bash
   npx supabase start
   ```

2. Next.js開発サーバーを起動:
   ```bash
   npm run dev
   ```

3. ブラウザで `http://localhost:3000/auth/login` にアクセス

4. 「Googleでログイン」ボタンをクリック

5. Google OAuth フローが正常に動作することを確認

## トラブルシューティング

### エラー: `redirect_uri_mismatch`
- Google Cloud Console の承認済みリダイレクト URI に正しい URL が設定されていることを確認

### エラー: OAuth 設定が見つからない
- 環境変数 `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が正しく設定されていることを確認
- Supabase の config.toml でGoogle OAuth が有効化されていることを確認

### セッションエラー
- Supabase の認証設定でリダイレクト URL が許可されていることを確認
- ブラウザのクッキー設定を確認

## セキュリティ注意事項

- **Client Secret は決して公開しない**
- 本番環境では HTTPS を使用
- リダイレクト URI は厳密に管理
- 定期的に認証情報をローテーション