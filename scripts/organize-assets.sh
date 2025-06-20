#!/bin/bash

# AI生成素材整理スクリプト
echo "🎨 AI生成素材整理スクリプト"
echo "================================"

# ディレクトリ作成
echo "📁 ディレクトリ構造を作成中..."
mkdir -p public/assets/effects/ssr/{aura,explosion,particles,beams}
mkdir -p public/assets/effects/sr/{fire,explosion,particles}
mkdir -p public/assets/effects/r/{water,ice,particles}
mkdir -p public/assets/effects/n/{glow,sparkle}
mkdir -p public/assets/backgrounds/{temple,cosmic,lava,ice,forest}
mkdir -p public/assets/objects/{chests,crystals,orbs,circles}
mkdir -p public/assets/ui/{frames,badges,stars,buttons}
mkdir -p public/assets/particles/{golden,blue,purple,white,rainbow}

# 素材命名規則
echo "📝 素材命名規則:"
echo "- SSR: ssr-[type]-[number].png (例: ssr-aura-01.png)"
echo "- SR:  sr-[type]-[number].png"
echo "- R:   r-[type]-[number].png"
echo "- N:   n-[type]-[number].png"
echo "- BG:  bg-[theme]-[number].png"
echo "- OBJ: obj-[type]-[number].png"
echo "- UI:  ui-[element]-[number].png"

# ダウンロードフォルダから移動する関数
move_assets() {
    local source_dir="$HOME/Downloads"
    local file_pattern="$1"
    local target_dir="$2"
    
    echo "🔄 $file_pattern を $target_dir に移動中..."
    
    # ファイルが存在する場合のみ移動
    if ls $source_dir/$file_pattern 1> /dev/null 2>&1; then
        mv $source_dir/$file_pattern $target_dir/
        echo "✅ 移動完了: $(ls $target_dir/$file_pattern | wc -l) ファイル"
    else
        echo "⚠️  該当ファイルなし: $file_pattern"
    fi
}

# 使用例を表示
echo ""
echo "🚀 使用方法:"
echo "1. AI生成した画像をダウンロードフォルダに保存"
echo "2. 以下のコマンドを実行:"
echo ""
echo "# SSRエフェクトを整理"
echo "bash scripts/organize-assets.sh ssr-aura"
echo ""
echo "# 背景画像を整理"
echo "bash scripts/organize-assets.sh bg-temple"
echo ""

# コマンドライン引数がある場合は実行
if [ $# -gt 0 ]; then
    case $1 in
        "ssr-aura")
            move_assets "ssr-aura-*.png" "public/assets/effects/ssr/aura"
            ;;
        "ssr-explosion")
            move_assets "ssr-explosion-*.png" "public/assets/effects/ssr/explosion"
            ;;
        "sr-fire")
            move_assets "sr-fire-*.png" "public/assets/effects/sr/fire"
            ;;
        "bg-temple")
            move_assets "bg-temple-*.png" "public/assets/backgrounds/temple"
            ;;
        "bg-cosmic")
            move_assets "bg-cosmic-*.png" "public/assets/backgrounds/cosmic"
            ;;
        *)
            echo "❌ 不明なアセットタイプ: $1"
            ;;
    esac
fi

# 現在の素材数をカウント
echo ""
echo "📊 現在の素材数:"
echo "- SSRエフェクト: $(find public/assets/effects/ssr -name "*.png" | wc -l)"
echo "- SRエフェクト: $(find public/assets/effects/sr -name "*.png" | wc -l)"
echo "- Rエフェクト: $(find public/assets/effects/r -name "*.png" | wc -l)"
echo "- Nエフェクト: $(find public/assets/effects/n -name "*.png" | wc -l)"
echo "- 背景: $(find public/assets/backgrounds -name "*.png" | wc -l)"
echo "- オブジェクト: $(find public/assets/objects -name "*.png" | wc -l)"
echo "- UI: $(find public/assets/ui -name "*.png" | wc -l)"
echo "- 合計: $(find public/assets -name "*.png" | wc -l)"

# 画像最適化の提案
echo ""
echo "💡 画像最適化のヒント:"
echo "1. TinyPNG (https://tinypng.com) でファイルサイズを削減"
echo "2. ImageOptim (Mac) で自動最適化"
echo "3. 必要に応じてWebP形式に変換"