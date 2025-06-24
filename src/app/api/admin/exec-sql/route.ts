import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { query } = await request.json()
    
    if (!query) {
      return NextResponse.json({ error: 'SQL query is required' }, { status: 400 })
    }

    // SQLクエリを実行
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { query })
    
    if (error) {
      console.error('SQL execution error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, success: true })
  } catch (error) {
    console.error('SQL execution error:', error)
    return NextResponse.json({ error: 'Failed to execute SQL' }, { status: 500 })
  }
}