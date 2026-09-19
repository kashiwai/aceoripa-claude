import AdminSidebar from '@/components/admin/AdminSidebar'
import Script from 'next/script'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 管理画面認証はMiddleware (src/middleware.ts) で処理
  // admin_session Cookieの存在と有効期限（24時間）をチェック
  // 未認証の場合は /admin/login へ自動リダイレクト

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
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css"
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