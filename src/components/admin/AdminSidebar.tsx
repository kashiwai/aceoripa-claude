'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'ダッシュボード', href: '/admin' },
  { name: 'ユーザー管理', href: '/admin/users' },
  { name: 'ガチャ管理', href: '/admin/gacha' },
  { name: 'カード管理', href: '/admin/cards' },
  { name: 'バナー管理', href: '/admin/banners' },
  { name: '決済管理', href: '/admin/payments' },
  { name: 'AI生成管理', href: '/admin/ai-generator' },
  { name: 'お知らせ管理', href: '/admin/announcements' },
  { name: '売上統計', href: '/admin/sales' },
  { name: 'システム設定', href: '/admin/settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{width: '280px', height: '100vh'}}>
      <Link href="/admin" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4 fw-bold">ACEORIPA Admin</span>
      </Link>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.name} className="nav-item">
              <Link
                href={item.href}
                className={`nav-link ${isActive ? 'active' : 'text-white'}`}
              >
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
      <hr />
      <div>
        <Link href="/" className="nav-link text-white">
          ← ユーザー画面へ戻る
        </Link>
      </div>
    </div>
  )
}