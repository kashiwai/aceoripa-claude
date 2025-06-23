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
  ArrowLeftIcon,
  PhotoIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: HomeIcon },
  { name: 'ユーザー管理', href: '/admin/users', icon: UsersIcon },
  { name: 'ガチャ管理', href: '/admin/gacha', icon: CubeIcon },
  { name: 'カード管理', href: '/admin/cards', icon: CreditCardIcon },
  { name: '決済管理', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'AI生成管理', href: '/admin/ai-generator', icon: PhotoIcon },
  { name: '動画演出管理', href: '/admin/video-effects', icon: VideoCameraIcon },
  { name: '発送管理', href: '/admin/shipments', icon: TruckIcon },
  { name: 'お知らせ管理', href: '/admin/announcements', icon: SpeakerWaveIcon },
  { name: '売上統計', href: '/admin/sales', icon: ChartBarIcon },
  { name: 'システム設定', href: '/admin/settings', icon: CogIcon },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-lg border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">ACEORIPA</h1>
          <p className="text-xs text-gray-500 mt-1">管理画面</p>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                ${isActive 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-3">
        <Link
          href="/"
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          ユーザー画面へ戻る
        </Link>
      </div>
    </div>
  )
}