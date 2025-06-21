'use client'

export default function AdminDemoPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        ダッシュボード（デモモード）
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-600">総ユーザー数</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">1,234</p>
          <p className="text-sm text-green-600 mt-2">+12% 前月比</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-600">本日の売上</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">¥89,400</p>
          <p className="text-sm text-green-600 mt-2">+23% 前日比</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-600">アクティブガチャ</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">5</p>
          <p className="text-sm text-gray-600 mt-2">3個が人気</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-600">本日のガチャ回数</h2>
          <p className="text-3xl font-bold text-gray-800 mt-2">456</p>
          <p className="text-sm text-green-600 mt-2">+18% 前日比</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">最近の活動</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">新規ユーザー登録</p>
              <p className="text-sm text-gray-600">user_1234が登録しました</p>
            </div>
            <span className="text-sm text-gray-500">5分前</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">ガチャ実行</p>
              <p className="text-sm text-gray-600">ポケモン151オリパ - SSR当選！</p>
            </div>
            <span className="text-sm text-gray-500">10分前</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">ポイント購入</p>
              <p className="text-sm text-gray-600">¥5,000分のポイントが購入されました</p>
            </div>
            <span className="text-sm text-gray-500">15分前</span>
          </div>
        </div>
      </div>
    </div>
  )
}