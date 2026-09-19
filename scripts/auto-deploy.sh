#!/bin/bash

# 色付きログ
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 自動デプロイプロセスを開始します${NC}"
echo ""

# 最終確認
echo -e "${YELLOW}⚠️  以下の処理を実行します：${NC}"
echo "  1. TypeScriptの型チェック"
echo "  2. Next.jsビルド"
echo "  3. エラーチェック"
echo "  4. 完了通知"
echo ""
read -p "続行しますか？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}❌ キャンセルされました${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ステップ1: 型チェック
echo -e "${YELLOW}📝 ステップ1: TypeScriptの型チェック中...${NC}"
if npm run type-check 2>&1 | tee /tmp/typecheck.log | tail -20; then
    echo -e "${GREEN}✅ 型チェック完了${NC}"
else
    echo -e "${RED}❌ 型チェックエラー${NC}"
    echo "詳細: /tmp/typecheck.log を確認してください"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ステップ2: ビルド
echo -e "${YELLOW}🔨 ステップ2: Next.jsビルド中...${NC}"
if npm run build 2>&1 | tee /tmp/build.log | tail -30; then
    echo -e "${GREEN}✅ ビルド完了${NC}"
else
    echo -e "${RED}❌ ビルドエラー${NC}"
    echo "詳細: /tmp/build.log を確認してください"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ステップ3: エラーチェック
echo -e "${YELLOW}🔍 ステップ3: エラーログをチェック中...${NC}"
if grep -i "error" /tmp/build.log | grep -v "0 error" > /tmp/errors.log; then
    echo -e "${RED}⚠️  エラーが検出されました:${NC}"
    cat /tmp/errors.log
    echo ""
    read -p "続行しますか？ (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ エラーなし${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 完了
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 すべての処理が完了しました！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 処理結果:"
echo "  - 型チェック: /tmp/typecheck.log"
echo "  - ビルドログ: /tmp/build.log"
echo ""
echo "🚀 次のステップ:"
echo "  - npm run start : ビルド済みアプリを起動"
echo "  - npm run dev   : 開発モードで起動"
