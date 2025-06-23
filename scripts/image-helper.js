#!/usr/bin/env node

/**
 * 画像ファイル管理ヘルパースクリプト
 */

const fs = require('fs');
const path = require('path');

const CARDS_DIR = path.join(__dirname, '../public/images/cards');

// 1. cardsディレクトリ内の画像ファイル一覧を表示
function listImages() {
  console.log('=== カード画像ファイル一覧 ===');
  
  if (!fs.existsSync(CARDS_DIR)) {
    console.log('❌ /public/images/cards/ ディレクトリが存在しません');
    return;
  }

  const files = fs.readdirSync(CARDS_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .sort();

  if (files.length === 0) {
    console.log('📁 画像ファイルが見つかりません');
    return;
  }

  console.log(`📁 ${files.length}個の画像ファイルが見つかりました：\n`);
  files.forEach((file, index) => {
    console.log(`${String(index + 1).padStart(3, ' ')}. ${file}`);
  });
}

// 2. CSVテンプレート生成（既存画像ファイルベース）
function generateCSVTemplate() {
  console.log('=== CSV テンプレート生成 ===');
  
  if (!fs.existsSync(CARDS_DIR)) {
    console.log('❌ /public/images/cards/ ディレクトリが存在しません');
    return;
  }

  const files = fs.readdirSync(CARDS_DIR)
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .sort();

  if (files.length === 0) {
    console.log('❌ 画像ファイルが見つかりません');
    return;
  }

  // CSVヘッダー
  let csvContent = 'カード名,商品コード,レアリティ,還元pt,カード画像URL,ローカル画像パス\n';
  
  // 各ファイルに対してテンプレート行を生成
  files.forEach((file, index) => {
    const nameWithoutExt = path.parse(file).name;
    const cardName = nameWithoutExt.replace(/-/g, ' '); // ハイフンをスペースに
    const productCode = `PKM-${String(index + 1).padStart(3, '0')}`;
    const rarity = index < 3 ? 'SS' : index < 10 ? 'S' : index < 30 ? 'A' : index < 100 ? 'B' : 'C';
    const points = rarity === 'SS' ? 50000 : rarity === 'S' ? 10000 : rarity === 'A' ? 1000 : rarity === 'B' ? 300 : 100;
    
    csvContent += `${cardName},${productCode},${rarity},${points},,${file}\n`;
  });

  // CSVファイルを保存
  const csvPath = path.join(__dirname, '../generated-csv-template.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  
  console.log(`✅ CSVテンプレートを生成しました: ${csvPath}`);
  console.log(`📁 ${files.length}枚のカードが含まれています`);
  console.log('\n💡 生成されたCSVを編集してカード名やレアリティを調整してください');
}

// 3. 画像ファイル名検証
function validateFileNames() {
  console.log('=== ファイル名検証 ===');
  
  if (!fs.existsSync(CARDS_DIR)) {
    console.log('❌ /public/images/cards/ ディレクトリが存在しません');
    return;
  }

  const files = fs.readdirSync(CARDS_DIR);
  const issues = [];

  files.forEach(file => {
    // 画像ファイルかチェック
    if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(file)) {
      issues.push(`❌ ${file} - 画像ファイルではありません`);
      return;
    }

    // 日本語文字チェック
    if (/[ひらがなカタカナ漢字]/.test(file)) {
      issues.push(`⚠️  ${file} - 日本語文字が含まれています（推奨：英数字とハイフン）`);
    }

    // スペースチェック
    if (file.includes(' ')) {
      issues.push(`⚠️  ${file} - スペースが含まれています（推奨：ハイフンに変更）`);
    }

    // 特殊文字チェック
    if (/[^a-zA-Z0-9.\-_]/.test(file)) {
      issues.push(`⚠️  ${file} - 特殊文字が含まれています`);
    }
  });

  if (issues.length === 0) {
    console.log('✅ すべてのファイル名が適切です');
  } else {
    console.log('⚠️  ファイル名に問題があります：\n');
    issues.forEach(issue => console.log(issue));
  }
}

// 4. 使用方法表示
function showUsage() {
  console.log('=== 画像ファイル管理ヘルパー ===\n');
  console.log('使用方法:');
  console.log('  node scripts/image-helper.js list     - 画像ファイル一覧表示');
  console.log('  node scripts/image-helper.js csv      - CSVテンプレート生成');
  console.log('  node scripts/image-helper.js validate - ファイル名検証');
  console.log('  node scripts/image-helper.js help     - このヘルプを表示');
  console.log('\n📁 画像ファイルは /public/images/cards/ に配置してください');
}

// メイン処理
const command = process.argv[2];

switch (command) {
  case 'list':
    listImages();
    break;
  case 'csv':
    generateCSVTemplate();
    break;
  case 'validate':
    validateFileNames();
    break;
  case 'help':
  default:
    showUsage();
    break;
}