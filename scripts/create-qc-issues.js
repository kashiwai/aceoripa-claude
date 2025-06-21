#!/usr/bin/env node
// QC分散テスト用GitHub Issues自動作成スクリプト

const { execSync } = require('child_process');

const terminalTasks = {
  'terminal-1': {
    name: 'フロントエンド・UI/UX',
    tasks: [
      '📱 スマートフォン表示テスト (375px-414px)',
      '💻 タブレット・デスクトップ表示テスト',
      '🎨 UI/UX・アクセシビリティテスト',
      '🔗 ナビゲーション・リンクテスト',
      '📝 フォーム入力・バリデーションテスト',
      '🎯 ボタン・操作性テスト',
      '🌈 カラーコントラスト・可読性テスト',
      '⚡ ローディング・エラー表示テスト'
    ]
  },
  'terminal-2': {
    name: 'バックエンド・API',
    tasks: [
      '🗄️ Supabase データベース接続テスト',
      '🔌 認証API (/api/auth/*) テスト',
      '🎰 ガチャAPI (/api/gacha/*) テスト',
      '👨‍💼 管理API (/api/admin/*) テスト',
      '👤 ユーザーAPI (/api/user/*) テスト',
      '⚡ パフォーマンス・レスポンス時間テスト',
      '📊 大量データ処理テスト',
      '🔒 セキュリティ・認証テスト'
    ]
  },
  'terminal-3': {
    name: 'ガチャシステム',
    tasks: [
      '🎲 ガチャ基本機能テスト',
      '📊 確率検証テスト (SSR:3%, SR:12%, R:25%, N:60%)',
      '🎭 演出・アニメーション表示テスト',
      '🔊 サウンドエフェクトテスト',
      '💳 ポイント消費・計算テスト',
      '🎴 カード排出・付与システムテスト',
      '📱 ガチャ結果表示・シェア機能テスト',
      '📈 統計的偏りチェック (1000回テスト)'
    ]
  },
  'terminal-4': {
    name: 'Admin・決済',
    tasks: [
      '🔐 Admin認証・ログインテスト',
      '👥 ユーザー管理機能テスト',
      '🎰 ガチャ管理・設定機能テスト',
      '🃏 カード管理・CSV import テスト',
      '📦 発送管理・ステータス更新テスト',
      '📢 お知らせ管理機能テスト',
      '🏆 ランキング管理機能テスト',
      '💳 Square決済システムテスト',
      '📊 売上統計・レポート機能テスト'
    ]
  },
  'terminal-5': {
    name: '演出・エンタメ',
    tasks: [
      '🤖 AI画像生成システムテスト',
      '🎬 ガチャ演出動画・エフェクトテスト',
      '🔔 プッシュ通知システムテスト',
      '🖼️ 動的バナー生成・表示テスト',
      '🎵 音声・BGM再生テスト',
      '✨ アニメーション・トランジションテスト',
      '📱 通知許可・送受信テスト',
      '🎪 カルーセル・画像遅延読み込みテスト'
    ]
  },
  'terminal-6': {
    name: 'QC・統合',
    tasks: [
      '🔧 ビルド・デプロイプロセステスト',
      '⚖️ 法的ページ・コンプライアンステスト',
      '🔒 セキュリティ・脆弱性スキャン',
      '📊 統合・エンドツーエンドテスト',
      '💾 バックアップ・災害復旧テスト',
      '🚀 インフラ・パフォーマンステスト',
      '🔍 OWASP Top 10 セキュリティチェック',
      '🎯 最終Go/No-Go判定'
    ]
  }
};

function createQCIssues() {
  console.log('🚀 QC分散テスト用 GitHub Issues 作成開始');
  console.log('================================================');

  // GitHub CLI の確認
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ GitHub CLI (gh) がインストールされていません');
    console.log('インストール: https://cli.github.com/');
    return;
  }

  let issueCount = 0;

  // 各端末のタスクをIssueとして作成
  Object.entries(terminalTasks).forEach(([terminal, info]) => {
    console.log(`\n📱 ${terminal}: ${info.name} のIssue作成中...`);
    
    info.tasks.forEach((task, index) => {
      const issueTitle = `[${terminal.toUpperCase()}] ${task}`;
      const issueBody = `## 担当端末
${terminal}: ${info.name}

## テスト項目
${task}

## チェックリスト
- [ ] テスト環境準備完了
- [ ] テスト実行完了
- [ ] 結果記録完了
- [ ] 問題発見時は詳細記録

## 進捗報告フォーマット
\`\`\`
時刻: [HH:MM]
端末: ${terminal}
ステータス: [準備中/実行中/完了/問題発生]
結果: [成功/失敗/要確認]
詳細: [具体的な結果・問題点]
次のアクション: [必要な対応]
\`\`\`

## 成功基準
- ✅ 正常動作確認
- ✅ エラーハンドリング確認
- ✅ パフォーマンス基準達成
- ✅ セキュリティ要件満足

---

🎯 **目標**: 44時間以内の完全なQC完了
🔄 **更新**: 進捗に応じてコメント追加
🚨 **緊急**: Critical問題発見時は即座に priority-critical ラベル追加`;

      try {
        // GitHub Issue 作成
        const labels = [
          'QC',
          terminal,
          'priority-high',
          'status-pending'
        ];

        const command = `gh issue create --title "${issueTitle}" --body "${issueBody}" --label "${labels.join(',')}"`;
        
        execSync(command, { stdio: 'ignore' });
        issueCount++;
        
        console.log(`  ✅ Issue #${issueCount}: ${task.substring(0, 30)}...`);
        
      } catch (error) {
        console.error(`  ❌ Issue作成失敗: ${task}`);
        console.error(`  エラー: ${error.message}`);
      }
    });
  });

  console.log(`\n🎉 QC Issues 作成完了: ${issueCount}件`);
  console.log('\n📊 次のステップ:');
  console.log('1. 各端末担当者にIssue割り当て');
  console.log('2. 進捗監視開始: node scripts/qc-progress-report.js');
  console.log('3. リアルタイム監視: watch -n 300 node scripts/qc-progress-report.js');
  console.log('\n🔗 GitHub Issues確認:');
  console.log('gh issue list --label="QC"');
}

// メイン実行
if (require.main === module) {
  createQCIssues();
}

module.exports = { createQCIssues };