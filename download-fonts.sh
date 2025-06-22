#!/bin/bash
# 推奨フリーフォントダウンロードスクリプト

echo "🎨 推奨フリーフォントをダウンロードします..."

# フォントディレクトリ作成
mkdir -p public/fonts

# 源ノ角ゴシック（Source Han Sans）
echo "📥 源ノ角ゴシック Heavy をダウンロード中..."
curl -L "https://github.com/adobe-fonts/source-han-sans/raw/release/OTF/Japanese/SourceHanSans-Heavy.otf" -o "public/fonts/SourceHanSans-Heavy.otf"

# M+ FONTS
echo "📥 M+ 1p Black をダウンロード中..."
curl -L "https://github.com/coz-m/MPLUS_FONTS/raw/master/fonts/ttf/Mplus1p-Black.ttf" -o "public/fonts/Mplus1p-Black.ttf"

# 自家製 Rounded M+
echo "📥 Rounded M+ 1c Black をダウンロード中..."
curl -L "http://jikasei.me/font/rounded-mplus/rounded-mplus-1c-black.ttf" -o "public/fonts/RoundedMplus1c-Black.ttf"

echo "✅ ダウンロード完了！"
echo "💡 node setup-fonts.js を実行してフォントを登録してください"
