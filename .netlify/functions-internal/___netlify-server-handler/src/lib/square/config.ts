export const SQUARE_CONFIG = {
  // Square Sandbox環境設定
  applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
  locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!,
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox',
  
  // Webhook設定
  webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
  
  // ポイントパッケージ設定
  pointPackages: [
    { points: 150, price: 160, bonus: 0 },
    { points: 500, price: 500, bonus: 50 },
    { points: 1000, price: 1000, bonus: 150 },
    { points: 3000, price: 3000, bonus: 500 },
    { points: 5000, price: 5000, bonus: 1000 },
    { points: 10000, price: 10000, bonus: 2500 }
  ]
}

// 価格をSquare用の最小単位（円）に変換
export function toSquareAmount(yen: number): bigint {
  return BigInt(yen * 100)
}

// Squareの最小単位から円に変換
export function fromSquareAmount(amount: bigint): number {
  return Number(amount) / 100
}