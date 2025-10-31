# 🚀 自動デプロイシステム

確認1回で完了まで自動実行するhooks機能を実装しました。

## 📋 利用可能なコマンド

### 1. フル自動デプロイ（推奨）
```bash
npm run auto-deploy
```

または

```bash
./scripts/auto-deploy.sh
```

**実行内容:**
- ✅ TypeScript型チェック
- ✅ Next.jsビルド
- ✅ エラー検出
- ✅ 完了通知

**確認:** 最初に1回だけY/Nで確認します。その後は自動で完了まで実行されます。


### 2. クイックチェック
```bash
npm run quick-check
```

型チェックのみ実行（速い！）

### 3. フルチェック
```bash
npm run full-check
```

型チェック + ビルド実行

### 4. 型チェックのみ
```bash
npm run type-check
```

TypeScriptの型エラーのみチェック

## 🎯 使用例

### 開発完了時
```bash
# 1. 自動デプロイを実行
npm run auto-deploy

# 2. 確認プロンプトでYを入力
y

# 3. 自動で型チェック→ビルド→完了まで実行！
```

### Git commit前の簡単チェック
```bash
npm run quick-check
```

### 本番デプロイ前の完全チェック
```bash
npm run full-check
```

## 📊 ログファイル

エラーが発生した場合、以下のログファイルを確認：

- `/tmp/typecheck.log` - 型チェックログ
- `/tmp/build.log` - ビルドログ
- `/tmp/errors.log` - エラー一覧

## 🔧 Git Hooks（自動実行）

`.husky/pre-commit` が設定されています：
- Git commitする前に自動で型チェックが実行されます
- エラーがあればcommitが中断されます

## ⚡ ショートカット

エイリアスを設定すると更に便利：

```bash
# ~/.zshrc または ~/.bashrc に追加
alias deploy="npm run auto-deploy"
alias check="npm run quick-check"
```

使用例:
```bash
deploy  # フル自動デプロイ
check   # クイックチェック
```

## 🎉 完了後

ビルドが成功したら：

```bash
# 本番モードで起動
npm run start

# または開発モードで起動
npm run dev
```
