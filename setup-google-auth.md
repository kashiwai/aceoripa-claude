# Google Vertex AI 認証設定

## 1. Google Cloud Console での設定

### ステップ1: サービスアカウント作成
1. https://console.cloud.google.com/iam-admin/serviceaccounts にアクセス
2. プロジェクト「aceoripa」を選択
3. 「サービスアカウントを作成」をクリック

### ステップ2: 権限設定
サービスアカウントに以下の権限を追加：
```
- Vertex AI User
- AI Platform Developer
- Storage Object Viewer
```

### ステップ3: キー生成
1. 作成したサービスアカウントをクリック
2. 「キー」タブ → 「鍵を追加」→「新しい鍵を作成」
3. **JSON形式**を選択してダウンロード

## 2. ローカル設定

### ファイル配置
```bash
# プロジェクトルートに配置
/Users/kotarokashiwai/aceoripa/aceoripa/aceoripa-claude/
├── google-service-account.json  # ← ここに配置
└── .env.local
```

### 環境変数更新
```bash
# .env.local に追加
GOOGLE_APPLICATION_CREDENTIALS=/Users/kotarokashiwai/aceoripa/aceoripa/aceoripa-claude/google-service-account.json
GOOGLE_CLOUD_PROJECT=aceoripa
GOOGLE_CLOUD_LOCATION=us-central1
```

## 3. 必要なAPI有効化

Google Cloud Consoleで以下のAPIを有効化：
```
- Vertex AI API
- AI Platform API  
- Cloud Storage API
```

## 4. 認証テスト用スクリプト

サービスアカウントキー設置後、以下で認証をテスト：
```bash
node test-google-vertex-auth.js
```

## 代替案: REST API直接呼び出し

サービスアカウント設定が複雑な場合：

### OAuth 2.0 トークン取得
```javascript
// Google Auth Library使用
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  keyFile: 'google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const client = await auth.getClient();
const accessToken = await client.getAccessToken();
```

## トラブルシューティング

### よくあるエラー
1. **401 Unauthorized**: サービスアカウントキーの配置を確認
2. **403 Forbidden**: IAM権限を確認
3. **API not enabled**: Vertex AIの有効化を確認

### 確認コマンド
```bash
# プロジェクトID確認
gcloud config get-value project

# 認証状態確認  
gcloud auth list

# API有効化確認
gcloud services list --enabled | grep vertex
```