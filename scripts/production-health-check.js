#!/usr/bin/env node

// 本番環境ヘルスチェックスクリプト
// 使用方法: node scripts/production-health-check.js

const https = require('https');
const { URL } = require('url');

const PRODUCTION_URL = 'https://ace-oripa.com';

// カラー出力用
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTPSリクエストを送信する関数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// ヘルスチェック関数
async function checkEndpoint(name, path, expectedStatus = 200) {
  try {
    log('blue', `🔍 チェック中: ${name}`);
    const response = await makeRequest(`${PRODUCTION_URL}${path}`);
    
    if (response.statusCode === expectedStatus) {
      log('green', `✅ ${name}: OK (${response.statusCode})`);
      return true;
    } else {
      log('red', `❌ ${name}: Failed (${response.statusCode})`);
      return false;
    }
  } catch (error) {
    log('red', `❌ ${name}: Error - ${error.message}`);
    return false;
  }
}

// メインのヘルスチェック関数
async function runHealthCheck() {
  log('blue', '🚀 本番環境ヘルスチェック開始');
  log('blue', `📍 対象URL: ${PRODUCTION_URL}`);
  console.log('');

  const checks = [
    // 基本ページ
    { name: 'トップページ', path: '/', status: 200 },
    { name: 'ログインページ', path: '/auth/login', status: 200 },
    { name: '登録ページ', path: '/auth/register', status: 200 },
    { name: 'ガチャページ', path: '/gacha', status: 200 },
    
    // API エンドポイント
    { name: 'ヘルスチェックAPI', path: '/api/health', status: 200 },
    { name: '認証状態確認API', path: '/api/auth/me', status: 401 }, // 未認証なので401が正常
    
    // 静的ファイル
    { name: 'favicon', path: '/favicon.ico', status: 200 },
    { name: 'robots.txt', path: '/robots.txt', status: 200 },
  ];

  let passedChecks = 0;
  const totalChecks = checks.length;

  for (const check of checks) {
    const result = await checkEndpoint(check.name, check.path, check.status);
    if (result) passedChecks++;
    
    // 少し待機してサーバーに負荷をかけないようにする
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('');
  log('blue', '📊 ヘルスチェック結果');
  log('blue', '========================');
  
  if (passedChecks === totalChecks) {
    log('green', `🎉 すべてのチェックが成功しました！ (${passedChecks}/${totalChecks})`);
  } else {
    log('yellow', `⚠️  いくつかのチェックが失敗しました (${passedChecks}/${totalChecks})`);
  }

  // セキュリティヘッダーチェック
  console.log('');
  log('blue', '🔒 セキュリティヘッダーチェック');
  try {
    const response = await makeRequest(PRODUCTION_URL);
    const headers = response.headers;
    
    const securityHeaders = [
      { name: 'X-Frame-Options', header: 'x-frame-options' },
      { name: 'X-Content-Type-Options', header: 'x-content-type-options' },
      { name: 'X-XSS-Protection', header: 'x-xss-protection' },
      { name: 'Strict-Transport-Security', header: 'strict-transport-security' },
    ];

    securityHeaders.forEach(({ name, header }) => {
      if (headers[header]) {
        log('green', `✅ ${name}: ${headers[header]}`);
      } else {
        log('yellow', `⚠️  ${name}: 設定されていません`);
      }
    });
  } catch (error) {
    log('red', `❌ セキュリティヘッダーチェック失敗: ${error.message}`);
  }

  // SSL証明書チェック
  console.log('');
  log('blue', '🔐 SSL証明書チェック');
  try {
    const response = await makeRequest(PRODUCTION_URL);
    log('green', '✅ SSL証明書: 有効');
  } catch (error) {
    if (error.code === 'CERT_HAS_EXPIRED') {
      log('red', '❌ SSL証明書: 期限切れ');
    } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      log('red', '❌ SSL証明書: 検証失敗');
    } else {
      log('yellow', `⚠️  SSL証明書チェック: ${error.message}`);
    }
  }

  console.log('');
  log('blue', '📝 追加確認推奨項目:');
  console.log('  • Google OAuth認証テスト');
  console.log('  • GMO fincode決済テスト');
  console.log('  • Supabaseデータベース接続');
  console.log('  • 実際のガチャ機能テスト');
  console.log('  • 管理者機能テスト');
  
  console.log('');
  log('blue', '🔗 有用なリンク:');
  console.log(`  • 本番サイト: ${PRODUCTION_URL}`);
  console.log('  • Vercelダッシュボード: https://vercel.com/dashboard');
  console.log('  • Supabaseダッシュボード: https://supabase.com/dashboard');
  console.log('  • Google Cloud Console: https://console.cloud.google.com');
}

// スクリプト実行
if (require.main === module) {
  runHealthCheck().catch(error => {
    log('red', `❌ ヘルスチェック実行エラー: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runHealthCheck, makeRequest };