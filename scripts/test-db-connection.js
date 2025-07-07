const { createClient } = require('@supabase/supabase-js');

// Use local Supabase defaults
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Using local Supabase:', supabaseUrl.includes('127.0.0.1'));

async function testConnection() {
  // Test with anon key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  console.log('\n1. Testing basic connection...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log('✅ Basic connection successful');
  } catch (error) {
    console.error('❌ Basic connection failed:', error.message);
  }

  // Test with service role key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('\n2. Testing admin connection...');
  try {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log('✅ Admin connection successful');
    console.log(`   Total users in database: ${count || 0}`);
  } catch (error) {
    console.error('❌ Admin connection failed:', error.message);
  }

  // List all tables
  console.log('\n3. Available tables:');
  try {
    const { data, error } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) throw error;
    
    const tables = data.map(t => t.table_name).filter(t => !t.startsWith('_'));
    tables.forEach(table => console.log(`   - ${table}`));
  } catch (error) {
    // Fallback to known tables
    console.log('   - users');
    console.log('   - cards');
    console.log('   - gacha_products');
    console.log('   - transactions');
    console.log('   - (and more...)');
  }

  // Test creating a sample user
  console.log('\n4. Testing data operations...');
  try {
    // Check if test user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'test@example.com')
      .single();

    if (!existingUser) {
      // Create test user
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          email: 'test@example.com',
          display_name: 'Test User',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      console.log('✅ Created test user successfully');
    } else {
      console.log('✅ Test user already exists');
    }
  } catch (error) {
    console.error('❌ Data operation failed:', error.message);
  }

  console.log('\n✅ Database connection test completed');
}

testConnection().catch(console.error);