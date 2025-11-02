'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState({ free: 0, paid: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/points');
        if (response.ok) {
          const data = await response.json();
          setUserPoints({
            free: data.free_points,
            paid: data.paid_points,
            total: data.free_points + data.paid_points
          });
        }
      } catch (error) {
        console.error('Failed to fetch points:', error);
      }
    };
    
    fetchUserPoints();
  }, [user]);

  useEffect(() => {
    const fetchPaymentPlans = async () => {
      try {
        const response = await fetch('/api/payment/packages');
        if (response.ok) {
          const data = await response.json();
          setPaymentPlans(data.packages || []);
        }
      } catch (error) {
        console.error('Failed to fetch payment plans:', error);
      }
    };

    fetchPaymentPlans();
  }, []);

  const handlePurchase = async (plan: any) => {
    // スクリプトの読み込みを待たずに進める
    setSelectedPlan(plan.id);
    setIsProcessing(true);
    
    try {
      // 決済セッション作成
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // クッキーを含める
        body: JSON.stringify({
          packageId: plan.id,
          amount: plan.price,
          points: plan.points + plan.bonus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('決済セッション作成エラー:', errorData);
        
        // 401エラーの場合は再ログインを促す
        if (response.status === 401) {
          toast.error('セッションが切れました。再度ログインしてください。');
          router.push('/auth/login?redirect=/payment');
          return;
        }
        
        throw new Error(errorData.error || '決済セッションの作成に失敗しました');
      }

      const { sessionId, orderId } = await response.json();
      
      // チェックアウトページへリダイレクト
      router.push(`/payment/checkout?package=${plan.id}&order=${orderId}`)
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error instanceof Error ? error.message : '決済処理の開始に失敗しました');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (orderId: string, plan: any) => {
    try {
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        toast.success(`${plan.points + plan.bonus}ポイントを購入しました！`);
        router.push('/gacha');
      } else {
        throw new Error('ポイント付与処理に失敗しました');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      toast.error('ポイント付与処理中にエラーが発生しました');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">ポイント購入</h1>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">💎</span>
              <span>{userPoints.total.toLocaleString()}</span>
            </div>
          </div>
        </header>

      <div className="container mx-auto px-4 py-8">
        {/* 現在のポイント */}
        <section className="mb-8 bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">現在の所持ポイント</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">無料ポイント</p>
              <p className="text-2xl font-bold">{userPoints.free.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400">有料ポイント</p>
              <p className="text-2xl font-bold">{userPoints.paid.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* 購入プラン */}
        <section>
          <h2 className="text-xl font-bold mb-6">ポイント購入プラン</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePurchase(plan)}
                disabled={isProcessing}
                className={`bg-gray-800 rounded-xl p-6 text-left hover:bg-gray-700 transition-colors relative overflow-hidden ${
                  plan.popular ? 'ring-2 ring-yellow-400' : ''
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {plan.bonus > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    +{plan.bonus.toLocaleString()}ボーナス
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-3xl font-bold">
                    {(plan.points + plan.bonus).toLocaleString()}
                    <span className="text-lg text-gray-400 ml-1">ポイント</span>
                  </p>
                  {plan.bonus > 0 && (
                    <p className="text-gray-400 text-sm mt-1">
                      ({plan.points.toLocaleString()} + {plan.bonus.toLocaleString()}ボーナス)
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">
                    ¥{plan.price.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-sm">
                    ¥{(plan.price / (plan.points + plan.bonus)).toFixed(2)}/pt
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 注意事項 */}
        <section className="mt-8 text-center text-gray-400 text-sm">
          <p>※ 購入したポイントの払い戻しはできません</p>
          <p>※ 無料ポイントから優先的に消費されます</p>
        </section>

        {/* 戻るボタン */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#FF0033] to-[#FF6B6B] hover:scale-105 rounded-lg font-bold transition-transform text-white"
          >
            🏠 TOPに戻る
          </Link>
          <Link
            href="/gacha"
            className="inline-block px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-colors"
          >
            🎰 ガチャに戻る
          </Link>
        </div>
      </div>
      
      {/* 処理中のローディング表示 */}
      {isProcessing && <LoadingSpinner fullScreen size="large" />}
    </main>
  );
}