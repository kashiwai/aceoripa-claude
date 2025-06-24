const fs = require('fs');
const path = require('path');

// CSVファイルを読み込み
const csvFilePath = path.join(__dirname, '..', 'carddata_images_no.csv');
const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

// ランクをレアリティにマッピング
const mapRankToRarity = (rank) => {
  const normalizedRank = rank.toLowerCase().replace('rank', '');
  switch (normalizedRank) {
    case 'ss': return 'SS';
    case 's': return 'S';
    case 'a': return 'A';
    case 'b': return 'B';
    case 'c': return 'C';
    case 'd': return 'C';
    default: return 'C';
  }
};

// SQLエスケープ関数
const escapeSql = (str) => {
  if (!str) return '';
  return str.replace(/'/g, "''").trim();
};

// CSVをパース
const lines = csvContent.split('\n');
const sqlStatements = [];

// テーブル作成とRLS無効化のSQL
sqlStatements.push(`-- pokemon_cardsテーブルの作成とRLS無効化
CREATE TABLE IF NOT EXISTS pokemon_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100) UNIQUE NOT NULL,
  rarity VARCHAR(10) NOT NULL,
  image_url TEXT DEFAULT '/images/ngcard.jpg',
  market_price INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLSを無効化
ALTER TABLE pokemon_cards DISABLE ROW LEVEL SECURITY;

-- 既存データをクリア（必要に応じて）
-- DELETE FROM pokemon_cards;

-- カードデータの挿入
`);

// ヘッダー行をスキップして、データ行を処理
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = line.split(',');
  if (values.length >= 5) {
    const category = escapeSql(values[0]);
    const productCode = escapeSql(values[1]);
    const cardName = escapeSql(values[2]);
    const rank = escapeSql(values[3]);
    const price = parseInt(values[4]?.trim() || '0');
    const rarity = mapRankToRarity(rank);
    
    if (productCode && cardName) {
      const insertSQL = `INSERT INTO pokemon_cards (card_name, product_code, rarity, image_url, market_price, description) 
VALUES ('${cardName}', '${productCode}', '${rarity}', '/images/ngcard.jpg', ${price}, '${category}カード - ${rank}')
ON CONFLICT (product_code) DO UPDATE SET
  card_name = EXCLUDED.card_name,
  rarity = EXCLUDED.rarity,
  market_price = EXCLUDED.market_price,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;`;
      
      sqlStatements.push(insertSQL);
    }
  }
}

// SQLファイルに出力
const sqlContent = sqlStatements.join('\n\n');
const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240625000004_import_pokemon_cards.sql');

// ディレクトリが存在しない場合は作成
const migrationDir = path.dirname(outputPath);
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

fs.writeFileSync(outputPath, sqlContent);

console.log(`SQLファイルを生成しました: ${outputPath}`);
console.log(`処理行数: ${lines.length - 1}行`);
console.log(`挿入レコード数: ${sqlStatements.length - 1}件`);

// また、直接実行用のSQLファイルも生成
const directSqlPath = path.join(__dirname, '..', 'pokemon_cards_import.sql');
fs.writeFileSync(directSqlPath, sqlContent);
console.log(`直接実行用SQLファイル: ${directSqlPath}`);