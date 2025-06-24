# OAuth連携セットアップガイド

## 概要
ACEORIPAでは、Google、X (Twitter)、LINEの3つのソーシャルログインに対応しています。
このドキュメントでは、各プロバイダーの設定方法を説明します。

## 1. Google OAuth連携

### 1.1 Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. **APIs & Services** → **Credentials** に移動
4. **CREATE CREDENTIALS** → **OAuth client ID** を選択
5. Application typeは **Web application** を選択
6. 以下の設定を行う：
   - **Name**: ACEORIPA (任意)
   - **Authorized JavaScript origins**: 
     - `https://[YOUR-SUPABASE-PROJECT].supabase.co`
     - `http://localhost:3000` (開発用)
   - **Authorized redirect URIs**:
     - `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`

### 1.2 Supabaseでの設定

1. Supabaseダッシュボードにログイン
2. **Authentication** → **Providers** に移動
3. **Google** を有効化
4. Google Cloud ConsoleからコピーしたClient IDとClient Secretを入力
5. **Save** をクリック

## 2. X (Twitter) OAuth連携

### 2.1 Twitter Developer Portalでの設定

1. [Twitter Developer Portal](https://developer.twitter.com/)にアクセス
2. アプリを作成または既存のアプリを選択
3. **Settings** → **User authentication settings** で **Edit** をクリック
4. 以下の設定を行う：
   - **App permissions**: Read (必要に応じて変更)
   - **Type of App**: Web App
   - **Callback URI / Redirect URL**:
     - `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`
   - **Website URL**: `https://aceoripa.com` (本番URL)

### 2.2 Supabaseでの設定

1. Supabaseダッシュボードで **Authentication** → **Providers** に移動
2. **Twitter** を有効化
3. API KeyとAPI Key Secretを入力
4. **Save** をクリック

## 3. LINE OAuth連携

### 3.1 LINE Developersでの設定

1. [LINE Developers](https://developers.line.biz/)にアクセス
2. 新しいチャネルを作成（LINE Login）
3. 以下の設定を行う：
   - **Channel name**: ACEORIPA
   - **Channel description**: オンラインガチャサービス
   - **App types**: Web app
   - **Callback URL**:
     - `https://[YOUR-APP-URL]/api/auth/line/callback`
     - `http://localhost:3000/api/auth/line/callback` (開発用)

### 3.2 アプリケーションでの設定

環境変数に以下を追加：
```
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
```

## 4. Supabase認証の設定

### 4.1 Redirect URLsの設定

Supabaseダッシュボードで **Authentication** → **URL Configuration** に移動し、以下を設定：

- **Site URL**: `https://aceoripa.com` (本番) または `http://localhost:3000` (開発)
- **Redirect URLs**:
  - `https://aceoripa.com/auth/callback`
  - `http://localhost:3000/auth/callback`

### 4.2 Email認証の設定

**Authentication** → **Email Templates** で各テンプレートをカスタマイズ可能。

## 5. 実装の確認事項

### 5.1 コールバックページ

`/src/app/auth/callback/page.tsx` が正しく実装されていることを確認。

### 5.2 環境変数

以下の環境変数が設定されていることを確認：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `LINE_CHANNEL_ID` (LINE連携用)
- `LINE_CHANNEL_SECRET` (LINE連携用)

### 5.3 本番環境の設定

本番デプロイ前に以下を確認：
1. 各OAuth providerで本番URLを追加
2. Supabaseで本番URLをRedirect URLsに追加
3. 環境変数を本番環境に設定

## トラブルシューティング

### エラー: "Callback URL mismatch"
- OAuth providerとSupabaseで設定したCallback URLが一致しているか確認

### エラー: "Invalid client"
- Client IDとClient Secretが正しくコピーされているか確認
- Supabaseで保存されているか確認

### LINE連携でリダイレクトループ
- Callback URLが正しく設定されているか確認
- Channel IDとChannel Secretが正しいか確認