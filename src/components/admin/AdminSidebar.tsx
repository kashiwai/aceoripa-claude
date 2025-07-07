'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

const navigation = [
  { name: 'ダッシュボード', href: '/admin' },
  { name: 'ユーザー管理', href: '/admin/users' },
  { name: 'ガチャ管理', href: '/admin/gacha' },
  { name: 'カード管理', href: '/admin/cards' },
  { name: '上位カード価格管理', href: '/admin/top-cards-price' },
  { name: '演出管理', href: '/admin/effects' },
  { name: 'バナー管理', href: '/admin/banners' },
  { name: '決済管理', href: '/admin/payments' },
  { name: 'AI生成管理', href: '/admin/ai-generator' },
  { name: 'お知らせ管理', href: '/admin/announcements' },
  { name: '売上統計', href: '/admin/sales' },
  { name: 'システム設定', href: '/admin/settings' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    // Cookieから管理者情報を取得
    const cookies = document.cookie.split(';')
    const adminSessionCookie = cookies.find(c => c.trim().startsWith('admin_session='))
    if (adminSessionCookie) {
      try {
        const session = JSON.parse(decodeURIComponent(adminSessionCookie.split('=')[1]))
        setAdminUser(session)
      } catch (e) {}
    }
  }, [])

  const handleLogout = () => {
    // Cookieを削除
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    toast.success('ログアウトしました')
    router.push('/admin/login')
  }

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
      <div className="dropdown">
        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
          <strong>{adminUser?.username || 'Admin'}</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser">
          <li><span className="dropdown-item-text text-muted">{adminUser?.role || 'admin'}</span></li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <Link href="/admin/system" className="dropdown-item">
              <i className="bi bi-gear me-2"></i>システム設定
            </Link>
          </li>
          <li>
            <Link href="/" className="dropdown-item">
              <i className="bi bi-house me-2"></i>ユーザー画面へ
            </Link>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button onClick={handleLogout} className="dropdown-item text-danger">
              <i className="bi bi-box-arrow-right me-2"></i>ログアウト
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}