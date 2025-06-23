import { NextResponse } from 'next/server'

export async function GET() {
  // CSVテンプレートの内容（日本語ヘッダー対応）
  const csvContent = `カード名,商品コード,レアリティ,還元pt,カード画像URL,ローカル画像パス
リザードンex SAR,PKM-151-001,SS,50000,https://example.com/charizard-ex.jpg,
ミュウex SAR,PKM-151-002,SS,30000,https://example.com/mew-ex.jpg,
ピカチュウex SAR,PKM-151-003,SS,25000,,pikachu-ex.jpg
フシギバナex SR,PKM-SV-001,S,10000,,fushigibana-ex.jpg
カメックスex SR,PKM-SV-002,S,8000,,kamex-ex.jpg
フリーザーex SR,PKM-151-010,S,5000,,freezer-ex.jpg
サンダーex SR,PKM-151-011,S,5000,,thunder-ex.jpg
ファイヤーex SR,PKM-151-012,S,5000,,fire-ex.jpg
ニドクイン,PKM-151-020,A,1000,,nidoqueen.jpg
ニドキング,PKM-151-021,A,1000,,nidoking.jpg
ウインディ,PKM-151-022,A,800,,windie.jpg
ゴルダック,PKM-151-023,B,300,,golduck.jpg
アラカザム,PKM-151-024,B,300,,alakazam.jpg
フシギダネ,PKM-151-050,B,200,,fushigidane.jpg
ヒトカゲ,PKM-151-051,C,100,,hitokage.jpg
ゼニガメ,PKM-151-052,C,100,,zenigame.jpg
ピカチュウ,PKM-151-053,C,100,,pikachu.jpg
ニャース,PKM-151-054,C,50,,nyarth.jpg
コダック,PKM-151-055,C,50,,koduck.jpg`

  // BOMを追加（Excelで開いた時の文字化け防止）
  const BOM = '\uFEFF'
  const csvWithBOM = BOM + csvContent

  // レスポンスを返す
  return new NextResponse(csvWithBOM, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pokemon_cards_template.csv"',
    },
  })
}