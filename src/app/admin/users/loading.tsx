import LoadingSpinner from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">読み込み中...</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner size="large" />
      </main>
    </div>
  )
}