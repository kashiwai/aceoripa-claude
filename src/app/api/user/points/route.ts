import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // 一時的にサンプルデータを返す（認証なし）
    const samplePoints = {
      free_points: 500,
      paid_points: 2500,
      total_points: 3000
    }
    
    return NextResponse.json({ points: samplePoints })
  } catch (error) {
    console.error('Error fetching user points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}