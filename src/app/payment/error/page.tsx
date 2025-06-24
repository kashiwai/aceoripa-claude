'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '@/components/LoadingSpinner';

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || '決済処理中にエラーが発生しました';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          決済エラー
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            決済処理が正常に完了しませんでした。<br />
            お手数ですが、もう一度お試しください。
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/payment"
            className="block w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            もう一度試す
          </Link>
          
          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300 transition"
          >
            ホームに戻る
          </Link>
        </div>
        
        <p className="mt-6 text-xs text-gray-500">
          問題が解決しない場合は、お問い合わせください。
        </p>
      </div>
    </div>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen size="large" />}>
      <ErrorContent />
    </Suspense>
  );
}