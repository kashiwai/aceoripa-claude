import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'aceoripa-pokemon-gacha',
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
    
    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'ERROR', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      }, 
      { status: 500 }
    )
  }
}