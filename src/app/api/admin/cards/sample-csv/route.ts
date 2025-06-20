import { NextResponse } from 'next/server'

export async function GET() {
  // CSVサンプルデータ（新フォーマット）
  const sampleData = [
    {
      card_name: 'ピカチュウ',
      product_code: 'PKM151-025',
      rarity: 'SSR',
      product_points: '50000',
      card_image_url: 'https://example.com/images/pikachu.jpg',
      card_image_filename: 'pikachu_025.jpg'
    },
    {
      card_name: 'リザードン',
      product_code: 'PKM151-006',
      rarity: 'SSR',
      product_points: '100000',
      card_image_url: 'https://example.com/images/charizard.jpg',
      card_image_filename: 'charizard_006.jpg'
    },
    {
      card_name: 'フシギダネ',
      product_code: 'PKM151-001',
      rarity: 'SR',
      product_points: '15000',
      card_image_url: '',
      card_image_filename: 'bulbasaur_001.jpg'
    },
    {
      card_name: 'ゼニガメ',
      product_code: 'PKM151-007',
      rarity: 'SR',
      product_points: '12000',
      card_image_url: '',
      card_image_filename: 'squirtle_007.jpg'
    },
    {
      card_name: 'ポケモンボール',
      product_code: 'PKM151-164',
      rarity: 'R',
      product_points: '800',
      card_image_url: 'https://example.com/images/pokeball.jpg',
      card_image_filename: ''
    },
    {
      card_name: 'オーキド博士の研究',
      product_code: 'PKM151-190',
      rarity: 'R',
      product_points: '500',
      card_image_url: 'https://example.com/images/professor-oak.jpg',
      card_image_filename: ''
    },
    {
      card_name: '基本電気エネルギー',
      product_code: 'PKM151-232',
      rarity: 'N',
      product_points: '50',
      card_image_url: '',
      card_image_filename: 'electric_energy_232.jpg'
    },
    {
      card_name: 'コラッタ',
      product_code: 'PKM151-019',
      rarity: 'N',
      product_points: '100',
      card_image_url: '',
      card_image_filename: 'rattata_019.jpg'
    }
  ]

  // CSVヘッダー
  const headers = Object.keys(sampleData[0])
  
  // CSV形式に変換
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => 
      headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
    )
  ].join('\n')

  // レスポンスを返す
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pokemon_cards_sample.csv"',
    },
  })
}