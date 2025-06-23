import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Script from 'next/script'

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
    <>
      <Script 
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
        rel="stylesheet"
      />
      <div className="d-flex">
        <AdminSidebar />
        <main className="flex-fill">
          <div className="container-fluid p-4">
            {children}
          </div>
        </main>
      </div>
    </>
  )
}