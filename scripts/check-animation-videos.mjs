import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAnimationVideos() {
  console.log('📹 Checking gacha_animation_library table...\n')

  const { data, error } = await supabase
    .from('gacha_animation_library')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('❌ Error fetching animation videos:', error)
    console.log('\n⚠️  The gacha_animation_library table does not exist or has an error!')
    console.log('   This is why animations are not playing.\n')
    return
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No animation videos found in gacha_animation_library table!')
    console.log('   The table exists but is empty.')
    console.log('   This is why animations are not playing.\n')
    return
  }

  console.log(`✅ Found ${data.length} animation videos:\n`)

  // Show first row schema
  if (data[0]) {
    console.log('Table columns:', Object.keys(data[0]).join(', '), '\n')
    console.log('First row sample:')
    console.log(JSON.stringify(data[0], null, 2), '\n')
  }

  // Group by rarity
  const byRarity = {}
  data.forEach(item => {
    if (!byRarity[item.rarity]) {
      byRarity[item.rarity] = []
    }
    byRarity[item.rarity].push(item)
  })

  // Display organized by rarity
  for (const [rarity, videos] of Object.entries(byRarity)) {
    console.log(`\n${rarity} Rarity:`)
    videos.forEach(v => {
      console.log(`  - ${v.animation_type || v.type || 'unknown'}: ${v.video_url}`)
    })
  }
}

checkAnimationVideos().catch(console.error)
