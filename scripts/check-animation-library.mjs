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

async function checkLibrary() {
  console.log('🔍 Checking gacha_animation_library table...\n')

  const { data, error } = await supabase
    .from('gacha_animation_library')
    .select('*')
    .eq('is_active', true)
    .order('rarity', { ascending: true })
    .order('phase', { ascending: true })

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  if (data && data.length > 0) {
    console.log(`✅ Found ${data.length} active videos:\n`)
    data.forEach(video => {
      console.log(`📹 ${video.rarity} / ${video.phase}`)
      console.log(`   URL: ${video.video_url}`)
      console.log(`   Provider: ${video.provider}`)
      console.log(`   Created: ${new Date(video.created_at).toLocaleString('ja-JP')}`)
      console.log('')
    })
  } else {
    console.log('⚠️  No active videos found in library')
  }
}

checkLibrary().catch(console.error)
