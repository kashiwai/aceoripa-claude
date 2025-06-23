#!/bin/bash

# サーバー起動スクリプト
echo "🚀 サーバーを起動します..."

# 古いプロセスを停止
echo "古いプロセスを停止中..."
pkill -f "next dev" 2>/dev/null || true

# キャッシュをクリア
echo "キャッシュをクリア中..."
rm -rf .next

# ポート5555で起動
echo "ポート5555でサーバーを起動中..."
PORT=5555 npm run dev &

# プロセスIDを保存
echo $! > server.pid

echo "✅ サーバーが起動しました！"
echo "📍 アクセスURL: http://localhost:5555"
echo ""
echo "🔗 主要なページ:"
echo "  - TOP: http://localhost:5555"
echo "  - ガチャ: http://localhost:5555/gacha/1"
echo "  - マイページ: http://localhost:5555/mypage"
echo "  - Admin: http://localhost:5555/admin"
echo ""
echo "停止するには: kill $(cat server.pid)"