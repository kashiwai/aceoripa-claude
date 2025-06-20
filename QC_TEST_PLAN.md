# ACEorIPA ガチャアプリ 総合QCテスト計画書

## 🎯 テスト概要
- **プロジェクト**: ACEorIPA (ポケモンカード オンラインガチャサイト)
- **フェーズ**: 最終本番デプロイ前QC
- **実行者**: 端末6 (QC・インフラ担当)
- **期限**: 44時間以内完了
- **重要度**: 最高 (法的リスク・訴訟回避)

## 📋 テスト項目一覧

### 🔐 A. 認証・セキュリティテスト (Critical)
#### A1. Admin認証システム
- [ ] `/admin/login` ページ表示確認
- [ ] 正しい認証情報でログイン成功
- [ ] 不正な認証情報でログイン失敗
- [ ] 非Admin権限でのアクセス拒否
- [ ] セッション管理・自動ログアウト

#### A2. ユーザー認証システム  
- [ ] `/auth/login` ページ表示確認
- [ ] 新規ユーザー登録フロー
- [ ] Supabase認証との連携確認
- [ ] パスワードリセット機能

### 💳 B. 決済システムテスト (Critical)
#### B1. Square決済統合
- [ ] Square SDK初期化確認
- [ ] サンドボックス環境での決済テスト
- [ ] 決済成功時の処理フロー
- [ ] 決済失敗時のエラーハンドリング
- [ ] Webhook受信・検証

#### B2. ポイント管理
- [ ] ポイント付与システム
- [ ] ポイント使用・減算
- [ ] ポイント履歴表示
- [ ] 不正ポイント防止機能

### 🎰 C. ガチャシステムテスト (Critical)
#### C1. ガチャ実行機能
- [ ] ガチャ商品一覧表示
- [ ] ガチャ実行処理
- [ ] 確率計算の正確性
- [ ] カード排出・ユーザーへの付与
- [ ] 演出・UI表示

#### C2. カード管理
- [ ] カード一覧表示
- [ ] カード詳細情報
- [ ] レアリティ別表示
- [ ] 在庫管理機能

### 👨‍💼 D. Admin管理機能テスト (High)
#### D1. ユーザー管理
- [ ] ユーザー一覧表示
- [ ] ユーザー詳細・編集
- [ ] ポイント手動調整
- [ ] ユーザー検索・フィルタ

#### D2. ガチャ管理
- [ ] 新規ガチャ作成
- [ ] ガチャ編集・削除
- [ ] 確率設定機能
- [ ] ガチャ有効/無効切替

#### D3. カード管理
- [ ] カード一覧・検索
- [ ] CSV一括インポート
- [ ] カード詳細編集
- [ ] 在庫調整機能

#### D4. 売上・統計
- [ ] 売上ダッシュボード表示
- [ ] 期間別売上集計
- [ ] ユーザー統計
- [ ] レポート生成

### 📱 E. UI/UXテスト (High)
#### E1. レスポンシブ対応
- [ ] スマホ表示 (375px-414px)
- [ ] タブレット表示 (768px-1024px) 
- [ ] デスクトップ表示 (1200px+)
- [ ] 画面回転対応

#### E2. ナビゲーション
- [ ] メニュー操作
- [ ] ページ遷移
- [ ] ブラウザバック/フォワード
- [ ] ディープリンク対応

### 🗄️ F. データベース・API テスト (High)
#### F1. Supabase連携
- [ ] データベース接続確認
- [ ] CRUD操作正常性
- [ ] トランザクション処理
- [ ] データ整合性

#### F2. API エンドポイント
- [ ] `/api/auth/*` 認証API
- [ ] `/api/gacha/*` ガチャAPI  
- [ ] `/api/admin/*` 管理API
- [ ] `/api/user/*` ユーザーAPI

### ⚖️ G. 法的対応テスト (Critical)
#### G1. 法的ページ表示
- [ ] `/legal/terms` 特定商取引法
- [ ] `/legal/prize-law` 景品表示法  
- [ ] `/legal/privacy` プライバシーポリシー
- [ ] 各ページの内容正確性

#### G2. ガチャ確率表示
- [ ] 確率の正確な表示
- [ ] コンプガチャ禁止確認
- [ ] 青少年保護機能
- [ ] 過度課金防止策

### 🔔 H. 通知・連携テスト (Medium)
#### H1. お知らせ機能
- [ ] お知らせ作成・編集
- [ ] 優先度別表示
- [ ] 公開日時設定
- [ ] 通知との連携

#### H2. プッシュ通知
- [ ] 通知許可要求
- [ ] 通知送信テスト
- [ ] セグメント配信
- [ ] 配信履歴確認

#### H3. ランキング機能
- [ ] ランキング表示
- [ ] 期間別集計
- [ ] ユーザー順位表示
- [ ] リアルタイム更新

### 📦 I. 発送管理テスト (Medium)
#### I1. 発送管理機能
- [ ] 発送一覧表示
- [ ] ステータス更新
- [ ] 追跡番号管理
- [ ] 配送ラベル生成

#### I2. CSVエクスポート
- [ ] 発送データ出力
- [ ] 形式の正確性
- [ ] 文字化け確認
- [ ] 大量データ処理

## 🚨 Critical Issues (即修正要)
### 優先度1: システム停止リスク
- データベース接続エラー
- 決済処理失敗
- 認証システム障害
- 法的ページ表示不具合

### 優先度2: 機能不具合
- ガチャ確率計算エラー
- カード付与失敗
- Admin機能障害
- UI表示崩れ

### 優先度3: 品質改善
- パフォーマンス問題
- ユーザビリティ課題
- SEO対応不足
- アクセシビリティ

## 🛠️ テスト環境
### ローカル開発環境
- URL: `http://localhost:9012`
- Database: Supabase Local
- Payment: Square Sandbox

### ステージング環境
- URL: `https://classy-concha-73607d.netlify.app`
- Database: Supabase Production
- Payment: Square Sandbox

## 📊 テスト実行記録

### テスト実行ログ
```
Date: 2024-06-21
Environment: Local/Staging
Tester: Terminal-6 (QC)

[実行中] A1. Admin認証システム
[実行中] B1. Square決済統合  
[待機中] C1. ガチャ実行機能
...
```

### 発見バグ・問題点
```
BUG-001: [Critical] Admin login redirect loop
Status: 修正完了
File: src/app/admin/layout.tsx

BUG-002: [High] ESLint build errors
Status: 修正完了  
File: .eslintrc.json

BUG-003: [Medium] Next.js 15 type errors
Status: 修正完了
Files: src/app/admin/cards/page.tsx, etc.
```

## ✅ テスト完了基準
1. **全Critical項目**: 100% PASS
2. **全High項目**: 95% PASS
3. **Medium項目**: 90% PASS
4. **パフォーマンス**: 3秒以内読み込み
5. **セキュリティ**: 脆弱性ゼロ
6. **法的対応**: 100% 適合

## 📝 最終承認フロー
1. QCテスト完了報告
2. 各端末機能確認
3. 統合テスト実施
4. 本番環境デプロイ承認
5. リリース実行

---
**🚀 目標: 44時間以内本番リリース成功**