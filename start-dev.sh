#!/bin/bash

# エースオリパ開発サーバー起動スクリプト
echo "🎮 Aceoripa 開発サーバーを起動します..."

# 依存関係チェック
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules が見つかりません。npm install を実行します..."
    npm install
fi

# 環境変数チェック
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local が見つかりません。.env.example をコピーしてください"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ .env.example を .env.local にコピーしました"
    fi
fi

# 開発サーバー起動
echo "🚀 開発サーバーを http://localhost:3001 で起動します..."
PORT=3001 npm run dev