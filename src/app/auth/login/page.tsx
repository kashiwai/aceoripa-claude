'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ロゴ */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF0033] to-[#FF6B6B]">
            ACEORIPA
          </h1>
          <p className="mt-2 text-gray-400">ログイン</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#FF0033] focus:outline-none transition"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] text-white font-bold py-3 px-4 rounded-xl hover:scale-105 transform transition shadow-lg disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        {/* テストアカウント情報 */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <p className="text-sm font-bold text-[#FF0033] mb-2">テストアカウント:</p>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Email: test@aceoripa.com</div>
            <div>Password: test123</div>
            <button 
              onClick={() => {
                setEmail('test@aceoripa.com')
                setPassword('test123')
              }}
              className="mt-2 text-xs bg-[#FF0033] text-white px-3 py-1 rounded hover:bg-[#FF6B6B] transition"
            >
              テストアカウントでログイン
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400">
            アカウントをお持ちでない方は
            <Link href="/auth/register" className="text-[#FF0033] hover:text-[#FF6B6B] ml-1 font-bold">
              アカウント作成
            </Link>
          </p>
        </div>
        
        {/* ホームに戻る */}
        <div className="text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}