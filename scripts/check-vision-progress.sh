#!/bin/bash

# Vision API アップロード進捗確認スクリプト

LOG_FILE="/tmp/vision-upload-all.log"

echo "📊 Vision API アップロード進捗確認"
echo "=========================================="

# プロセスが実行中か確認
if ps aux | grep -v grep | grep "upload-unmapped-images.mjs --all" > /dev/null; then
    echo "✅ プロセス実行中"
else
    echo "⚠️  プロセスが見つかりません"
fi

echo ""

# 現在のバッチ番号を確認
current_batch=$(grep -oE "バッチ [0-9]+/2327" "$LOG_FILE" | tail -1)
echo "現在のバッチ: $current_batch"

# 統計情報
echo ""
echo "統計情報:"
vision_success=$(grep -c "🔍.*→" "$LOG_FILE")
matches=$(grep -c "✅ マッチ:" "$LOG_FILE")
uploads=$(grep -c "⬆️  アップロード完了:" "$LOG_FILE")

echo "  Vision API解析: ${vision_success}件"
echo "  マッチング成功: ${matches}件"
echo "  アップロード: ${uploads}件"

# マッチング率
if [ $vision_success -gt 0 ]; then
    match_rate=$(echo "scale=1; $matches * 100 / $vision_success" | bc)
    echo "  マッチング率: ${match_rate}%"
fi

echo ""

# 最新のアップロード（最後の5件）
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
