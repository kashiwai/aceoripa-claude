#!/usr/bin/env node

/**
 * ガチャプールのシードデータを投入するスクリプト
 * 
 * 使用方法:
 * 1. Supabaseのダッシュボードまたはローカル環境でPostgreSQLに接続
 * 2. supabase/seed-gacha-pools.sql の内容を実行
 * 
 * または、このスクリプトを使用して自動的に実行:
 * node scripts/seed-gacha-data.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🎰 ガチャプールのシードデータを投入します...');

// SQLファイルのパスを確認
const sqlFilePath = path.join(__dirname, '..', 'supabase', 'seed-gacha-pools.sql');

if (!fs.existsSync(sqlFilePath)) {
  console.error('❌ SQLファイルが見つかりません:', sqlFilePath);
  process.exit(1);
}

console.log('📄 SQLファイルを確認しました:', sqlFilePath);

// 環境変数をチェック
if (!process.env.DATABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️  データベース接続情報が設定されていません。');
  console.log('\n以下の手順でシードデータを投入してください:');
  console.log('1. Supabaseのダッシュボードにログイン');
  console.log('2. SQL Editorを開く');
  console.log('3. supabase/seed-gacha-pools.sql の内容をコピー&ペースト');
  console.log('4. Runボタンをクリックして実行');
  console.log('\nまたは、ローカルのSupabaseを使用している場合:');
  console.log('supabase db reset');
  console.log('supabase db push');
  process.exit(0);
}

// Supabase CLIがインストールされているか確認
try {
  execSync('supabase --version', { stdio: 'ignore' });
  console.log('✅ Supabase CLIを検出しました');
  
  // ローカルのSupabaseが起動しているか確認
  try {
    execSync('supabase status', { stdio: 'ignore' });
    console.log('✅ ローカルのSupabaseが起動しています');
    
    // SQLファイルを実行
    console.log('🚀 シードデータを投入中...');
    execSync(`supabase db push --include-seed`, { stdio: 'inherit' });
    
    console.log('✅ シードデータの投入が完了しました！');
  } catch (error) {
    console.log('⚠️  ローカルのSupabaseが起動していません');
    console.log('以下のコマンドでSupabaseを起動してください:');
    console.log('supabase start');
  }
} catch (error) {
  console.log('⚠️  Supabase CLIがインストールされていません');
  console.log('以下のコマンドでインストールしてください:');
  console.log('npm install -g supabase');
}

console.log('\n📝 補足情報:');
console.log('- ガチャプールデータはgacha_pokemon_poolsテーブルに保存されます');
console.log('- ポケモンカードデータはpokemon_cardsテーブルに保存されます');
console.log('- 各ガチャには異なるカードセットが設定されています');
console.log('- レアリティごとの確率は weight カラムで制御されています');