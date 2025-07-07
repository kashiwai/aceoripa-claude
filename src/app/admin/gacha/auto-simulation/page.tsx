import dynamic from 'next/dynamic'

const AutoSimulationPage = dynamic(() => import('./ImprovedUI'), {
  ssr: false,
  loading: () => (
    <div className="container-fluid">
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">読み込み中...</p>
        </div>
      </div>
    </div>
  )
})

export default function Page() {
  return <AutoSimulationPage />
}