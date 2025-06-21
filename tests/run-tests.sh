#!/bin/bash

# Aceoripa ポケモンガチャサイト 総合テストスクリプト
# 使用方法: ./tests/run-tests.sh

echo "🚀 Aceoripa ポケモンガチャサイト 総合テスト開始"
echo "=================================================="

# カラー設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 実行ログ
LOG_FILE="tests/test-results-$(date +%Y%m%d_%H%M%S).log"

# ログ関数
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# エラーハンドリング
handle_error() {
    log "${RED}❌ エラーが発生しました: $1${NC}"
    exit 1
}

# サーバー起動チェック
check_server() {
    log "${BLUE}🔍 サーバー起動チェック...${NC}"
    
    if curl -s http://localhost:3000 > /dev/null; then
        log "${GREEN}✅ サーバーが起動しています (http://localhost:3000)${NC}"
        return 0
    else
        log "${YELLOW}⚠️  サーバーが起動していません。自動起動を試行します...${NC}"
        
        # Next.js開発サーバー起動
        npm run dev &
        SERVER_PID=$!
        
        # 30秒間待機
        for i in {1..30}; do
            if curl -s http://localhost:3000 > /dev/null; then
                log "${GREEN}✅ サーバーが起動しました${NC}"
                return 0
            fi
            sleep 1
        done
        
        handle_error "サーバーの起動に失敗しました"
    fi
}

# Node.js依存関係チェック
check_dependencies() {
    log "${BLUE}📦 依存関係チェック...${NC}"
    
    if [ ! -d "node_modules" ]; then
        log "${YELLOW}⚠️  node_modules が見つかりません。npm install を実行します...${NC}"
        npm install || handle_error "npm install に失敗しました"
    fi
    
    log "${GREEN}✅ 依存関係チェック完了${NC}"
}

# 1. APIテスト実行
run_api_tests() {
    log "\n${PURPLE}🧪 1. APIテスト実行${NC}"
    log "================================"
    
    if [ -f "tests/api.test.js" ]; then
        node tests/api.test.js || handle_error "APIテストに失敗しました"
    else
        log "${YELLOW}⚠️  APIテストファイルが見つかりません${NC}"
    fi
}

# 2. フロントエンドテスト準備
prepare_frontend_tests() {
    log "\n${PURPLE}🎨 2. フロントエンドテスト準備${NC}"
    log "====================================="
    
    if [ -f "tests/frontend.test.html" ]; then
        log "${GREEN}✅ フロントエンドテストページが準備されています${NC}"
        log "${CYAN}📝 以下のURLでブラウザテストを実行してください:${NC}"
        log "   file://$(pwd)/tests/frontend.test.html"
        log ""
        log "${CYAN}🔗 または、以下のコマンドでブラウザを自動起動:${NC}"
        log "   open tests/frontend.test.html  # macOS"
        log "   xdg-open tests/frontend.test.html  # Linux"
        log "   start tests/frontend.test.html  # Windows"
    else
        log "${YELLOW}⚠️  フロントエンドテストファイルが見つかりません${NC}"
    fi
}

# 3. データベースチェック
check_database() {
    log "\n${PURPLE}💾 3. データベース接続チェック${NC}"
    log "======================================"
    
    # 環境変数チェック
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        log "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL が設定されていません${NC}"
    else
        log "${GREEN}✅ Supabase URL設定確認${NC}"
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
        log "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されていません${NC}"
    else
        log "${GREEN}✅ Supabase APIキー設定確認${NC}"
    fi
}

# 4. 画像生成システムチェック
check_image_generation() {
    log "\n${PURPLE}🎨 4. 画像生成システムチェック${NC}"
    log "======================================"
    
    # プレースホルダー画像API
    if curl -s http://localhost:3000/api/placeholder/400/400 > /dev/null; then
        log "${GREEN}✅ プレースホルダー画像API動作確認${NC}"
    else
        log "${RED}❌ プレースホルダー画像APIが応答しません${NC}"
    fi
    
    # 画像生成ディレクトリ
    if [ -d "public/images" ]; then
        log "${GREEN}✅ 画像ディレクトリ存在確認${NC}"
        log "   📁 保存されている画像数: $(ls -1 public/images/*.{jpg,jpeg,png,gif,webp} 2>/dev/null | wc -l)"
    else
        log "${YELLOW}⚠️  public/images ディレクトリが見つかりません${NC}"
        mkdir -p public/images
        log "${GREEN}✅ public/images ディレクトリを作成しました${NC}"
    fi
}

# 5. セキュリティチェック
security_check() {
    log "\n${PURPLE}🔒 5. セキュリティチェック${NC}"
    log "=============================="
    
    # .env ファイルの確認
    if [ -f ".env.local" ]; then
        log "${GREEN}✅ 環境変数ファイル存在確認${NC}"
        
        # 危険な設定の確認
        if grep -q "password.*=.*123" .env.local 2>/dev/null; then
            log "${RED}❌ 危険: 弱いパスワードが検出されました${NC}"
        fi
        
        if grep -q "secret.*=.*test" .env.local 2>/dev/null; then
            log "${RED}❌ 危険: テスト用シークレットが本番で使用されています${NC}"
        fi
    else
        log "${YELLOW}⚠️  .env.local ファイルが見つかりません${NC}"
    fi
    
    # gitignore チェック
    if grep -q ".env" .gitignore 2>/dev/null; then
        log "${GREEN}✅ .env ファイルが適切に除外されています${NC}"
    else
        log "${RED}❌ 危険: .env ファイルがgitignoreに含まれていません${NC}"
    fi
}

# 6. パフォーマンステスト
performance_test() {
    log "\n${PURPLE}⚡ 6. パフォーマンステスト${NC}"
    log "================================"
    
    # Lighthouseがインストールされているかチェック
    if command -v lighthouse &> /dev/null; then
        log "${CYAN}📊 Lighthouse監査を実行中...${NC}"
        lighthouse http://localhost:3000 \
            --output=html \
            --output-path=tests/lighthouse-report.html \
            --chrome-flags="--headless" \
            --quiet 2>&1 | tee -a "$LOG_FILE"
        
        log "${GREEN}✅ Lighthouse レポートが生成されました: tests/lighthouse-report.html${NC}"
    else
        log "${YELLOW}⚠️  Lighthouse がインストールされていません${NC}"
        log "   インストール: npm install -g lighthouse"
    fi
    
    # 基本的な応答時間テスト
    log "${CYAN}⏱️  応答時間測定...${NC}"
    
    start_time=$(date +%s%N)
    curl -s http://localhost:3000 > /dev/null
    end_time=$(date +%s%N)
    
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $response_time -lt 1000 ]; then
        log "${GREEN}✅ 応答時間: ${response_time}ms (良好)${NC}"
    elif [ $response_time -lt 3000 ]; then
        log "${YELLOW}⚠️  応答時間: ${response_time}ms (やや遅い)${NC}"
    else
        log "${RED}❌ 応答時間: ${response_time}ms (遅い)${NC}"
    fi
}

# 7. テスト結果サマリー
generate_summary() {
    log "\n${PURPLE}📊 7. テスト結果サマリー${NC}"
    log "============================"
    
    # テストファイルの存在確認
    test_files=("tests/api.test.js" "tests/frontend.test.html" "docs/TEST_CASES.md")
    
    log "${CYAN}📋 テストファイル確認:${NC}"
    for file in "${test_files[@]}"; do
        if [ -f "$file" ]; then
            log "   ✅ $file"
        else
            log "   ❌ $file (見つかりません)"
        fi
    done
    
    # ログファイル情報
    log "\n${CYAN}📁 生成されたファイル:${NC}"
    log "   📊 テストログ: $LOG_FILE"
    
    if [ -f "tests/lighthouse-report.html" ]; then
        log "   🔍 Lighthouseレポート: tests/lighthouse-report.html"
    fi
    
    log "   📖 フロントエンドテスト: tests/frontend.test.html"
    
    # 推奨次ステップ
    log "\n${CYAN}🚀 推奨次ステップ:${NC}"
    log "   1. ブラウザでフロントエンドテストを実行"
    log "   2. 管理画面 (http://localhost:3000/admin) でログインテスト"
    log "   3. ガチャ機能の手動テスト"
    log "   4. プッシュ通知のテスト"
    log "   5. モバイルデバイスでの動作確認"
}

# メイン実行
main() {
    # ディレクトリチェック
    if [ ! -f "package.json" ]; then
        handle_error "Next.jsプロジェクトのルートディレクトリで実行してください"
    fi
    
    # ログファイル初期化
    echo "Aceoripa ポケモンガチャサイト テスト実行ログ" > "$LOG_FILE"
    echo "実行日時: $(date)" >> "$LOG_FILE"
    echo "=================================" >> "$LOG_FILE"
    
    # テスト実行
    check_dependencies
    check_server
    run_api_tests
    prepare_frontend_tests
    check_database
    check_image_generation
    security_check
    performance_test
    generate_summary
    
    log "\n${GREEN}🎉 総合テスト完了！${NC}"
    log "${CYAN}📝 詳細ログ: $LOG_FILE${NC}"
}

# スクリプト実行
main "$@"