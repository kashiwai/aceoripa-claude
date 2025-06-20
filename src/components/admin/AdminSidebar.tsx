'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  UsersIcon, 
  CubeIcon, 
  CreditCardIcon,
  TruckIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: HomeIcon },
  { name: 'ユーザー管理', href: '/admin/users', icon: UsersIcon },
  { name: 'ガチャ管理', href: '/admin/gacha', icon: CubeIcon },
  { name: 'カード管理', href: '/admin/cards', icon: CreditCardIcon },
  { name: '発送管理', href: '/admin/shipments', icon: TruckIcon },
  { name: 'お知らせ管理', href: '/admin/announcements', icon: SpeakerWaveIcon },
  { name: '売上統計', href: '/admin/sales', icon: ChartBarIcon },
  { name: 'システム設定', href: '/admin/settings', icon: CogIcon },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center bg-gray-800">
        <h1 className="text-xl font-bold text-white">ACEorIPA Admin</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-700 p-4">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          ユーザー画面へ
        </Link>
      </div>
    </div>
  )
}