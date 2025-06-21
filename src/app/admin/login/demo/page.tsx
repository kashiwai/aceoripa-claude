'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function AdminDemoLogin() {
  const router = useRouter()

  const handleDemoLogin = () => {
    // デモモードのCookieを設定
    document.cookie = 'adminDemo=true; path=/; max-age=3600'
    sessionStorage.setItem('adminDemo', 'true')
    toast.success('デモモードでログインしました')
    
    // デモ管理画面へリダイレクト
    router.push('/admin/demo')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-600 mt-2">デモモード</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            デモモードでは管理画面の機能を確認できますが、データの保存はできません。
          </p>
        </div>

        <button
          onClick={handleDemoLogin}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition duration-200"
        >
          デモモードでログイン
        </button>

        <div className="mt-6 text-center">
          <a href="/" className="text-purple-600 hover:text-purple-700 text-sm">
            ← トップページに戻る
          </a>
        </div>
      </div>
    </div>
  )
}