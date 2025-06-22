import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Admin認証チェック（一時的に無効化）
  // const adminEmail = process.env.ADMIN_EMAIL || 'admin@aceoripa.com'
  // if (!user || user.email !== adminEmail) {
  //   redirect('/admin/login')
  // }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen">
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                管理画面
              </h1>
              <p className="text-gray-600 text-sm mt-1">Aceoripa ポケモンカード オリパサイト</p>
            </div>
          </div>
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}