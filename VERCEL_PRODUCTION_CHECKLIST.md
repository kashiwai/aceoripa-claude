# Vercel本番環境デプロイ設定確認・調整チェックリスト

## 1. Vercel環境変数設定確認

### 必須環境変数（Vercelダッシュボードで設定）
- [ ] `NEXT_PUBLIC_SUPABASE_URL`: `https://vshkekffhjbvszzpagjt.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] `OPENAI_API_KEY`: `sk-proj-SDhsJ5UEKtEHYWXLpqx367x0...`
- [ ] `NEXTAUTH_URL`: `https://ace-oripa.com`
- [ ] `NEXTAUTH_SECRET`: `aDf8Kj2mNpQ5rSt7uVwXyZ1bC4eGhJkL3nOpQrStUv`
- [ ] `GOOGLE_CLIENT_ID`: `YOUR_GOOGLE_CLIENT_ID_HERE`
- [ ] `GOOGLE_CLIENT_SECRET`: `YOUR_GOOGLE_CLIENT_SECRET_HERE`

### GMO fincode決済設定
- [ ] `NEXT_PUBLIC_FINCODE_PUBLIC_KEY`: `p_prod_OWIwZjE1YjUtMzJjMS00MWY3...`
- [ ] `FINCODE_SECRET_KEY`: `m_prod_MTgzZGI5MGItZmQ2ZC00NGUwLWIxYTc...`
- [ ] `FINCODE_SHOP_ID`: `s_25040881049`
- [ ] `NEXT_PUBLIC_FINCODE_ENV`: `prod`

### プッシュ通知設定
- [ ] `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: `BKd0k3eD1Qu3KHaP3yQ9MOHqzKmJlCcUMJYn9wDKXmBpnkGE9L0bwkUupwbQxYrh8hgHDqvDCCBPKLqPQp5cX-4`
- [ ] `VAPID_PRIVATE_KEY`: `4H_eyZXKcvCPJ6Rt4r5woCCb1zqEQ5p9j1KmYqV7DG0`

### Google Cloud設定
- [ ] `GOOGLE_CLOUD_PROJECT`: `aceoripa`
- [ ] `GOOGLE_CLOUD_LOCATION`: `us-central1`
- [ ] `VERTEX_AI_API_KEY`: `AIzaSyA_TDmS43g_8_FvRHeZIiYjPgqlZEmJ5o4`
- [ ] `GOOGLE_CLOUD_AUTH_USER`: `kousuke@restill.biz`

### Leonardo AI設定
- [ ] `LEONARDO_AI_API_KEY`: `c80b4e94-44bb-487d-8829-1725bf5ca714`

### 管理者設定
- [ ] `ADMIN_EMAIL`: `admin@aceoripa.com`
- [ ] `ADMIN_PASSWORD`: `AceoripaAdmin2024!`

### Basic認証設定
- [ ] `BASIC_AUTH_USER`: `aceoripa`
- [ ] `BASIC_AUTH_PASSWORD`: `preview2024`

## 2. 本番ドメイン設定確認

### Vercelドメイン設定
- [ ] カスタムドメイン `ace-oripa.com` が追加されている
- [ ] SSL証明書が自動発行されている
- [ ] HTTPSリダイレクトが有効になっている
- [ ] www.ace-oripa.comからのリダイレクトが設定されている

### DNS設定
- [ ] AレコードまたはCNAMEレコードがVercelに向いている
- [ ] DNS伝播が完了している

## 3. Google Cloud Console OAuth設定

### 承認済みのリダイレクトURI追加
- [ ] `https://ace-oripa.com/api/auth/callback/google`
- [ ] `https://ace-oripa.com/auth/callback`
- [ ] 開発環境のURLは本番では削除または無効化

### 承認済みのJavaScript生成元
- [ ] `https://ace-oripa.com`
- [ ] HTTPSのみ許可されていることを確認

## 4. Supabaseクラウド環境設定確認

### 認証設定
- [ ] Site URL: `https://ace-oripa.com`
- [ ] Additional redirect URLs:
  - `https://ace-oripa.com/auth/callback`
  - `https://ace-oripa.com/api/auth/callback`
- [ ] Enable email confirmations: 有効
- [ ] Enable phone confirmations: 無効（必要に応じて）

### RLS (Row Level Security) ポリシー
- [ ] users テーブルのRLSポリシーが適切に設定されている
- [ ] gacha_items テーブルのRLSポリシーが適切に設定されている
- [ ] user_gacha_history テーブルのRLSポリシーが適切に設定されている
- [ ] point_transactions テーブルのRLSポリシーが適切に設定されている

### データベース設定
- [ ] すべてのテーブルが存在している
- [ ] 初期データが投入されている
- [ ] インデックスが適切に設定されている

## 5. 本番環境での動作確認項目

### 基本機能
- [ ] トップページの表示
- [ ] ユーザー登録・ログイン
- [ ] Googleログイン
- [ ] パスワードリセット
- [ ] メール送信機能

### ガチャ機能
- [ ] ガチャページの表示
- [ ] ガチャ実行
- [ ] 結果表示
- [ ] ポイント消費・加算
- [ ] 履歴保存

### 決済機能
- [ ] ポイント購入ページ表示
- [ ] GMO fincode決済フロー
- [ ] 決済完了後のポイント加算
- [ ] 決済履歴保存

### 管理機能
- [ ] 管理者ログイン
- [ ] ガチャ設定
- [ ] ユーザー管理
- [ ] 決済履歴確認

### パフォーマンス
- [ ] ページ読み込み速度
- [ ] 画像表示
- [ ] API レスポンス時間
- [ ] メモリ使用量

### セキュリティ
- [ ] HTTPS強制
- [ ] セキュリティヘッダー
- [ ] CORS設定
- [ ] API認証

## 6. 開発環境と本番環境の設定差異

### 環境変数の違い
- **本番**: Supabaseクラウド URL/Key
- **開発**: ローカルSupabase URL/Key
- **本番**: NEXTAUTH_URL = `https://ace-oripa.com`
- **開発**: NEXTAUTH_URL = `http://localhost:3000`
- **本番**: GMO fincode本番環境
- **開発**: GMO fincodeテスト環境

### 設定ファイルの違い
- **本番**: TypeScript/ESLintエラーを無視 (next.config.js)
- **開発**: 厳密なチェック有効

### データベース
- **本番**: Supabaseクラウド（永続化）
- **開発**: ローカルまたはSupabaseクラウド

## 7. デプロイ前の最終確認

### ビルド確認
- [ ] `npm run build` がエラーなしで完了する
- [ ] TypeScriptエラーがない（必要に応じて）
- [ ] ESLintエラーがない（必要に応じて）

### 環境変数確認
- [ ] `.env.local`の内容がVercel環境変数と一致している
- [ ] 本番用のAPIキー・認証情報が設定されている
- [ ] 開発用の設定が本番に混入していない

### セキュリティ確認
- [ ] 秘密鍵やAPIキーがコードにハードコードされていない
- [ ] Basic認証が必要に応じて設定されている
- [ ] 管理者権限が適切に制限されている

## 8. デプロイ後の確認手順

### 1. 基本動作確認
```bash
curl -I https://ace-oripa.com
# HTTP/2 200 OK を確認
```

### 2. API動作確認
```bash
curl https://ace-oripa.com/api/health
# ヘルスチェックエンドポイントの確認
```

### 3. 認証機能確認
- ブラウザで https://ace-oripa.com にアクセス
- ユーザー登録・ログインをテスト
- Googleログインをテスト

### 4. 決済機能確認
- テスト用クレジットカードで決済テスト
- ポイント加算を確認
- 決済履歴を確認

### 5. エラーログ確認
- Vercelダッシュボードでログを確認
- Supabaseダッシュボードでエラーログを確認
- Google Cloud Consoleでエラーログを確認

## 9. トラブルシューティング

### よくある問題と解決方法

#### 1. 認証エラー
- Google OAuth設定のリダイレクトURIを確認
- NEXTAUTH_URLが正しく設定されているか確認
- Supabaseの認証設定を確認

#### 2. 決済エラー
- GMO fincodeの本番環境設定を確認
- APIキーが本番用になっているか確認
- CORS設定を確認

#### 3. データベースエラー
- Subabaseクラウドの接続情報を確認
- RLSポリシーが適切に設定されているか確認
- テーブル構造が最新か確認

#### 4. 画像表示エラー
- next.config.jsの画像ドメイン設定を確認
- CDNの設定を確認
- 画像URLが正しいか確認

## 10. 監視・メンテナンス

### 定期監視項目
- [ ] サイトの稼働状況
- [ ] エラーログの確認
- [ ] パフォーマンス指標
- [ ] セキュリティ更新
- [ ] 依存関係の更新

### バックアップ
- [ ] Supabaseデータベースの定期バックアップ
- [ ] 環境変数の安全な保管
- [ ] ソースコードのバージョン管理

---

## チェックリスト実行ガイド

1. **デプロイ前**: セクション1-7を完了
2. **デプロイ実行**: Vercelで自動デプロイまたは手動デプロイ
3. **デプロイ後**: セクション8-9で動作確認
4. **運用開始**: セクション10で監視体制構築

各項目を順番に確認し、問題があれば対応してから次に進んでください。