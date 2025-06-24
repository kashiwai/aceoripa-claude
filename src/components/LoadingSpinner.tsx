export default function LoadingSpinner({ size = 'default', fullScreen = false }: { size?: 'small' | 'default' | 'large', fullScreen?: boolean }) {
  const sizeClasses = {
    small: 'w-8 h-8 border-2',
    default: 'w-16 h-16 border-4',
    large: 'w-32 h-32 border-8'
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className={`${sizeClasses[size]} border-[#FF0033] border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
          <p className="text-2xl font-bold text-[#FF0033]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-[#FF0033] border-t-transparent rounded-full animate-spin`}></div>
    </div>
  )
}