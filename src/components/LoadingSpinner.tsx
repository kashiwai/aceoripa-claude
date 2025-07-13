export default function LoadingSpinner({ size = 'default', fullScreen = false }: { size?: 'small' | 'default' | 'large', fullScreen?: boolean }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-16 h-16',
    large: 'w-32 h-32'
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-red-50 to-white bg-opacity-95 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center">
          <div className="relative mx-auto mb-6">
            <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
            <div className={`${sizeClasses[size]} border-4 border-[#FF0033] border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
            <div className={`${sizeClasses[size]} border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin absolute top-1 left-1 opacity-60`} style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
            
            {/* キラキラエフェクト */}
            <div className="absolute inset-0 animate-twinkle">
              <div className="absolute top-2 right-2 w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#FF0033] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-1/2 left-0 w-1 h-1 bg-[#FF6B6B] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-black text-[#FF0033] neon-glow animate-pulse">ロード中...</p>
            <p className="text-sm text-gray-600 animate-pulse" style={{animationDelay: '0.3s'}}>素敵なカードを準備しています</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}></div>
        <div className={`${sizeClasses[size]} border-4 border-[#FF0033] border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
      </div>
    </div>
  )
}