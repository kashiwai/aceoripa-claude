import AdminDemoLayout from '../demo-layout'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminDemoLayout>{children}</AdminDemoLayout>
}