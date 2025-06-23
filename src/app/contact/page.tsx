'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // フォーム送信ロジック（将来実装）
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        {/* ヘッダー */}
        <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <Link href="/" className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="ml-4 text-3xl font-black text-[#FF0033]">お問い合わせ</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-green-800 mb-4">送信完了</h2>
            <p className="text-lg text-green-700 mb-6">
              お問い合わせありがとうございました。<br/>
              3営業日以内にご回答いたします。
            </p>
            <Link href="/" className="bg-[#FF0033] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#FF6B6B] transition">
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-[#FF0033]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="text-[#FF0033] hover:text-[#FF6B6B] transition">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="ml-4 text-3xl font-black text-[#FF0033]">お問い合わせ</h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-[#FF0033] mb-4">お問い合わせ</h2>
          <p className="text-lg text-gray-600">
            ご質問・ご要望などお気軽にお問い合わせください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0033] focus:border-transparent"
              placeholder="山田太郎"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0033] focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
              お問い合わせ種別 <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0033] focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="gacha">ガチャについて</option>
              <option value="payment">決済について</option>
              <option value="account">アカウントについて</option>
              <option value="bug">不具合報告</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
              お問い合わせ内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0033] focus:border-transparent resize-none"
              placeholder="お問い合わせ内容をご記入ください"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF0033] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#FF6B6B] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </form>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">その他のサポート</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📧 メール: support@aceoripa.com</p>
            <p>📞 電話: 03-1234-5678 (平日 10:00-18:00)</p>
            <p>💬 よくある質問は<Link href="/faq" className="text-[#FF0033] hover:underline">FAQページ</Link>をご確認ください</p>
          </div>
        </div>
      </div>
    </div>
  )
}