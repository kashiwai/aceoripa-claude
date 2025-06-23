'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // 紙吹雪エフェクト
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // 注文詳細を取得
    fetchOrderDetails();

    return () => clearInterval(interval);
  }, []);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      const response = await fetch(`/api/payment/order/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* 成功アイコン */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* メッセージ */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            決済完了！
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            ポイントの購入が完了しました
          </p>

          {/* 購入詳細 */}
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">注文番号</span>
                  <span className="font-medium">{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">購入ポイント</span>
                  <span className="font-medium text-lg">
                    {orderDetails.points?.toLocaleString()}ポイント
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">支払金額</span>
                  <span className="font-medium">
                    ¥{orderDetails.amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/gacha')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              ガチャを回す
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </button>
            
            <button
              onClick={() => router.push('/mypage')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              マイページへ
            </button>
          </div>

          {/* 追加メッセージ */}
          <p className="mt-6 text-sm text-gray-500">
            購入いただきありがとうございます！<br />
            ポイントはすぐにご利用いただけます。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}