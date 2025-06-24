#!/bin/bash

# Vercel環境変数設定スクリプト
# 使用方法: ./scripts/setup-vercel-env.sh

echo "🚀 Vercel本番環境 環境変数設定スクリプト"
echo "============================================="

# Vercel CLIがインストールされているかチェック
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLIがインストールされていません"
    echo "📦 インストールコマンド: npm i -g vercel"
    exit 1
fi

# .env.localファイルが存在するかチェック
if [ ! -f ".env.local" ]; then
    echo "❌ .env.localファイルが見つかりません"
    exit 1
fi

echo "📋 環境変数を読み込み中..."

# .env.localから環境変数を読み込み、Vercelに設定
while IFS='=' read -r key value; do
    # コメント行と空行をスキップ
    if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
        continue
    fi
    
    # キーと値をトリム
    key=$(echo $key | xargs)
    value=$(echo $value | xargs)
    
    # 空のキーまたは値をスキップ
    if [[ -z $key ]] || [[ -z $value ]]; then
        continue
    fi
    
    echo "⚙️  設定中: $key"
    
    # Vercelに環境変数を設定（本番環境のみ）
    vercel env add $key production --force << EOF
$value
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ $key: 設定完了"
    else
        echo "❌ $key: 設定失敗"
    fi
    
done < .env.local

echo ""
echo "🎉 環境変数設定完了！"
echo ""
echo "📝 次のステップ:"
echo "1. Vercelダッシュボードで設定を確認"
echo "2. https://vercel.com/your-project/settings/environment-variables"
echo "3. 設定後、再デプロイを実行"
echo ""
echo "🔄 再デプロイコマンド:"
echo "vercel --prod"