# ACEORIPA SNS連携仕様書

## 1. 現在の実装状況

### 1.1 実装済み機能
- 基本的なメール/パスワード認証のみ

### 1.2 未実装機能
- Google/X(Twitter)/LINEログイン
- SNS共有機能
- SNS連携キャンペーン

## 2. SNS連携計画

### 2.1 優先順位
1. **Google認証** - 実装が簡単、ユーザー数多い
2. **LINE認証** - 日本で人気、若年層に強い
3. **X(Twitter)認証** - ゲーム系と相性良い
4. **その他** - Facebook、Apple ID

### 2.2 実装スケジュール
- Phase 1: Google認証（1週間）
- Phase 2: LINE認証（2週間）
- Phase 3: X認証（1週間）
- Phase 4: SNS共有機能（1週間）

## 3. Google認証実装仕様

### 3.1 必要な設定
1. Google Cloud Console設定
   - OAuth 2.0クライアントID作成
   - 認証済みリダイレクトURI設定
   - APIキー取得

2. Supabase設定
   ```
   Authentication → Providers → Google
   - Enable Google provider
   - Client ID入力
   - Client Secret入力
   ```

### 3.2 実装コード例
```typescript
// Google認証
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email profile'
    }
  })
}
```

## 4. LINE認証実装仕様

### 4.1 必要な設定
1. LINE Developers設定
   - LINEログインチャネル作成
   - Channel ID/Secret取得
   - コールバックURL設定

2. カスタム実装が必要
   - SupabaseはLINE未対応
   - Custom OAuth flowの実装

### 4.2 実装フロー
1. LINE認証ページへリダイレクト
2. ユーザー認証後コールバック
3. アクセストークン取得
4. ユーザー情報取得
5. Supabaseにユーザー作成/更新

## 5. X(Twitter)認証実装仕様

### 5.1 必要な設定
1. Twitter Developer Portal
   - App作成
   - API Key/Secret取得
   - OAuth 2.0設定

2. Supabase設定
   ```
   Authentication → Providers → Twitter
   - Enable Twitter provider
   - API Key入力
   - API Secret入力
   ```

### 5.2 実装コード例
```typescript
// Twitter認証
const signInWithTwitter = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}
```

## 6. SNS共有機能

### 6.1 共有対象
- ガチャ結果
- 獲得カード
- ランキング
- キャンペーン情報

### 6.2 共有先
- X(Twitter)
- LINE
- Instagram Stories
- Facebook

### 6.3 実装例

#### Twitter共有
```typescript
const shareToTwitter = (text: string, url: string) => {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  window.open(tweetUrl, '_blank')
}
```

#### LINE共有
```typescript
const shareToLine = (text: string, url: string) => {
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text + ' ' + url)}`
  window.open(lineUrl, '_blank')
}
```

## 7. SNS連携キャンペーン

### 7.1 フォロー&リツイートキャンペーン
- 公式アカウントフォロー確認
- 指定投稿のリツイート確認
- 自動でポイント付与

### 7.2 ハッシュタグキャンペーン
- #ACEORIPA でツイート
- 投稿内容をAI判定
- 条件クリアで特典

### 7.3 友達招待キャンペーン
- LINE/Twitter経由の招待
- 専用URLトラッキング
- 成果報酬型特典

## 8. プライバシー・セキュリティ

### 8.1 取得情報
- 最小限の情報のみ取得
- メールアドレス
- 表示名
- プロフィール画像（任意）

### 8.2 情報の利用
- ログイン認証のみ
- マーケティング利用なし
- 第三者提供なし

### 8.3 連携解除
- いつでも解除可能
- マイページから操作
- データは保持/削除選択可

## 9. エラーハンドリング

### 9.1 認証エラー
- ユーザーキャンセル
- 権限不足
- ネットワークエラー

### 9.2 対処法
```typescript
try {
  await signInWithProvider(provider)
} catch (error) {
  if (error.code === 'access_denied') {
    toast.error('認証がキャンセルされました')
  } else {
    toast.error('認証エラーが発生しました')
  }
}
```

## 10. 実装チェックリスト

### Google認証
- [ ] Google Cloud Console設定
- [ ] Supabase Provider設定
- [ ] ログインボタン実装
- [ ] コールバック処理
- [ ] エラーハンドリング

### LINE認証
- [ ] LINE Developers設定
- [ ] カスタムOAuth実装
- [ ] ログインボタン実装
- [ ] トークン管理
- [ ] ユーザー情報取得

### X(Twitter)認証
- [ ] Developer Portal設定
- [ ] Supabase Provider設定
- [ ] ログインボタン実装
- [ ] コールバック処理
- [ ] エラーハンドリング

### SNS共有
- [ ] 共有ボタンUI
- [ ] 各SNS共有関数
- [ ] OGP設定
- [ ] 共有テンプレート
- [ ] アナリティクス連携