#!/usr/bin/env node
// 分散QCテスト統括開始スクリプト

const { execSync } = require('child_process');
const fs = require('fs');

// カラー出力
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function startDistributedQC() {
  console.clear();
  
  const startTime = new Date();
  const deadline = new Date(startTime.getTime() + (44 * 60 * 60 * 1000)); // 44時間後
  
  log('🚨 【緊急】分散QCテスト開始指示', 'red');
  log('='.repeat(60), 'blue');
  log('', 'reset');
  
  // 基本情報表示
  log('📋 テスト概要', 'cyan');
  log('─'.repeat(40), 'cyan');
  log(`🕐 開始時刻: ${startTime.toLocaleString('ja-JP')}`, 'white');
  log(`⏰ 完了期限: ${deadline.toLocaleString('ja-JP')}`, 'white');
  log(`⏳ 制限時間: 44時間`, 'yellow');
  log(`🎯 目標: 全端末QC完了`, 'green');
  log('', 'reset');

  // GitHub リポジトリ情報
  log('📂 GitHub リポジトリ', 'cyan');
  log('─'.repeat(40), 'cyan');
  log('🔗 https://github.com/kashiwai/aceoripa-claude.git', 'white');
  log('📋 QC_DISTRIBUTED_PLAN.md 参照', 'white');
  log('📊 GitHub Issues で進捗報告（毎時）', 'white');
  log('🚨 Critical Issue は即座に 🚨 ラベルで報告', 'red');
  log('', 'reset');

  // 端末別URL
  log('🖥️ 端末別URL', 'cyan');
  log('─'.repeat(40), 'cyan');
  log('端末1-5: http://localhost:3000', 'white');
  log('端末6: 全体統括・進捗管理', 'magenta');
  log('', 'reset');

  // 端末別担当表示
  const terminals = {
    '端末1': 'フロントエンド・UI/UX（スマホファースト）',
    '端末2': 'バックエンド・API・データベース',
    '端末3': 'ガチャシステム・確率エンジン',
    '端末4': 'Admin管理・決済システム',
    '端末5': '演出・エンタメ（AI生成パーツ）',
    '端末6': 'QC・インフラ・DevOps（統括）'
  };

  log('👥 端末別担当', 'cyan');
  log('─'.repeat(40), 'cyan');
  Object.entries(terminals).forEach(([terminal, role]) => {
    log(`${terminal}: ${role}`, 'white');
  });
  log('', 'reset');

  // GitHub Issues 作成
  log('📝 GitHub Issues 自動作成中...', 'yellow');
  try {
    // QC Issues作成スクリプト実行
    require('./create-qc-issues.js').createQCIssues();
    log('✅ GitHub Issues 作成完了', 'green');
  } catch (error) {
    log('❌ GitHub Issues 作成エラー', 'red');
    log(`エラー詳細: ${error.message}`, 'red');
  }
  log('', 'reset');

  // 進捗確認コマンド
  log('📊 進捗確認コマンド', 'cyan');
  log('─'.repeat(40), 'cyan');
  log('# 全体進捗確認', 'white');
  log('node scripts/qc-progress-report.js', 'yellow');
  log('', 'reset');
  log('# GitHub Issues 確認', 'white');
  log('gh issue list --label="QC"', 'yellow');
  log('gh issue list --label="priority-critical"', 'yellow');
  log('', 'reset');
  log('# リアルタイム監視（5分毎更新）', 'white');
  log('watch -n 300 node scripts/qc-progress-report.js', 'yellow');
  log('', 'reset');

  // 緊急時の指示テンプレート
  log('🚨 緊急時の指示テンプレート', 'red');
  log('─'.repeat(40), 'red');
  log('【緊急】Critical Issue 発生', 'red');
  log('', 'reset');
  log('端末X で重大な問題を発見：', 'white');
  log('- 問題: [具体的な問題]', 'white');
  log('- 影響: [影響範囲]', 'white');
  log('- 対応: 端末Y が即座に修正開始', 'white');
  log('- 他端末: テスト継続、該当箇所は一時スキップ', 'white');
  log('', 'reset');
  log('GitHub Issue #XX 参照', 'yellow');
  log('', 'reset');

  // 報告フォーマット
  log('📝 1時間毎報告フォーマット', 'cyan');
  log('─'.repeat(40), 'cyan');
  log('時刻: [HH:MM]', 'white');
  log('端末: [端末番号]', 'white');
  log('ステータス: [進行中/完了/問題発生]', 'white');
  log('進捗: [X/Y 項目完了]', 'white');
  log('発見問題: [問題の詳細]', 'white');
  log('次のアクション: [具体的な次の作業]', 'white');
  log('', 'reset');

  // QC開始ファイル作成
  const qcConfig = {
    startTime: startTime.toISOString(),
    deadline: deadline.toISOString(),
    terminals: terminals,
    status: 'active',
    issuesCreated: true
  };

  fs.writeFileSync('qc-session.json', JSON.stringify(qcConfig, null, 2));
  log('💾 QCセッション設定保存完了', 'green');
  log('', 'reset');

  // 最終指示
  log('🚀 【重要】全端末への指示', 'green');
  log('='.repeat(60), 'green');
  log('1. 即座にGitHubリポジトリをクローン/プル', 'white');
  log('2. 各自の担当Issue確認・開始', 'white');
  log('3. 1時間毎にGitHub Issuesで進捗報告', 'white');
  log('4. Critical問題は即座に🚨ラベルで報告', 'white');
  log('5. 質問はGitHub Issuesで共有', 'white');
  log('', 'reset');
  
  log('🎯 目標: 44時間以内完了', 'yellow');
  log('📍 現在: QCテスト開始 - 全端末テスト実行開始！', 'green');
  log('', 'reset');
  
  // 自動進捗監視開始提案
  log('🔄 自動進捗監視を開始しますか？', 'cyan');
  log('以下のコマンドで監視開始:', 'white');
  log('watch -n 300 node scripts/qc-progress-report.js', 'yellow');
  log('', 'reset');
  
  log('='.repeat(60), 'blue');
  log('🎮 ACEorIPA 分散QCテスト開始！', 'green');
  log('='.repeat(60), 'blue');
}

// 簡易進捗更新関数
function updateTerminalProgress(terminal, status, progress, issues = []) {
  const progressFile = 'qc-progress.json';
  let data = { terminals: {} };
  
  if (fs.existsSync(progressFile)) {
    data = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
  }
  
  if (!data.terminals[terminal]) {
    data.terminals[terminal] = {};
  }
  
  data.terminals[terminal] = {
    ...data.terminals[terminal],
    status,
    progress,
    issues,
    lastUpdate: new Date().toISOString()
  };
  
  fs.writeFileSync(progressFile, JSON.stringify(data, null, 2));
  console.log(`✅ ${terminal} 進捗更新: ${progress}% (${status})`);
}

// GitHub Issue作成ヘルパー
function createCriticalIssue(title, description, terminal) {
  try {
    const issueBody = `## 🚨 Critical Issue
    
${description}

## 担当端末
${terminal}

## 緊急度
**Critical** - 即座の対応が必要

## 対応手順
1. [ ] 問題の詳細調査
2. [ ] 修正方針決定
3. [ ] 修正実施
4. [ ] テスト・検証
5. [ ] 完了報告

---
⚠️ **他端末への指示**: この問題が解決されるまで関連テストは一時スキップし、他の項目を継続してください。`;

    const command = `gh issue create --title "[🚨 CRITICAL] ${title}" --body "${issueBody}" --label "priority-critical,QC,${terminal}"`;
    execSync(command);
    
    console.log(`🚨 Critical Issue 作成完了: ${title}`);
    
    // 全端末に通知
    console.log('\n【全端末通知】Critical Issue発生 - 即座確認要');
    
  } catch (error) {
    console.error(`❌ Critical Issue作成エラー: ${error.message}`);
  }
}

// メイン実行
if (require.main === module) {
  startDistributedQC();
}

module.exports = { 
  startDistributedQC, 
  updateTerminalProgress, 
  createCriticalIssue 
};