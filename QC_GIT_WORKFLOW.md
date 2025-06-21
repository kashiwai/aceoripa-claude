# Git活用 分散QCテスト実行ガイド

## 🎯 Git連携テスト体制

### 📋 基本ルール
1. **各端末は独立してテスト実行**
2. **GitHub Issuesで進捗・結果報告**
3. **リアルタイム情報共有**
4. **統合管理は端末6が担当**

## 🚀 テスト開始準備

### 1. リポジトリクローン・環境構築
```bash
# 最新コードを取得
git clone https://github.com/kashiwai/aceoripa-claude.git
cd aceoripa-claude
git checkout aceoripa_claude

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を自分の環境に合わせて編集

# 開発サーバー起動
npm run dev
```

### 2. 自分の担当テスト確認
```bash
# テスト計画確認
cat QC_DISTRIBUTED_PLAN.md

# 担当セクション確認
# 端末1: フロントエンド・UI/UX
# 端末2: バックエンド・API  
# 端末3: ガチャシステム
# 端末4: Admin・決済
# 端末5: 演出・エンタメ
# 端末6: QC・インフラ統合
```

## 📊 GitHub Issues活用方法

### 🎯 Issue作成ルール

#### A. テスト開始時
1. **GitHub Issues** → **New Issue** 
2. **"QCテスト報告"** テンプレート選択
3. タイトル形式: `[QC] 端末X - テスト項目名 - MM/DD HH:MM`
   ```
   例: [QC] 端末1 - レスポンシブデザイン確認 - 06/21 14:30
   ```

#### B. バグ発見時
1. **GitHub Issues** → **New Issue**
2. **"バグ報告"** テンプレート選択  
3. タイトル形式: `[BUG] 問題の概要`
   ```
   例: [BUG] Admin画面でユーザー一覧が表示されない
   ```

#### C. 進捗報告 (毎時)
既存のQC Issue を **コメント更新**:
```markdown
## 進捗報告 - HH:MM

**完了項目**: 
- ✅ スマホ表示確認 (375px-414px)
- ✅ タブレット表示確認 (768px-1024px)

**進行中**:
- 🔄 デスクトップ表示確認 (1200px+)

**次の予定**:
- アクセシビリティチェック
- クロスブラウザテスト

**問題**: なし / [問題があれば記載]
```

### 📱 ラベル管理システム

#### 端末別ラベル
- 🏷️ `terminal-1` - 端末1担当
- 🏷️ `terminal-2` - 端末2担当  
- 🏷️ `terminal-3` - 端末3担当
- 🏷️ `terminal-4` - 端末4担当
- 🏷️ `terminal-5` - 端末5担当
- 🏷️ `terminal-6` - 端末6担当

#### 優先度ラベル
- 🔴 `priority-critical` - 即座修正必要
- 🟠 `priority-high` - 4時間以内修正
- 🟡 `priority-medium` - 24時間以内修正
- 🟢 `priority-low` - 修正推奨

#### ステータスラベル
- 🔄 `status-testing` - テスト実行中
- ✅ `status-passed` - テスト合格
- ❌ `status-failed` - テスト失敗
- 🔧 `status-fixing` - 修正中
- 🎯 `status-verified` - 修正確認済み

## 🔄 リアルタイム連携フロー

### 毎時報告 (XX:00)
```bash
# 1. GitHub Issuesで進捗コメント追加
# 2. 問題があれば即座にバグIssue作成
# 3. 他端末の進捗確認 (Issues一覧チェック)
```

### 緊急時連携 (Critical Issue発見)
```bash
# 1. バグIssue即座作成 (Critical ラベル)
# 2. Issue タイトルに 🚨 絵文字追加
# 3. 関連端末を @mention で通知
# 4. 修正可能な端末が対応開始
```

### ブロッカー対応
```bash
# 1. ブロッカーIssue作成 (priority-critical)
# 2. 影響を受ける端末を明記
# 3. 回避策があれば記載
# 4. 解決後に影響端末に通知
```

## 🛠️ 各端末テスト実行ガイド

### 📱 端末1: フロントエンド・UI/UX
```bash
# レスポンシブテスト実行
npm run test:frontend

# 手動テスト
# 1. Chrome DevTools でレスポンシブ確認
# 2. 各画面サイズでの動作確認
# 3. アクセシビリティチェック
# 4. 結果をGitHub Issues に報告
```

### 🔧 端末2: バックエンド・API
```bash
# API テスト実行
npm run test:api

# データベーステスト
npm run db:reset  # 注意: テストデータがリセットされます
npm run db:migrate

# パフォーマンステスト
npm run test:lighthouse
```

### 🎰 端末3: ガチャシステム
```bash
# ガチャ確率テスト
node scripts/gacha-probability-test.js

# 手動テスト
# 1. ガチャ実行 (100回テスト推奨)
# 2. 確率分布確認
# 3. 演出・UI確認
# 4. 結果記録・報告
```

### 👨‍💼 端末4: Admin・決済
```bash
# Admin機能テスト
# 1. http://localhost:9012/admin/login
# 2. 各管理機能の動作確認
# 3. Square決済テスト (サンドボックス)
# 4. セキュリティチェック

# CSV インポートテスト
# 1. /admin/cards/import で CSV アップロード
# 2. エラーハンドリング確認
```

### 🎨 端末5: 演出・エンタメ
```bash
# 画像生成テスト
npm run generate:images

# 手動テスト
# 1. 動画・アニメーション確認
# 2. プッシュ通知テスト
# 3. 音声・エフェクト確認
# 4. バナー・画像表示確認
```

### 🔍 端末6: QC・インフラ統合
```bash
# 自動テスト全実行
npm run test:all

# QC統合テスト
./scripts/run-qc-tests.sh

# 最終統合確認
# 1. 全端末の結果集約
# 2. 統合シナリオテスト
# 3. 最終Go/No-Go判定
```

## 📊 進捗追跡・管理

### GitHub Projects ボード活用
1. **To Do**: 未実行テスト項目
2. **In Progress**: 実行中テスト  
3. **Review**: 結果確認待ち
4. **Done**: 完了テスト

### 統合ダッシュボード (端末6管理)
```bash
# 全体進捗確認
git log --oneline --since="1 day ago"
gh issue list --label="QC" --state=open
gh issue list --label="priority-critical" --state=open

# 統計情報生成
node scripts/qc-progress-report.js
```

## 🎯 成功基準・完了条件

### 各端末個別基準
- ✅ **担当項目90%以上PASS**
- ✅ **Critical Issue ゼロ**
- ✅ **High Issue 対応完了**
- ✅ **GitHub Issues 完全記録**

### 統合完了基準
- ✅ **全端末テスト完了報告**
- ✅ **Critical/High Issue 100%解決**
- ✅ **統合テストPASS**
- ✅ **端末6による最終承認**

## 🚨 緊急時エスカレーション

### Critical Issue発生時
```bash
# 1. GitHub Issue 即座作成
# 2. タイトルに 🚨 追加
# 3. 全端末に @mention 通知
# 4. 修正担当端末決定
# 5. 修正完了まで他端末は継続
```

### 期限切迫時 (44時間デッドライン)
```bash
# 1. 残り8時間でエスカレーション
# 2. Medium以下の問題は延期判定
# 3. Critical/High のみ対応継続
# 4. Go/No-Go 判定実行
```

---

## 🚀 テスト開始コマンド

```bash
# 各端末でテスト準備完了後
echo "端末X - QCテスト開始準備完了" 

# 端末6による開始合図後
echo "🎯 分散QCテスト開始！目標44時間以内完了"

# GitHub Issues で開始報告
gh issue create --title "[QC] 端末X - 分散テスト開始" --body "担当項目: [項目名]"
```

**🎯 全端末連携で、完璧なQC実行・44時間以内リリース成功を目指しましょう！**