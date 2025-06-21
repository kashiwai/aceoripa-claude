#!/usr/bin/env node

/**
 * Netlify API を使った自動デプロイスクリプト
 * 承認しながら進められるようにしています
 */

const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

async function deployToNetlify() {
  console.log('🚀 Netlify 自動デプロイツール');
  console.log('================================\n');

  // 1. Netlify CLIがインストールされているか確認
  try {
    execSync('netlify --version', { stdio: 'ignore' });
    console.log('✅ Netlify CLI が見つかりました');
  } catch (error) {
    console.log('❌ Netlify CLI がインストールされていません');
    console.log('\n以下のコマンドでインストールしてください:');
    console.log('npm install -g netlify-cli\n');
    
    const install = await ask('今すぐインストールしますか？ (y/n): ');
    if (install.toLowerCase() === 'y') {
      console.log('インストール中...');
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    } else {
      process.exit(1);
    }
  }

  // 2. ログイン確認
  console.log('\n📝 Netlifyにログインします...');
  const login = await ask('ブラウザが開きます。続けますか？ (y/n): ');
  
  if (login.toLowerCase() === 'y') {
    execSync('netlify login', { stdio: 'inherit' });
  }

  // 3. サイトの初期化または既存サイトとの連携
  console.log('\n🔗 サイトの設定');
  const hasExistingSite = await ask('既存のNetlifyサイトがありますか？ (y/n): ');
  
  if (hasExistingSite.toLowerCase() === 'y') {
    console.log('\n既存のサイトと連携します...');
    execSync('netlify link', { stdio: 'inherit' });
  } else {
    console.log('\n新しいサイトを作成します...');
    execSync('netlify init', { stdio: 'inherit' });
  }

  // 4. ビルド実行
  console.log('\n🔨 ビルドを実行します...');
  const runBuild = await ask('ローカルでビルドを実行しますか？ (y/n): ');
  
  if (runBuild.toLowerCase() === 'y') {
    console.log('ビルド中...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // 5. デプロイ
  console.log('\n🚀 デプロイの準備ができました！');
  console.log('以下の設定でデプロイします:');
  console.log('- ビルドコマンド: npm run build');
  console.log('- 公開ディレクトリ: .next');
  console.log('- Node.js バージョン: 20.x');
  
  const deploy = await ask('\nデプロイを実行しますか？ (y/n): ');
  
  if (deploy.toLowerCase() === 'y') {
    console.log('\nデプロイ中...');
    
    // 環境変数の設定
    console.log('\n環境変数を設定します（後から変更可能）');
    
    // デプロイ実行
    try {
      execSync('netlify deploy --build --prod', { stdio: 'inherit' });
      console.log('\n✅ デプロイが完了しました！');
      
      // サイトを開く
      const openSite = await ask('\nサイトを開きますか？ (y/n): ');
      if (openSite.toLowerCase() === 'y') {
        execSync('netlify open:site', { stdio: 'inherit' });
      }
    } catch (error) {
      console.error('\n❌ デプロイに失敗しました:', error.message);
    }
  }

  rl.close();
}

// 実行
deployToNetlify().catch(console.error);