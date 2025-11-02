# デプロイ手順書

## 本番環境へのデプロイ（Google App Engine）

### 前提条件

1. Google Cloud CLIがインストールされている
2. Google Cloud Projectへのアクセス権限がある
3. プロジェクトID: `aceoripa`

### Google Cloud CLIのインストール

まだインストールしていない場合:

```bash
# macOSの場合
brew install google-cloud-sdk

# または公式インストーラー
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### デプロイ手順

#### 1. Google Cloudへの認証

```bash
# 初回のみ: Google Cloudにログイン
gcloud auth login

# プロジェクトを設定
gcloud config set project aceoripa
```

#### 2. ビルドとデプロイ

```bash
# 1. 最新のコードを取得
git pull origin aceoripa_claude

# 2. 依存関係のインストール
npm install

# 3. 本番ビルド
npm run build

# 4. Google App Engineにデプロイ
gcloud app deploy
```

#### 3. デプロイの確認

```bash
# デプロイされたアプリを開く
gcloud app browse

# ログを確認
gcloud app logs tail -s default
```

### 環境変数の設定

本番環境の環境変数は `app.yaml` に設定済みです：

- `NODE_ENV`: production
- `NEXT_PUBLIC_SUPABASE_URL`: Supabaseエンドポイント
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase公開キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseサービスロールキー
- `FINCODE_*`: Fincode決済関連キー
- その他のAPI キー

### デプロイ後の確認項目

1. アプリが正常に起動しているか
   ```bash
   gcloud app logs tail -s default
   ```

2. ガチャ機能が正常に動作するか
   - ログイン → ガチャ選択 → ガチャ実行
   - 5連、20連、50連などの任意回数でカウントが正しく表示されるか確認

3. 決済機能が正常に動作するか
   - ポイント購入
   - 決済完了

4. データベース接続が正常か
   - ユーザー登録
   - カード取得履歴

### ロールバック

問題が発生した場合、前のバージョンに戻すことができます：

```bash
# バージョン一覧を確認
gcloud app versions list

# 特定のバージョンにロールバック
gcloud app versions migrate <前のバージョンID>
```

### トラブルシューティング

#### デプロイが失敗する場合

```bash
# ビルドエラーを確認
npm run build

# 型エラーを確認
npm run type-check
```

#### アプリが起動しない場合

```bash
# ログを確認
gcloud app logs tail -s default

# インスタンスの状態を確認
gcloud app instances list
```

### 自動デプロイの設定（オプション）

GitHub Actionsを使用した自動デプロイを設定できます：

1. `.github/workflows/deploy.yml` を作成
2. Google Cloudサービスアカウントキーをシークレットに追加
3. mainブランチへのプッシュ時に自動デプロイ

詳細は[GitHub Actions + GCP デプロイガイド](https://cloud.google.com/build/docs/automating-builds/github/build-repos-from-github)を参照してください。

## 開発環境での動作確認

デプロイ前に開発環境でテスト：

```bash
# 開発サーバー起動
npm run dev

# 本番ビルドをローカルで確認
npm run build
npm run start
```

## 最近の更新内容

### 2025-01-19: ガチャカウント管理修正

- useRefによる永続的なカウンター管理を実装
- 20回、50回など任意回数のガチャで正確にカウント
- 重複カードIDによる問題を解決
- ハードコードされた値を削除し完全動的化

この修正により、任意の回数（1回、5回、20回、50回など）のガチャで、カウンターが正しく「1/N → 2/N → ... → N/N」と表示されます。

---

## サポート

問題が発生した場合は、以下を確認してください：

1. ログファイル: `/tmp/build.log`, `/tmp/typecheck.log`
2. GitHub Issues: https://github.com/kashiwai/aceoripa-claude/issues
3. 開発チームへの連絡

## 参考リンク

- [Google App Engine ドキュメント](https://cloud.google.com/appengine/docs)
- [Next.js デプロイメント](https://nextjs.org/docs/deployment)
- [Supabase ドキュメント](https://supabase.com/docs)
