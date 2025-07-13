'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, UserPlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';

export function AuthHeader() {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 shadow-xl sticky top-0 z-50">
      <div className="w-full px-2 sm:px-3">
        <div className="flex items-center justify-between h-12 sm:h-16 px-1 sm:px-0">
          {/* ロゴ */}
          <Link href="/" className="flex items-center">
            <span className="text-base sm:text-2xl font-black text-white tracking-tight">ACEORIPA</span>
            <span className="text-[6px] sm:text-xs font-bold text-white bg-red-700 px-1 sm:px-2 py-0 sm:py-0.5 rounded-full ml-0.5 sm:ml-2">ONLINE</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/gacha" className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-full font-bold enhanced-button pulse-button shadow-lg">
              <SparklesIcon className="w-5 h-5" />
              <span>ガチャ</span>
            </Link>
            {!user && (
              <>
                <Link href="/auth/login" className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-bold enhanced-button shadow-lg">
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>ログイン</span>
                </Link>
                <Link href="/auth/signup" className="flex items-center space-x-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-4 py-2 rounded-full font-bold enhanced-button gradient-button shadow-lg">
                  <UserPlusIcon className="w-5 h-5" />
                  <span>新規登録</span>
                </Link>
              </>
            )}
          </nav>

          {/* ユーザーメニュー & モバイルメニューボタン */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user.email?.split('@')[0]}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* ドロップダウンメニュー */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                    <Link
                      href="/mypage"
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      マイページ
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      設定
                    </Link>
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                {/* デスクトップではナビゲーションに統合 */}
              </div>
            )}
            
            {/* モバイル用ボタン */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:hidden">
              <Link
                href="/gacha"
                className="flex items-center space-x-1 bg-yellow-400 hover:bg-yellow-300 text-black px-3 sm:px-3 py-1.5 sm:py-1.5 rounded-full font-bold text-xs sm:text-xs transition-all transform hover:scale-105 shadow-lg min-h-[36px]"
              >
                <SparklesIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>ガチャ</span>
              </Link>
              {!user && (
                <>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white px-3 sm:px-3 py-1.5 sm:py-1.5 rounded-full font-bold text-xs sm:text-xs transition-all transform hover:scale-105 shadow-lg min-h-[36px] flex items-center"
                  >
                    新規登録
                  </Link>
                  <Link
                    href="/auth/login"
                    className="bg-white hover:bg-gray-100 text-black px-3 sm:px-3 py-1.5 sm:py-1.5 rounded-full font-bold text-xs sm:text-xs transition-all transform hover:scale-105 shadow-lg min-h-[36px] flex items-center"
                  >
                    ログイン
                  </Link>
                </>
              )}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-1 sm:p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                {showMobileMenu ? (
                  <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                ) : (
                  <Bars3Icon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* モバイルメニュー */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 top-10 sm:top-16 bg-black/95 z-50 overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            {/* ガチャボタン（最も目立つ） */}
            <Link
              href="/gacha"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center justify-center space-x-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-6 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 shadow-2xl"
            >
              <SparklesIcon className="w-8 h-8" />
              <span>ガチャを引く</span>
              <span className="text-sm bg-red-600 text-white px-2 py-1 rounded-full animate-pulse">HOT</span>
            </Link>
            
            {!user ? (
              <>
                {/* ログインボタン */}
                <Link
                  href="/auth/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-gray-800 px-6 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                >
                  <ArrowRightOnRectangleIcon className="w-7 h-7" />
                  <span>ログイン</span>
                </Link>
                
                {/* 新規登録ボタン */}
                <Link
                  href="/auth/signup"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                >
                  <UserPlusIcon className="w-7 h-7" />
                  <span>新規登録</span>
                  <span className="text-xs bg-white/30 px-2 py-1 rounded-full">今なら特典付き</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/mypage"
                  onClick={() => setShowMobileMenu(false)}
                  className="block bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all"
                >
                  マイページ
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="block bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all"
                >
                  設定
                </Link>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    signOut();
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all"
                >
                  ログアウト
                </button>
              </>
            )}
            
          </div>
        </div>
      )}
    </header>
  );
}