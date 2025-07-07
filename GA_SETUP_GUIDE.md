# Google Analytics 4 セットアップガイド

## 概要
AceoripaプロジェクトにGoogle Analytics 4（GA4）を実装し、管理画面でアクセス解析データを確認できるようになりました。

## 実装内容

### 1. GA4トラッキングコード
- 全ページでGA4のトラッキングコードが自動的に読み込まれます
- ページビュー、ユーザー行動が自動的に記録されます

### 2. 管理画面でのアクセス解析表示
管理画面ダッシュボード（`/admin`）に以下の情報が表示されます：

#### 基本メトリクス（昨日のデータ）
- **ページビュー数**: サイト全体のページ閲覧数
- **ユニークユーザー数**: 訪問したユニークなユーザー数
- **セッション数**: サイト訪問のセッション数
- **直帰率**: 1ページのみ閲覧して離脱した割合

#### トラフィックソース
- **オーガニック検索**: Google、Yahoo等の検索エンジンからの流入
- **ダイレクト**: URL直接入力やブックマークからの流入
- **SNS経由**: Twitter、Facebook、Instagram等からの流入
- **参照サイト**: 他サイトのリンクからの流入
- **広告経由**: Google広告、Facebook広告等からの流入

#### 人気ページTOP5
最もアクセスの多いページのランキング

## セットアップ手順

### 1. Google Analytics 4の設定

1. [Google Analytics](https://analytics.google.com/)にアクセス
2. 新しいプロパティを作成（GA4を選択）
3. 測定IDを取得（例：`G-XXXXXXXXXX`）

### 2. 環境変数の設定

`.env.local`に以下を追加：

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Google Analytics Data APIの設定（管理画面用）

管理画面でアクセス解析データを表示するには、Google Analytics Data APIの設定が必要です。

#### 3.1 サービスアカウントの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「サービスアカウント」を選択
5. サービスアカウントを作成し、JSONキーをダウンロード

#### 3.2 Google Analytics Data APIの有効化

1. Google Cloud Consoleで「APIとサービス」→「ライブラリ」に移動
2. 「Google Analytics Data API」を検索
3. APIを有効化

#### 3.3 GA4プロパティへのアクセス権限付与

1. Google Analyticsの管理画面に移動
2. プロパティのアクセス管理で、作成したサービスアカウントのメールアドレスを追加
3. 「閲覧者」権限を付与

#### 3.4 環境変数の追加

`.env.local`に以下を追加：

```env
# Google Analytics Data API
GA_PROPERTY_ID=123456789  # GA4のプロパティID
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"..."}  # JSONキーの内容を1行で
```

## 確認方法

1. 開発サーバーを起動：
```bash
npm run dev
```

2. サイトにアクセスして数ページを閲覧

3. Google Analyticsのリアルタイムレポートでトラッキングを確認

4. 翌日、管理画面（`/admin`）でアクセス解析データが表示されることを確認

## トラブルシューティング

### データが表示されない場合

1. **環境変数の確認**
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`が正しく設定されているか
   - `GA_PROPERTY_ID`と`GOOGLE_APPLICATION_CREDENTIALS`が設定されているか

2. **Google Analytics設定の確認**
   - GA4プロパティが正しく作成されているか
   - サービスアカウントに適切な権限が付与されているか

3. **APIの有効化確認**
   - Google Analytics Data APIが有効になっているか

4. **データの蓄積**
   - GA4は翌日のデータから表示されるため、設定直後はデータが表示されません

## カスタムイベントの追加

特定のアクションをトラッキングしたい場合：

```typescript
import * as gtag from '@/lib/gtag'

// ガチャ実行時
gtag.event({
  action: 'gacha_execute',
  category: 'engagement',
  label: gachaName,
  value: gachaPrice
})

// 決済完了時
gtag.event({
  action: 'purchase',
  category: 'ecommerce',
  label: 'points',
  value: amount
})
```

## 注意事項

- Google Analytics Data APIは無料枠がありますが、大量のリクエストには制限があります
- 管理画面のアクセス解析データは1日1回の更新で十分な場合が多いです
- プライバシーポリシーにGoogle Analyticsの使用について記載することを推奨します