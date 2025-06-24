import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const ngcardPath = path.join(process.cwd(), 'public', 'images', 'ngcard.jpg')
    const pokemonPath = path.join(process.cwd(), 'public', 'images', 'pokemon', '003_アセロラ(エクバ) PSA10_PK-0003.jpg')
    
    const ngcardExists = fs.existsSync(ngcardPath)
    const pokemonExists = fs.existsSync(pokemonPath)
    
    let ngcardStats = null
    let pokemonStats = null
    let ngcardBuffer = null
    let pokemonBuffer = null
    
    if (ngcardExists) {
      ngcardStats = fs.statSync(ngcardPath)
      ngcardBuffer = fs.readFileSync(ngcardPath)
    }
    
    if (pokemonExists) {
      pokemonStats = fs.statSync(pokemonPath)
      pokemonBuffer = fs.readFileSync(pokemonPath)
    }
    
    return NextResponse.json({
      ngcard: {
        exists: ngcardExists,
        path: ngcardPath,
        size: ngcardStats?.size,
        modified: ngcardStats?.mtime,
        firstBytes: ngcardBuffer ? Array.from(ngcardBuffer.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ') : null,
        isValidJPEG: ngcardBuffer ? (ngcardBuffer[0] === 0xFF && ngcardBuffer[1] === 0xD8) : false
      },
      pokemon: {
        exists: pokemonExists,
        path: pokemonPath,
        size: pokemonStats?.size,
        modified: pokemonStats?.mtime,
        firstBytes: pokemonBuffer ? Array.from(pokemonBuffer.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ') : null,
        isValidJPEG: pokemonBuffer ? (pokemonBuffer[0] === 0xFF && pokemonBuffer[1] === 0xD8) : false
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Check failed',
      message: error.message 
    }, { status: 500 })
  }
}