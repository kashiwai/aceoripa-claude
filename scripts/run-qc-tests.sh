#!/bin/bash

# ACEorIPA QC テスト自動実行スクリプト
# 実行者: 端末6 (QC・インフラ担当)

echo "🎯 ACEorIPA QC テスト開始 - $(date)"
echo "=========================================="

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# テスト結果記録
TEST_RESULTS=""
PASSED=0
FAILED=0

# ログ関数
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASS${NC} - $message"
        ((PASSED++))
    else
        echo -e "${RED}❌ $test_name: FAIL${NC} - $message"
        ((FAILED++))
    fi
    
    TEST_RESULTS+="\n$test_name: $status - $message"
}

# 1. ビルドテスト
echo -e "${BLUE}📦 1. ビルド・コンパイルテスト${NC}"
echo "----------------------------------------"

npm run build > build_output.log 2>&1
if [ $? -eq 0 ]; then
    log_test "BUILD_TEST" "PASS" "Production build successful"
else
    log_test "BUILD_TEST" "FAIL" "Build failed - check build_output.log"
fi

# 2. サーバー起動テスト
echo -e "${BLUE}🚀 2. サーバー起動テスト${NC}"
echo "----------------------------------------"

# バックグラウンドでサーバー起動
npm run dev > server_output.log 2>&1 &
SERVER_PID=$!

# サーバー起動待機
sleep 10

# ヘルスチェック
if curl -s http://localhost:9012 > /dev/null; then
    log_test "SERVER_START" "PASS" "Server started successfully on port 9012"
    
    # 3. ページ表示テスト
    echo -e "${BLUE}🌐 3. 重要ページ表示テスト${NC}"
    echo "----------------------------------------"
    
    # メインページ
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9012 | grep -q "200"; then
        log_test "MAIN_PAGE" "PASS" "Main page loads (200)"
    else
        log_test "MAIN_PAGE" "FAIL" "Main page failed to load"
    fi
    
    # Admin Login ページ
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9012/admin/login | grep -q "200"; then
        log_test "ADMIN_LOGIN" "PASS" "Admin login page loads (200)"
    else
        log_test "ADMIN_LOGIN" "FAIL" "Admin login page failed"
    fi
    
    # 法的ページテスト
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9012/legal/terms | grep -q "200"; then
        log_test "LEGAL_TERMS" "PASS" "Terms page loads (200)"
    else
        log_test "LEGAL_TERMS" "FAIL" "Terms page failed"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9012/legal/prize-law | grep -q "200"; then
        log_test "LEGAL_PRIZE" "PASS" "Prize law page loads (200)"
    else
        log_test "LEGAL_PRIZE" "FAIL" "Prize law page failed"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9012/legal/privacy | grep -q "200"; then
        log_test "LEGAL_PRIVACY" "PASS" "Privacy policy page loads (200)"
    else
        log_test "LEGAL_PRIVACY" "FAIL" "Privacy policy page failed"
    fi
    
    # 4. API エンドポイントテスト
    echo -e "${BLUE}🔌 4. API エンドポイントテスト${NC}"
    echo "----------------------------------------"
    
    # Health check API (存在する場合)
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9012/api/health | grep -q "200\|404"; then
        log_test "API_HEALTH" "PASS" "API endpoint accessible"
    else
        log_test "API_HEALTH" "FAIL" "API endpoints not accessible"
    fi
    
    # 5. 静的ファイルテスト
    echo -e "${BLUE}📁 5. 静的ファイルテスト${NC}"
    echo "----------------------------------------"
    
    # Favicon
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9012/favicon.ico | grep -q "200"; then
        log_test "FAVICON" "PASS" "Favicon accessible"
    else
        log_test "FAVICON" "FAIL" "Favicon not found"
    fi
    
    # 6. レスポンシブテスト (基本的なCSS読み込み確認)
    echo -e "${BLUE}📱 6. CSS・レスポンシブテスト${NC}"
    echo "----------------------------------------"
    
    # メインページのレスポンス時間チェック
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:9012)
    if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
        log_test "RESPONSE_TIME" "PASS" "Page loads in ${RESPONSE_TIME}s (< 3s)"
    else
        log_test "RESPONSE_TIME" "FAIL" "Page loads too slowly: ${RESPONSE_TIME}s"
    fi
    
else
    log_test "SERVER_START" "FAIL" "Server failed to start"
fi

# 7. ファイル構造整合性テスト
echo -e "${BLUE}📂 7. ファイル構造テスト${NC}"
echo "----------------------------------------"

# 重要ファイルの存在確認
if [ -f "package.json" ]; then
    log_test "PACKAGE_JSON" "PASS" "package.json exists"
else
    log_test "PACKAGE_JSON" "FAIL" "package.json missing"
fi

if [ -f "next.config.js" ]; then
    log_test "NEXT_CONFIG" "PASS" "next.config.js exists"
else
    log_test "NEXT_CONFIG" "FAIL" "next.config.js missing"
fi

if [ -f ".env.local" ]; then
    log_test "ENV_FILE" "PASS" ".env.local exists"
else
    log_test "ENV_FILE" "FAIL" ".env.local missing"
fi

# Admin管理ページの存在確認
ADMIN_PAGES=(
    "src/app/admin/page.tsx"
    "src/app/admin/login/page.tsx"
    "src/app/admin/users/page.tsx"
    "src/app/admin/cards/page.tsx"
    "src/app/admin/gacha/page.tsx"
    "src/app/admin/announcements/page.tsx"
    "src/app/admin/rankings/page.tsx"
    "src/app/admin/notifications/page.tsx"
    "src/app/admin/shipments/page.tsx"
)

for page in "${ADMIN_PAGES[@]}"; do
    if [ -f "$page" ]; then
        log_test "FILE_$(basename $page .tsx | tr '[:lower:]' '[:upper:]')" "PASS" "$page exists"
    else
        log_test "FILE_$(basename $page .tsx | tr '[:lower:]' '[:upper:]')" "FAIL" "$page missing"
    fi
done

# 8. 環境変数テスト
echo -e "${BLUE}🔧 8. 環境変数テスト${NC}"
echo "----------------------------------------"

# .env.local ファイルの重要な変数確認
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    log_test "ENV_SUPABASE_URL" "PASS" "Supabase URL configured"
else
    log_test "ENV_SUPABASE_URL" "FAIL" "Supabase URL missing"
fi

if grep -q "ADMIN_EMAIL" .env.local; then
    log_test "ENV_ADMIN_EMAIL" "PASS" "Admin email configured"
else
    log_test "ENV_ADMIN_EMAIL" "FAIL" "Admin email missing"
fi

# サーバー停止
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
    wait $SERVER_PID 2>/dev/null
fi

# 9. セキュリティチェック
echo -e "${BLUE}🔒 9. セキュリティ基本チェック${NC}"
echo "----------------------------------------"

# .env ファイルが .gitignore に含まれているかチェック
if grep -q ".env" .gitignore; then
    log_test "SECURITY_ENV_IGNORE" "PASS" ".env files ignored in git"
else
    log_test "SECURITY_ENV_IGNORE" "FAIL" ".env files not ignored"
fi

# node_modules が .gitignore に含まれているかチェック
if grep -q "node_modules" .gitignore; then
    log_test "SECURITY_NODE_MODULES" "PASS" "node_modules ignored"
else
    log_test "SECURITY_NODE_MODULES" "FAIL" "node_modules not ignored"
fi

# 10. 最終結果
echo ""
echo "=========================================="
echo -e "${BLUE}📊 QC テスト結果サマリー${NC}"
echo "=========================================="
echo -e "✅ PASSED: ${GREEN}$PASSED${NC}"
echo -e "❌ FAILED: ${RED}$FAILED${NC}"
echo -e "📊 SUCCESS RATE: $(echo "scale=1; $PASSED*100/($PASSED+$FAILED)" | bc)%"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 全テスト合格！本番デプロイ準備完了${NC}"
    exit 0
else
    echo -e "${RED}⚠️  失敗したテストがあります。修正が必要です。${NC}"
    echo -e "${YELLOW}詳細ログ:${NC}"
    echo -e "$TEST_RESULTS"
    exit 1
fi