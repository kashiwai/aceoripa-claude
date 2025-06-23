# ACEORIPA LINE連携実装ガイド

## 1. LINE連携の現状

### 1.1 実装状況
- **未実装**: LINEログイン機能は現在実装されていません
- **準備済み**: ログインページにLINEボタンのUIは配置済み
- **要対応**: Supabaseは直接LINE認証をサポートしていないため、カスタム実装が必要

## 2. LINE連携で実現できること

### 2.1 LINEログイン
- ワンタップでアカウント作成/ログイン
- パスワード不要
- 若年層の利用促進

### 2.2 LINE通知
- ガチャ結果の通知
- キャンペーン情報配信
- ポイント有効期限通知

### 2.3 LINE共有
- ガチャ結果をLINEで共有
- 友達招待機能
- グループへの拡散

## 3. 実装手順

### 3.1 LINE Developersの設定

#### Step 1: LINE Developersアカウント作成
1. https://developers.line.biz/ にアクセス
2. LINEアカウントでログイン
3. プロバイダー作成

#### Step 2: LINEログインチャネル作成
```
1. 新規チャネル作成
2. チャネルの種類: LINEログイン
3. 必要情報入力:
   - チャネル名: ACEORIPA
   - チャネル説明: ポケモンカードオリパサービス
   - アプリタイプ: ウェブアプリ
```

#### Step 3: 設定値取得
```
Channel ID: [自動生成される]
Channel Secret: [自動生成される]
```

### 3.2 実装コード

#### 環境変数設定
```env
# .env.local
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CALLBACK_URL=https://your-domain.com/api/auth/line/callback
```

#### API実装 (/api/auth/line/login/route.ts)
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  const state = generateRandomState() // CSRF対策
  const nonce = generateRandomNonce() // リプレイ攻撃対策
  
  // セッションに保存
  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize')
  lineAuthUrl.searchParams.append('response_type', 'code')
  lineAuthUrl.searchParams.append('client_id', process.env.LINE_CHANNEL_ID!)
  lineAuthUrl.searchParams.append('redirect_uri', process.env.LINE_CALLBACK_URL!)
  lineAuthUrl.searchParams.append('state', state)
  lineAuthUrl.searchParams.append('scope', 'profile openid email')
  lineAuthUrl.searchParams.append('nonce', nonce)
  
  return NextResponse.redirect(lineAuthUrl.toString())
}
```

#### コールバック処理 (/api/auth/line/callback/route.ts)
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  // state検証
  // トークン取得
  const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: process.env.LINE_CALLBACK_URL!,
      client_id: process.env.LINE_CHANNEL_ID!,
      client_secret: process.env.LINE_CHANNEL_SECRET!,
    })
  })
  
  const tokens = await tokenResponse.json()
  
  // ユーザー情報取得
  const profileResponse = await fetch('https://api.line.me/v2/profile', {
    headers: { 'Authorization': `Bearer ${tokens.access_token}` }
  })
  
  const profile = await profileResponse.json()
  
  // Supabaseでユーザー作成/更新
  // セッション作成
  // リダイレクト
}
```

### 3.3 フロントエンド実装

```typescript
// LINEログインボタン
const handleLineLogin = async () => {
  window.location.href = '/api/auth/line/login'
}
```

## 4. LINE Messaging API連携

### 4.1 通知機能の実装

#### チャネル作成
```
1. Messaging APIチャネルを作成
2. Webhook URL設定
3. アクセストークン取得
```

#### プッシュ通知送信
```typescript
const sendLineNotification = async (userId: string, message: string) => {
  await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LINE_MESSAGING_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: userId,
      messages: [{
        type: 'text',
        text: message
      }]
    })
  })
}
```

### 4.2 リッチメッセージ

```typescript
// ガチャ結果の共有
const shareGachaResult = {
  type: 'flex',
  altText: 'ガチャ結果',
  contents: {
    type: 'bubble',
    hero: {
      type: 'image',
      url: cardImageUrl,
      size: 'full'
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'SS賞獲得！',
          size: 'xl',
          weight: 'bold'
        }
      ]
    }
  }
}
```

## 5. セキュリティ考慮事項

### 5.1 State検証
- CSRF攻撃防止
- ランダム文字列生成
- セッション保存

### 5.2 Nonce検証
- リプレイ攻撃防止
- 一度だけ使用
- 有効期限設定

### 5.3 スコープ制限
- 必要最小限の権限
- profile, openid, email のみ

## 6. 実装時の注意点

### 6.1 リダイレクトURL
- HTTPSが必須
- LINE Developersに事前登録
- 完全一致が必要

### 6.2 エラーハンドリング
- ユーザーがキャンセル
- 権限拒否
- ネットワークエラー

### 6.3 既存アカウントとの紐付け
- メールアドレスで照合
- 重複時の処理
- マージ機能

## 7. テスト手順

### 7.1 開発環境
1. ngrokでローカル公開
2. LINE DevelopersでリダイレクトURL設定
3. テストアカウントで動作確認

### 7.2 本番環境
1. 本番URLでリダイレクトURL更新
2. SSL証明書確認
3. 複数端末でテスト

## 8. 今後の拡張

### 8.1 LINE Pay連携
- 決済手段追加
- ポイント購入簡略化

### 8.2 LINEミニアプリ
- LINE内で完結
- よりシームレスな体験

### 8.3 LINE NFT
- デジタルカード発行
- トレード機能

## 9. 実装予定期間

### Phase 1: 基本実装（1週間）
- LINEログイン機能
- ユーザー情報取得
- アカウント連携

### Phase 2: 通知機能（1週間）
- Messaging API設定
- プッシュ通知実装
- リッチメッセージ

### Phase 3: 最適化（3日）
- エラーハンドリング改善
- UX向上
- パフォーマンス最適化