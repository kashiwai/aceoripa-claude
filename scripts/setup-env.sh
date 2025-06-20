#!/bin/bash

# Aceoripa環境構築スクリプト
# 使用方法: ./scripts/setup-env.sh

echo "🚀 Aceoripa 環境構築を開始します..."

# 環境変数ファイルの作成
if [ ! -f .env.local ]; then
    echo "📝 環境変数ファイルを作成中..."
    cp .env.example .env.local
    echo "✅ .env.localを作成しました。必要な値を設定してください。"
else
    echo "⚠️  .env.localは既に存在します。"
fi

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# Supabaseの設定確認
echo "🔍 Supabase設定を確認中..."
if grep -q "your_supabase_project_url" .env.local; then
    echo "⚠️  Supabaseの設定が必要です："
    echo "  1. https://app.supabase.com でプロジェクトを作成"
    echo "  2. Project Settings > API からURLとキーを取得"
    echo "  3. .env.localに設定を追加"
fi

# Square設定確認
echo "🔍 Square Payment設定を確認中..."
if grep -q "your_square_application_id" .env.local; then
    echo "⚠️  Square Paymentの設定が必要です："
    echo "  1. https://developer.squareup.com でアプリケーションを作成"
    echo "  2. Sandboxの認証情報を取得"
    echo "  3. .env.localに設定を追加"
fi

# Git設定
echo "📝 Git設定を確認中..."
if [ ! -f .gitignore ]; then
    echo "node_modules/
.next/
.env.local
.env*.local
.DS_Store
*.log
.vercel
dist/
build/" > .gitignore
    echo "✅ .gitignoreを作成しました。"
fi

echo ""
echo "✨ 環境構築が完了しました！"
echo ""
echo "次のステップ："
echo "1. .env.localに必要な環境変数を設定"
echo "2. npm run dev で開発サーバーを起動"
echo ""
echo "📚 詳細はREADME.mdを参照してください。"