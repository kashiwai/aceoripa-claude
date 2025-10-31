#!/bin/bash

# AI画像マッチング進捗確認スクリプト

LOG_FILE="/tmp/ai-match.log"

echo "📊 AI画像マッチング進捗確認"
echo "=========================================="

# プロセスが実行中か確認
if ps aux | grep -v grep | grep "ai-match-images.mjs" > /dev/null; then
    echo "✅ プロセス実行中"
else
    echo "⚠️  プロセスが見つかりません"
fi

echo ""

# 現在のバッチ番号を確認
current_batch=$(grep -oE "バッチ [0-9]+/35" "$LOG_FILE" | tail -1)
echo "現在のバッチ: $current_batch"

# 統計情報
echo ""
echo "統計情報:"
matched=$(grep -c "⬆️  アップロード完了:" "$LOG_FILE")
candidates=$(grep -c "🎯" "$LOG_FILE")

echo "  マッチング候補: ${candidates}件"
echo "  アップロード: ${matched}件"

# 最新のアップロード（最後の5件）
echo ""
echo "最新のアップロード（最後の5件）:"
grep "⬆️  アップロード完了:" "$LOG_FILE" | tail -5 | while read line; do
    echo "  $line"
done

echo ""
echo "=========================================="
echo "ログファイル: $LOG_FILE"
echo ""
echo "リアルタイム監視:"
echo "  tail -f $LOG_FILE"
