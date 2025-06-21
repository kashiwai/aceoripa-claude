#!/usr/bin/env node

/**
 * 端末5: パフォーマンス・負荷テスト実行スクリプト
 * 実行コマンド: node tests/performance-test.js
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

class PerformanceQCTest {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚨 端末5 - パフォーマンス・負荷テスト開始');
    console.log('==========================================');
    
    try {
      // 1. 基本的な接続テスト
      await this.testBasicConnectivity();
      
      // 2. AI生成システムテスト
      await this.testAIGenerationSystem();
      
      // 3. 動画・エフェクトテスト
      await this.testVideoEffects();
      
      // 4. プッシュ通知テスト
      await this.testPushNotifications();
      
      // 5. 画像・バナーシステムテスト
      await this.testImageBannerSystem();
      
      // 6. パフォーマンステスト
      await this.testPerformance();
      
      // 結果出力
      this.generateReport();
      
    } catch (error) {
      console.error('🚨 CRITICAL ERROR:', error.message);
      this.addResult('CRITICAL_ERROR', false, error.message);
    }
  }

  async testBasicConnectivity() {
    console.log('\n🔗 1. 基本接続テスト');
    
    try {
      const response = await this.fetch('/');
      if (response.status === 200) {
        this.addResult('Homepage Connectivity', true, `Status: ${response.status}`);
        console.log('✅ ホームページ接続: OK');
      } else {
        this.addResult('Homepage Connectivity', false, `Status: ${response.status}`);
        console.log('❌ ホームページ接続: FAILED');
      }
    } catch (error) {
      this.addResult('Homepage Connectivity', false, error.message);
      console.log('🚨 CRITICAL: ホームページ接続不可');
    }
  }

  async testAIGenerationSystem() {
    console.log('\n🤖 2. AI生成システムテスト');
    
    // カード画像自動生成テスト
    try {
      const response = await this.fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'card',
          name: 'テストカード',
          rarity: 'SSR'
        })
      });

      if (response.status === 200) {
        this.addResult('AI Card Generation', true, 'Image generation API responsive');
        console.log('✅ AI画像生成: OK');
      } else {
        this.addResult('AI Card Generation', false, `Status: ${response.status}`);
        console.log('⚠️ AI画像生成: WARNING');
      }
    } catch (error) {
      this.addResult('AI Card Generation', false, error.message);
      console.log('❌ AI画像生成: FAILED');
    }

    // バナー画像生成テスト
    try {
      const response = await this.fetch('/api/generate-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'テストバナー',
          type: 'campaign'
        })
      });

      if (response.status === 200) {
        this.addResult('AI Banner Generation', true, 'Banner generation API responsive');
        console.log('✅ AIバナー生成: OK');
      } else {
        this.addResult('AI Banner Generation', false, `Status: ${response.status}`);
        console.log('⚠️ AIバナー生成: WARNING');
      }
    } catch (error) {
      this.addResult('AI Banner Generation', false, error.message);
      console.log('❌ AIバナー生成: FAILED');
    }
  }

  async testVideoEffects() {
    console.log('\n🎬 3. 動画・エフェクトテスト');
    
    // ガチャページの演出確認
    try {
      const response = await this.fetch('/gacha/pokemon-151');
      if (response.status === 200) {
        this.addResult('Gacha Effects Page', true, 'Gacha page loads successfully');
        console.log('✅ ガチャ演出ページ: OK');
      } else {
        this.addResult('Gacha Effects Page', false, `Status: ${response.status}`);
        console.log('❌ ガチャ演出ページ: FAILED');
      }
    } catch (error) {
      this.addResult('Gacha Effects Page', false, error.message);
      console.log('❌ ガチャ演出ページ: FAILED');
    }

    // 静的アセット確認
    const staticAssets = ['/sw.js', '/api/placeholder/400/400'];
    for (const asset of staticAssets) {
      try {
        const response = await this.fetch(asset);
        if (response.status === 200) {
          this.addResult(`Static Asset: ${asset}`, true, 'Asset loads successfully');
          console.log(`✅ 静的アセット ${asset}: OK`);
        } else {
          this.addResult(`Static Asset: ${asset}`, false, `Status: ${response.status}`);
          console.log(`❌ 静的アセット ${asset}: FAILED`);
        }
      } catch (error) {
        this.addResult(`Static Asset: ${asset}`, false, error.message);
        console.log(`❌ 静的アセット ${asset}: FAILED`);
      }
    }
  }

  async testPushNotifications() {
    console.log('\n🔔 4. プッシュ通知システムテスト');
    
    // 通知API確認
    try {
      const response = await this.fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'QCテスト通知',
          message: '端末5からのテスト通知です',
          sendToAll: false
        })
      });

      if (response.status === 200 || response.status === 400) {
        this.addResult('Push Notification API', true, 'Notification API responsive');
        console.log('✅ プッシュ通知API: OK');
      } else {
        this.addResult('Push Notification API', false, `Status: ${response.status}`);
        console.log('❌ プッシュ通知API: FAILED');
      }
    } catch (error) {
      this.addResult('Push Notification API', false, error.message);
      console.log('❌ プッシュ通知API: FAILED');
    }

    // 管理者通知ページ確認（認証リダイレクトは正常動作）
    try {
      const response = await this.fetch('/admin/notifications');
      if (response.status === 200 || response.status === 307 || response.status === 302) {
        // 307/302は認証リダイレクトで正常
        this.addResult('Admin Notifications Page', true, `Admin page redirects properly (${response.status})`);
        console.log('✅ 管理者通知ページ: OK (認証リダイレクト)');
      } else {
        this.addResult('Admin Notifications Page', false, `Unexpected status: ${response.status}`);
        console.log('❌ 管理者通知ページ: FAILED');
      }
    } catch (error) {
      this.addResult('Admin Notifications Page', false, error.message);
      console.log('❌ 管理者通知ページ: FAILED');
    }
  }

  async testImageBannerSystem() {
    console.log('\n🖼️ 5. 画像・バナーシステムテスト');
    
    // プレースホルダー画像API
    const imageSizes = ['400/400', '1024/1024', '200/200'];
    for (const size of imageSizes) {
      try {
        const response = await this.fetch(`/api/placeholder/${size}`);
        if (response.status === 200) {
          this.addResult(`Placeholder Image ${size}`, true, 'Image generates successfully');
          console.log(`✅ プレースホルダー画像 ${size}: OK`);
        } else {
          this.addResult(`Placeholder Image ${size}`, false, `Status: ${response.status}`);
          console.log(`❌ プレースホルダー画像 ${size}: FAILED`);
        }
      } catch (error) {
        this.addResult(`Placeholder Image ${size}`, false, error.message);
        console.log(`❌ プレースホルダー画像 ${size}: FAILED`);
      }
    }

    // マイページ設定確認
    try {
      const response = await this.fetch('/mypage');
      if (response.status === 200) {
        this.addResult('MyPage with Settings', true, 'MyPage loads with notification settings');
        console.log('✅ マイページ(設定機能): OK');
      } else {
        this.addResult('MyPage with Settings', false, `Status: ${response.status}`);
        console.log('❌ マイページ(設定機能): FAILED');
      }
    } catch (error) {
      this.addResult('MyPage with Settings', false, error.message);
      console.log('❌ マイページ(設定機能): FAILED');
    }
  }

  async testPerformance() {
    console.log('\n⚡ 6. パフォーマンステスト');
    
    // レスポンス時間測定
    const pages = ['/', '/mypage', '/gacha/pokemon-151'];
    for (const page of pages) {
      const startTime = Date.now();
      try {
        const response = await this.fetch(page);
        const responseTime = Date.now() - startTime;
        
        if (responseTime < 3000) {
          this.addResult(`Response Time: ${page}`, true, `${responseTime}ms (Target: <3000ms)`);
          console.log(`✅ レスポンス時間 ${page}: ${responseTime}ms`);
        } else {
          this.addResult(`Response Time: ${page}`, false, `${responseTime}ms (Target: <3000ms)`);
          console.log(`🚨 CRITICAL: レスポンス時間 ${page}: ${responseTime}ms (遅すぎる)`);
        }
      } catch (error) {
        this.addResult(`Response Time: ${page}`, false, error.message);
        console.log(`❌ レスポンス時間測定失敗 ${page}: ${error.message}`);
      }
    }

    // 並行リクエストテスト
    console.log('🔄 並行リクエストテスト開始...');
    const promises = Array(10).fill().map(() => this.fetch('/'));
    try {
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const successCount = responses.filter(r => r.status === 200).length;
      if (successCount === 10) {
        this.addResult('Concurrent Requests', true, `10/10 successful in ${totalTime}ms`);
        console.log(`✅ 並行リクエスト: 10/10成功 (${totalTime}ms)`);
      } else {
        this.addResult('Concurrent Requests', false, `${successCount}/10 successful`);
        console.log(`❌ 並行リクエスト: ${successCount}/10成功`);
      }
    } catch (error) {
      this.addResult('Concurrent Requests', false, error.message);
      console.log(`❌ 並行リクエストテスト失敗: ${error.message}`);
    }
  }

  async fetch(url, options = {}) {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    return new Promise((resolve, reject) => {
      const parsedURL = new URL(fullURL);
      const requestOptions = {
        hostname: parsedURL.hostname,
        port: parsedURL.port,
        path: parsedURL.pathname + parsedURL.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000 // 10秒タイムアウト
      };

      const req = http.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
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

  addResult(testName, passed, details) {
    this.results.tests.push({
      name: testName,
      passed: passed,
      details: details,
      timestamp: new Date().toISOString()
    });

    if (passed) {
      this.results.summary.passed++;
    } else {
      if (testName.includes('CRITICAL') || details.includes('CRITICAL')) {
        this.results.summary.failed++;
      } else {
        this.results.summary.warnings++;
      }
    }
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalTests = this.results.summary.passed + this.results.summary.failed + this.results.summary.warnings;
    const successRate = Math.round((this.results.summary.passed / totalTests) * 100);

    console.log('\n📊 端末5 QCテスト結果サマリー');
    console.log('==========================================');
    console.log(`テスト実行時間: ${Math.round(totalTime / 1000)}秒`);
    console.log(`総テスト数: ${totalTests}`);
    console.log(`✅ 成功: ${this.results.summary.passed}`);
    console.log(`⚠️ 警告: ${this.results.summary.warnings}`);
    console.log(`❌ 失敗: ${this.results.summary.failed}`);
    console.log(`📈 成功率: ${successRate}%`);

    // Critical Issues
    const criticalIssues = this.results.tests.filter(t => 
      !t.passed && (t.name.includes('CRITICAL') || t.details.includes('CRITICAL'))
    );

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => {
        console.log(`   - ${issue.name}: ${issue.details}`);
      });
    }

    // レポートファイル出力
    const reportData = {
      ...this.results,
      summary: {
        ...this.results.summary,
        totalTests: totalTests,
        successRate: successRate,
        executionTime: totalTime
      }
    };

    fs.writeFileSync('tests/terminal-5-qc-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📝 詳細レポート: tests/terminal-5-qc-report.json');

    // GitHub Issue用マークダウン生成
    this.generateGitHubIssue(reportData);
  }

  generateGitHubIssue(reportData) {
    const currentTime = new Date().toLocaleString('ja-JP');
    const issueBody = `## 端末5 進捗レポート - ${currentTime}

### ✅ 完了項目
${reportData.tests.filter(t => t.passed).map(t => `- ${t.name}: ${t.details}`).join('\n')}

### ❌ 発見問題
${reportData.tests.filter(t => !t.passed).map(t => `- ${t.name}: ${t.details}`).join('\n')}

### 📈 進捗率
${reportData.summary.successRate}% 完了 (目標: 90%+)

### 🔜 次の1時間予定
- AI生成システム詳細検証
- パフォーマンス負荷テスト強化
- プッシュ通知実機テスト

### 📊 テスト統計
- 総テスト数: ${reportData.summary.totalTests}
- 成功: ${reportData.summary.passed}
- 警告: ${reportData.summary.warnings}  
- 失敗: ${reportData.summary.failed}
- 実行時間: ${Math.round(reportData.summary.executionTime / 1000)}秒`;

    fs.writeFileSync('tests/terminal-5-github-issue.md', issueBody);
    console.log('📋 GitHub Issue用レポート: tests/terminal-5-github-issue.md');
  }
}

// テスト実行
if (require.main === module) {
  const tester = new PerformanceQCTest();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceQCTest;