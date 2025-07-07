const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  console.log('Checking pokemon_cards table...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Get total count
  const { count, error: countError } = await supabase
    .from('pokemon_cards')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Count error:', countError);
    return;
  }
  
  console.log('\nTotal cards in database:', count);
  
  // Get sample data
  const { data, error } = await supabase
    .from('pokemon_cards')
    .select('id, card_name, rarity, product_code')
    .limit(10);
    
  if (error) {
    console.error('Select error:', error);
    return;
  }
  
  console.log('\nSample cards:');
  if (data && data.length > 0) {
    data.forEach(card => {
      console.log(`- ${card.card_name} (${card.rarity}) - ${card.product_code}`);
    });
  } else {
    console.log('No cards found in database!');
  }
  
  // Get rarity counts
  const { data: rarityData } = await supabase
    .from('pokemon_cards')
    .select('rarity');
    
  if (rarityData && rarityData.length > 0) {
    const counts = rarityData.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    }, {});
    console.log('\nCards by rarity:', counts);
  }
}

checkData().then(() => process.exit(0)).catch(console.error);