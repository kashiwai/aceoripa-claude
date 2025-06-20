'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Supabaseのパスワードリセット機能を実装
      // const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      // 仮の成功処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast.success('パスワードリセットメールを送信しました');
    } catch (error) {
      toast.error('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Aceoripa TCG</h1>
          <p className="text-gray-400">パスワードリセット</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          {!isSubmitted ? (
            <>
              <p className="text-gray-300 mb-6">
                登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      送信中...
                    </span>
                  ) : (
                    'リセットメールを送信'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">✉️</div>
              <h2 className="text-2xl font-bold text-white mb-4">メールを送信しました</h2>
              <p className="text-gray-300 mb-8">
                {email} にパスワードリセット用のリンクを送信しました。メールボックスをご確認ください。
              </p>
              <p className="text-sm text-gray-400 mb-8">
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
              ← ログイン画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}