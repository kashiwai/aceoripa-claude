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

async function checkGachaAnimations() {
  console.log('🎬 Checking gacha animation library...\n')

  const { data, error } = await supabase
    .from('gacha_animation_library')
    .select('*')
    .eq('is_active', true)
    .order('rarity', { ascending: true })
    .order('phase', { ascending: true })

  if (error) {
    console.error('❌ Error fetching animations:', error)
    process.exit(1)
  }

  console.log(`Found ${data.length} active animations:\n`)

  const byRarity = {}
  data.forEach(item => {
    if (!byRarity[item.rarity]) {
      byRarity[item.rarity] = { intro: [], reveal: [] }
    }
    if (item.phase === 'intro') {
      byRarity[item.rarity].intro.push(item.video_url)
    } else if (item.phase === 'reveal') {
      byRarity[item.rarity].reveal.push(item.video_url)
    }
  })

  Object.keys(byRarity).forEach(rarity => {
    console.log(`${rarity} Rarity:`)
    console.log(`  Intro videos: ${byRarity[rarity].intro.length}`)
    byRarity[rarity].intro.forEach((url, i) => {
      console.log(`    ${i+1}. ${url}`)
    })
    console.log(`  Reveal videos: ${byRarity[rarity].reveal.length}`)
    byRarity[rarity].reveal.forEach((url, i) => {
      console.log(`    ${i+1}. ${url}`)
    })
    console.log('')
  })

  console.log('📊 Summary:')
  Object.keys(byRarity).forEach(rarity => {
    const introCount = byRarity[rarity].intro.length
    const revealCount = byRarity[rarity].reveal.length
    console.log(`  ${rarity}: ${introCount} intro + ${revealCount} reveal = ${introCount + revealCount} total`)
  })
}

checkGachaAnimations().catch(console.error)
