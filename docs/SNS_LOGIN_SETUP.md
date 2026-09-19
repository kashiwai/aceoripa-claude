# SNSログイン設定手順書

Aceoripaプロジェクトで Twitter (X) と LINE のソーシャルログインを有効化するための設定手順です。

---

## 📋 概要

この手順書では以下を設定します：

- **Twitter (X) OAuth 2.0** ログイン
- **LINE Login** ログイン
- **Supabase認証プロバイダー** 設定

**所要時間**: 30-60分

---

## 🔷 Part 1: Twitter (X) OAuth設定

### 1.1 Twitter Developer Portalへアクセス

1. [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard) にアクセス
2. Twitterアカウントでログイン
3. 「Projects & Apps」セクションへ移動

### 1.2 新規アプリ作成

1. **「+ Create App」**をクリック
2. アプリ名を入力: `Aceoripa`（または任意の名前）
3. 環境を選択: `Production`

### 1.3 OAuth設定

1. 作成したアプリの **「Settings」** タブへ移動
2. **「User authentication settings」** セクションで **「Set up」** をクリック
3. 以下を設定：

   **App permissions**:
   - ✅ `Read` を選択

   **Type of App**:
   - ✅ `Web App, Automated App or Bot` を選択

   **App info**:
   - **Callback URLs / Redirect URLs**:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     ※ `YOUR_SUPABASE_PROJECT_REF` は後ほどSupabaseから取得

   - **Website URL**:
     ```
     https://ace-oripa.com
     ```

   - **Terms of service** (任意):
     ```
     https://ace-oripa.com/terms
     ```

   - **Privacy policy** (任意):
     ```
     https://ace-oripa.com/privacy
     ```

4. **「Save」** をクリック

### 1.4 認証情報を取得

1. **「Keys and tokens」** タブへ移動
2. **OAuth 2.0 Client ID and Client Secret** セクションで以下を取得：
   - **Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxx`
   - **Client Secret**: `yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

3. **⚠️ 重要**: これらの値をメモしてください（後で使用します）

---

## 🟢 Part 2: LINE Login設定

### 2.1 LINE Developersへアクセス

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. LINEアカウントでログイン
3. **「Create a new provider」** をクリック

### 2.2 プロバイダー作成

1. **Provider name**: `Aceoripa` と入力
2. **「Create」** をクリック

### 2.3 チャネル作成

1. 作成したプロバイダーをクリック
2. **「Create a LINE Login channel」** をクリック
3. 以下を入力：

   - **Channel name**: `Aceoripa Login`
   - **Channel description**: `Aceoripaのログイン認証`
   - **App types**: `Web app` を選択
   - **Email address**: あなたのメールアドレス
   - **Privacy policy URL**: `https://ace-oripa.com/privacy`
   - **Terms of use URL**: `https://ace-oripa.com/terms`

4. 利用規約に同意して **「Create」** をクリック

### 2.4 チャネル設定

1. 作成したチャネルの **「Basic settings」** タブへ移動
2. **Channel ID** と **Channel secret** をメモ
3. **「LINE Login」** タブへ移動
4. **Callback URL** を追加：

   **ローカル開発用**:
   ```
   http://localhost:3000/api/auth/line/callback
   ```

   **本番環境用**:
   ```
   https://ace-oripa.com/api/auth/line/callback
   ```

   ※ 両方を追加してください

5. **「Update」** をクリック

### 2.5 認証情報を取得

以下の値をメモしてください：
- **Channel ID**: `1234567890`
- **Channel Secret**: `abcdefghijklmnopqrstuvwxyz123456`

---

## 🔵 Part 3: Supabase設定

### 3.1 Supabaseプロジェクト情報を取得

1. [Supabase Dashboard](https://app.supabase.com) にアクセス
2. Aceoripaプロジェクトを選択
3. **Settings** → **API** へ移動
4. **Project URL** をコピー:
   ```
   https://abcdefghijklmnop.supabase.co
   ```
5. **Project Ref** を確認（URLの `abcdefghijklmnop` 部分）

### 3.2 Twitter認証プロバイダー設定

1. Supabase Dashboard で **Authentication** → **Providers** へ移動
2. **Twitter** を検索してクリック
3. 以下を設定：

   - **Enable Sign in with Twitter**: ✅ ONにする
   - **Client ID (API Key)**: Part 1.4で取得したTwitter Client ID
   - **Client Secret (API Secret Key)**: Part 1.4で取得したTwitter Client Secret

4. **「Save」** をクリック

### 3.3 Twitter Developer Portalでコールバック URL更新

1. Twitter Developer Portalに戻る
2. アプリの **「Settings」** → **「User authentication settings」** → **「Edit」**
3. **Callback URLs** を以下に変更：
   ```
   https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
   ```
   例: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

4. **「Save」** をクリック


### 3.4 LINE認証設定

✅ **良いニュース**: LINEカスタムOAuthフローは既に実装済みです！

**既に実装されているもの**:
- `/api/auth/line` - LINE OAuth開始エンドポイント
- `/api/auth/line/callback` - LINEコールバック処理
- `/auth/line-callback` - クライアント側処理ページ

**必要な作業**:
- 環境変数の設定のみ（Part 4参照）

SupabaseはLINEをネイティブサポートしていませんが、カスタムフローで完全に動作します。

---

## 🔧 Part 4: 環境変数設定

### 4.1 .env.local ファイル編集

プロジェクトルートの `.env.local` ファイルを編集します：

```bash
# Supabase（既存）
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（既存の値）
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Twitter OAuth（新規追加）
# SupabaseのTwitterプロバイダー設定で自動的に処理されます
# 特別な環境変数は不要です

# LINE Login（新規追加）
NEXT_PUBLIC_LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### 4.2 本番環境（Netlify）の環境変数設定

1. [Netlify Dashboard](https://app.netlify.com) にアクセス
2. Aceoripaサイトを選択
3. **Site settings** → **Environment variables** へ移動
4. 以下を追加：

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_APP_URL` | `https://ace-oripa.com` |
   | `NEXT_PUBLIC_LINE_CHANNEL_ID` | （LINE Channel ID） |
   | `LINE_CHANNEL_SECRET` | （LINE Channel Secret） |

   **注意**: TwitterはSupabaseが管理するため、追加の環境変数は不要です

5. **「Save」** をクリック
6. **「Trigger deploy」** でサイトを再デプロイ

---

## ✅ Part 5: 動作確認

### 5.1 ローカル環境でテスト

1. 開発サーバーを再起動：
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000/auth/login` にアクセス

3. **「Googleでログイン」** ボタンをクリック
   - ✅ Google OAuth画面が表示されることを確認

4. **「X (Twitter) でログイン」** ボタンをクリック
   - ✅ Twitter OAuth画面が表示されることを確認
   - ✅ ログイン後、Aceoripaにリダイレクトされることを確認

5. **「LINEでログイン」** ボタン
   - ⚠️ カスタム実装完了後にテスト

### 5.2 本番環境でテスト

1. `https://ace-oripa.com/auth/login` にアクセス
2. 上記と同様にテスト

### 5.3 トラブルシューティング

**エラー: "Invalid redirect URI"**
- Twitter/LINE Developer Consoleで設定したCallback URLを確認
- Supabaseのコールバック URLと一致しているか確認

**エラー: "OAuth configuration not found"**
- Supabase Dashboardで認証プロバイダーが有効になっているか確認
- 環境変数が正しく設定されているか確認

**ログイン後にリダイレクトされない**
- `auth/callback` ページが正しく実装されているか確認
- ブラウザのコンソールでエラーログを確認

---

## 📝 チェックリスト

設定完了前に以下を確認してください：

### Twitter設定
- [ ] Twitter Developer Portalでアプリ作成完了
- [ ] OAuth 2.0 Client ID/Secret取得完了
- [ ] Callback URL設定完了（Supabase URL）
- [ ] Supabase DashboardでTwitterプロバイダー有効化完了
- [ ] コード修正完了（ボタン有効化済み）

### LINE設定
- [ ] LINE Developersでプロバイダー/チャネル作成完了
- [ ] Channel ID/Secret取得完了
- [ ] Callback URL設定完了（`https://ace-oripa.com/api/auth/line/callback`）
- [ ] 環境変数設定完了（ローカル & 本番）
- [ ] コード修正完了（ボタン有効化済み、カスタムOAuthフロー実装済み）

### 動作確認
- [ ] ローカル環境でTwitterログイン成功
- [ ] 本番環境でTwitterログイン成功
- [ ] ユーザー情報が正しくSupabaseに保存される
- [ ] ログイン後、正しいページにリダイレクトされる

---

## 🎯 次のステップ

設定が完了したら、以下を実施してください：

1. **私（Claude）に報告**: 「Twitter設定完了しました」とお知らせください
2. **コード修正を依頼**: ログインページのdisabledを削除します
3. **テスト**: ログイン機能が正常に動作することを確認
4. **デプロイ**: 問題なければ本番環境にデプロイ

---

## 📞 サポート

設定中に問題が発生した場合は、以下の情報を添えてご連絡ください：

- エラーメッセージ
- どのステップで発生したか
- ブラウザのコンソールログ
- 設定画面のスクリーンショット

---

*最終更新: 2025-10-21*
