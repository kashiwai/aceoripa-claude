// QC全ページチェックスクリプト
const fs = require('fs');
const path = require('path');

class QCChecker {
  constructor() {
    this.routes = [
      { path: '/', name: 'ホームページ', auth: false },
      { path: '/gacha', name: 'ガチャページ', auth: true },
      { path: '/payment', name: '決済ページ', auth: true },
      { path: '/mypage', name: 'マイページ', auth: true },
      { path: '/auth/login', name: 'ログインページ', auth: false },
      { path: '/auth/signup', name: '新規登録ページ', auth: false },
      { path: '/auth/reset-password', name: 'パスワードリセット', auth: false },
      { path: '/admin', name: '管理者ダッシュボード', auth: 'admin' },
      { path: '/admin/login', name: '管理者ログイン', auth: false },
      { path: '/admin/gacha', name: 'ガチャ管理', auth: 'admin' },
      { path: '/admin/gacha/new', name: '新規ガチャ作成', auth: 'admin' },
      { path: '/admin/users', name: 'ユーザー管理', auth: 'admin' },
      { path: '/demo/gacha-effects', name: 'ガチャエフェクトデモ', auth: false }
    ];
    
    this.errors = [];
    this.warnings = [];
    this.fixed = [];
  }

  async checkAllPages() {
    console.log('🔍 Aceoripa 全ページQCチェック開始...\n');
    
    for (const route of this.routes) {
      await this.checkPage(route);
    }
    
    this.printReport();
  }

  async checkPage(route) {
    console.log(`📄 ${route.name} (${route.path}) をチェック中...`);
    
    // ページファイルのパスを構築
    const pagePath = route.path === '/' 
      ? 'src/app/page.tsx'
      : `src/app${route.path}/page.tsx`;
    
    const fullPath = path.join(process.cwd(), pagePath);
    
    // ファイルの存在確認
    if (!fs.existsSync(fullPath)) {
      this.errors.push({
        route: route.path,
        type: 'FILE_NOT_FOUND',
        message: `ページファイルが見つかりません: ${pagePath}`
      });
      return;
    }
    
    // ファイル内容を読み込み
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // 基本的なチェック
    this.checkImports(route, content);
    this.checkExports(route, content);
    this.checkAuthRequirements(route, content);
    this.checkAPIRoutes(route, content);
    this.checkComponents(route, content);
  }

  checkImports(route, content) {
    // 一般的なインポートエラーのチェック
    const importRegex = /import\s+(?:{[^}]+}|[^;]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // 存在しない可能性のあるパッケージ
      const problematicPackages = [
        '@supabase/auth-helpers-nextjs',
        '@square/web-sdk',
        'stripe'
      ];
      
      if (problematicPackages.includes(importPath)) {
        this.warnings.push({
          route: route.path,
          type: 'MISSING_PACKAGE',
          message: `パッケージが見つからない可能性: ${importPath}`,
          fix: `npm install ${importPath}`
        });
      }
    }
  }

  checkExports(route, content) {
    // デフォルトエクスポートの確認
    if (!content.includes('export default')) {
      this.errors.push({
        route: route.path,
        type: 'MISSING_EXPORT',
        message: 'デフォルトエクスポートが見つかりません'
      });
    }
  }

  checkAuthRequirements(route, content) {
    // 認証が必要なページで認証チェックがあるか
    if (route.auth === true || route.auth === 'admin') {
      if (!content.includes('useAuth') && !content.includes('getUser')) {
        this.warnings.push({
          route: route.path,
          type: 'MISSING_AUTH_CHECK',
          message: '認証チェックが実装されていない可能性があります'
        });
      }
    }
  }

  checkAPIRoutes(route, content) {
    // APIルートの呼び出しをチェック
    const apiCallRegex = /fetch\(['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = apiCallRegex.exec(content)) !== null) {
      const apiPath = match[1];
      
      if (apiPath.startsWith('/api/')) {
        // APIルートファイルの存在確認
        const apiFilePath = `src/app${apiPath}/route.ts`;
        const fullApiPath = path.join(process.cwd(), apiFilePath);
        
        if (!fs.existsSync(fullApiPath)) {
          this.errors.push({
            route: route.path,
            type: 'MISSING_API_ROUTE',
            message: `APIルートが見つかりません: ${apiPath}`
          });
        }
      }
    }
  }

  checkComponents(route, content) {
    // コンポーネントのインポートチェック
    const componentImports = content.match(/from\s+['"]@\/components[^'"]+['"]/g) || [];
    
    componentImports.forEach(imp => {
      const componentPath = imp.match(/['"]([^'"]+)['"]/)[1];
      const resolvedPath = componentPath.replace('@/', 'src/');
      
      // index.tsが存在するか確認
      const indexPath = path.join(process.cwd(), resolvedPath, 'index.ts');
      const directPath = path.join(process.cwd(), resolvedPath + '.tsx');
      
      if (!fs.existsSync(indexPath) && !fs.existsSync(directPath)) {
        this.errors.push({
          route: route.path,
          type: 'MISSING_COMPONENT',
          message: `コンポーネントが見つかりません: ${componentPath}`
        });
      }
    });
  }

  printReport() {
    console.log('\n\n🏁 QCチェック完了\n');
    console.log('='.repeat(60));
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ すべてのページが正常です！');
      return;
    }
    
    if (this.errors.length > 0) {
      console.log(`\n❌ エラー: ${this.errors.length}件\n`);
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.route} - ${error.type}`);
        console.log(`   ${error.message}`);
        if (error.fix) {
          console.log(`   修正方法: ${error.fix}`);
        }
        console.log();
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  警告: ${this.warnings.length}件\n`);
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.route} - ${warning.type}`);
        console.log(`   ${warning.message}`);
        if (warning.fix) {
          console.log(`   修正候補: ${warning.fix}`);
        }
        console.log();
      });
    }
    
    console.log('\n📋 サマリー');
    console.log(`総ページ数: ${this.routes.length}`);
    console.log(`エラー: ${this.errors.length}`);
    console.log(`警告: ${this.warnings.length}`);
    console.log(`正常: ${this.routes.length - this.errors.length}`);
  }
}

// 実行
const checker = new QCChecker();
checker.checkAllPages();