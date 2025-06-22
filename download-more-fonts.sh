#!/bin/bash
# 大量の日本語フォントダウンロードスクリプト

echo "🎨 大量の日本語フォントをダウンロードします..."

# フォントディレクトリ作成
mkdir -p public/fonts

# Google Fonts - 日本語フォント
echo "📥 Google Fonts 日本語フォント群をダウンロード中..."

# Noto Sans JP (複数ウェイト)
curl -L "https://fonts.gstatic.com/s/notosansjp/v53/a010_ohUkiEjjvBGvp5-8J96RVGH8Y6MWi7g.woff2" -o "public/fonts/NotoSansJP-Bold.woff2"
curl -L "https://fonts.gstatic.com/s/notosansjp/v53/a010_ohUkiEjjvBGvp5f9J96RVGH8Y6MWi7g.woff2" -o "public/fonts/NotoSansJP-Black.woff2"

# M PLUS 1p
curl -L "https://fonts.gstatic.com/s/mplus1p/v27/e3tleuShHdiFyPFzBRrQnDQAUW3aq-5N.woff2" -o "public/fonts/MPlus1p-Bold.woff2"
curl -L "https://fonts.gstatic.com/s/mplus1p/v27/e3tleuShHdiFyPFzBRrQnDQoU23aq-5N.woff2" -o "public/fonts/MPlus1p-Black.woff2"

# Sawarabi Gothic
curl -L "https://fonts.gstatic.com/s/sawarabigothic/v12/x3d4ckfVaqqa-BEj-I9mE65u3k3NBSk3E2YljQ.woff2" -o "public/fonts/SawarabiGothic-Regular.woff2"

# Kosugi Maru (丸ゴシック)
curl -L "https://fonts.gstatic.com/s/kosugimaru/v14/0nksC9PgP_wGh21A2KeqGiTqivr9iBq_.woff2" -o "public/fonts/KosugiMaru-Regular.woff2"

# Kosugi (角ゴシック)
curl -L "https://fonts.gstatic.com/s/kosugi/v15/pxiFyp4_v8FCjlI4NLr6f1pdEQ.woff2" -o "public/fonts/Kosugi-Regular.woff2"

# Hina Mincho (明朝体)
curl -L "https://fonts.gstatic.com/s/hinamincho/v11/2V0aKIcMGZEnV6xygz7eNjEaRzUbZrM.woff2" -o "public/fonts/HinaMincho-Regular.woff2"

# Zen Kaku Gothic New
curl -L "https://fonts.gstatic.com/s/zenkakugothicnew/v16/gNMVW2x8Qoy5_mf8uUkJGHF2SWen3eO-N94rqA.woff2" -o "public/fonts/ZenKakuGothicNew-Bold.woff2"
curl -L "https://fonts.gstatic.com/s/zenkakugothicnew/v16/gNMWW2x8Qoy5_mf8uUkJGHF2SWeN_U66IcoZhg.woff2" -o "public/fonts/ZenKakuGothicNew-Black.woff2"

# Zen Maru Gothic
curl -L "https://fonts.gstatic.com/s/zenmarugothic/v15/o-0SIpIpyGQQxU_AHpHbXRGJGPV2lNp5J5V3fg.woff2" -o "public/fonts/ZenMaruGothic-Bold.woff2"
curl -L "https://fonts.gstatic.com/s/zenmarugothic/v15/o-0SIpIpyGQQxU_AHpHbXRGBHvV2lNp5J5V3fg.woff2" -o "public/fonts/ZenMaruGothic-Black.woff2"

# DotGothic16 (ドット風)
curl -L "https://fonts.gstatic.com/s/dotgothic16/v13/v6-QGYjBJFKgyw5nSoDAGJT_VmItkLnHGw.woff2" -o "public/fonts/DotGothic16-Regular.woff2"

# Train One (レトロ風)
curl -L "https://fonts.gstatic.com/s/trainone/v12/gyB4hws1JdgnKy56GB9PVG5vxN0TI6U.woff2" -o "public/fonts/TrainOne-Regular.woff2"

# Yusei Magic (手書き風)
curl -L "https://fonts.gstatic.com/s/yuseimagic/v12/yoJAMaQ5iQOkv4wYYdkX7xfFoGnI-kSC.woff2" -o "public/fonts/YuseiMagic-Regular.woff2"

# Stick (縦長)
curl -L "https://fonts.gstatic.com/s/stick/v14/Qw3KZQdHHnQhE7SIdZ-p5Q.woff2" -o "public/fonts/Stick-Regular.woff2"

# Reggae One (POP)
curl -L "https://fonts.gstatic.com/s/reggaeone/v13/KEaB6ukFkrGlrJMag6Km-Qos5R2nCA.woff2" -o "public/fonts/ReggaeOne-Regular.woff2"

# Rampart One (極太デコラティブ)
curl -L "https://fonts.gstatic.com/s/rampartone/v8/K2F2fZ9ZkcNNsOQGWgkH9_c4-QOjL7I.woff2" -o "public/fonts/RampartOne-Regular.woff2"

# Mochiy Pop P One (丸POP)
curl -L "https://fonts.gstatic.com/s/mochiypoppone/v6/Pxl0-Qr7dHYL8Pk5gdKqhMy3AhJ-dKwuV0A.woff2" -o "public/fonts/MochiyPopPOne-Regular.woff2"

# Kiwi Maru (可愛い丸文字)
curl -L "https://fonts.gstatic.com/s/kiwimaru/v14/R70YjykAX9Y5aLGBNSjwMNpg.woff2" -o "public/fonts/KiwiMaru-Regular.woff2"

# Darumadrop One (だるま文字)
curl -L "https://fonts.gstatic.com/s/darumadropone/v12/cY9cfhPnS-iUDhxOUEJ9Mhwq8JNRVdOPFQ.woff2" -o "public/fonts/DarumadropOne-Regular.woff2"

# BIZ UDGothic (ビジネス用)
curl -L "https://fonts.gstatic.com/s/bizudgothic/v6/daAlKkKVVgVP2Qvfn4hXGUC-t-mTqFe3Uw.woff2" -o "public/fonts/BIZUDGothic-Bold.woff2"

# Murecho (モダンゴシック)
curl -L "https://fonts.gstatic.com/s/murecho/v10/4iCp6Kp6Y9y-Nq6iQ5JYhfSz-g_hqKE4j10.woff2" -o "public/fonts/Murecho-Bold.woff2"
curl -L "https://fonts.gstatic.com/s/murecho/v10/4iCp6Kp6Y9y-Nq6iQ5JYhfSz-nHhqKE4j10.woff2" -o "public/fonts/Murecho-Black.woff2"

# RocknRoll One (ロック風)
curl -L "https://fonts.gstatic.com/s/rocknrollone/v13/fVFGGMSdX2sZZ9y8ZqRODk1LbGUz4e8.woff2" -o "public/fonts/RocknRollOne-Regular.woff2"

echo "✅ Google Fonts ダウンロード完了！"

# フリーフォント
echo "📥 その他のフリーフォントをダウンロード中..."

# 源真ゴシック（Source Han Sans派生）
curl -L "https://github.com/adobe-fonts/source-han-sans/releases/download/2.004R/SourceHanSansJP.zip" -o "temp_source_han.zip"
unzip -q temp_source_han.zip "*/SourceHanSansJP-Bold.otf" -d temp_fonts/ 2>/dev/null || true
find temp_fonts -name "SourceHanSansJP-Bold.otf" -exec cp {} "public/fonts/" \; 2>/dev/null || true
rm -rf temp_fonts temp_source_han.zip

# JetBrains Mono (プログラミング用、英数字)
curl -L "https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip" -o "temp_jetbrains.zip"
unzip -q temp_jetbrains.zip "*/JetBrainsMono-Bold.ttf" -d temp_fonts/ 2>/dev/null || true
find temp_fonts -name "JetBrainsMono-Bold.ttf" -exec cp {} "public/fonts/" \; 2>/dev/null || true
rm -rf temp_fonts temp_jetbrains.zip

echo "✅ 全フォントダウンロード完了！"
echo "📝 ダウンロードしたフォント数: $(ls public/fonts/ | wc -l)"
echo "💡 node setup-fonts.js を実行してフォントを登録してください"

# フォント一覧表示
echo ""
echo "📋 ダウンロードしたフォント一覧:"
ls -la public/fonts/