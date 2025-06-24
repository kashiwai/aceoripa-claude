# FINCODE テスト環境設定

## テスト環境への切り替え方法

### 1. 環境変数の変更
`.env.local` ファイルの以下の部分を変更：

```bash
# テスト環境
NEXT_PUBLIC_FINCODE_PUBLIC_KEY=p_test_M2FlYzI0OTAtZjU2YS00OTQyLWJmZTItMWFhZDQ2YjE4YTQ0MzFhMGRmZTktOTU1OS00ODViLTk0MTMtZTA3MjM0MTNhZjQ3c18yNTA0MDg4MTg1MQ
FINCODE_SECRET_KEY=m_test_MjMzNTI3NmUtODFhZi00NTY5LWFjMzctZGI1ZTVlNGZjMGZiNjkzYzc2NzUtZWIyNi00MjJmLTkxMDctODgzMWI0MTZiNTRjc18yNTA0MDg4MTg1MQ
FINCODE_SHOP_ID=s_25040881049
NEXT_PUBLIC_FINCODE_ENV=test
```

### 2. FINCODEスクリプトURLの変更
`src/components/payment/FincodePaymentForm.tsx` の178行目：

```javascript
// テスト環境
src="https://js.test.fincode.jp/v1/fincode.js"

// 本番環境
src="https://js.fincode.jp/v1/fincode.js"
```

### 3. テスト用カード情報
- カード番号: `4111111111111111`
- 名義人: `TEST USER`
- 有効期限: `12/25`
- セキュリティコード: `123`

### 4. 注意事項
- テスト環境では実際の決済は発生しません
- テスト環境のデータは本番環境には反映されません
- 本番環境に切り替える前に必ずテストを完了してください