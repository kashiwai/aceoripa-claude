'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import FincodePaymentForm from '@/components/payment/FincodePaymentForm';
import { FINCODE_CONFIG } from '@/lib/fincode/config';
import { CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const packageId = searchParams.get('package');
  const orderId = searchParams.get('order');
  
  const [isLoading, setIsLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [packageInfo, setPackageInfo] = useState<any>(null);

  useEffect(() => {
    if (!packageId || !orderId) {
      router.push('/payment');
      return;
    }

    // パッケージ情報を取得
    const pkg = FINCODE_CONFIG.pointPackages.find(p => p.id === packageId);
    if (pkg) {
      setPackageInfo(pkg);
    }

    // 保存されたカード情報を取得
    fetchSavedCards();
  }, [packageId, orderId, router]);

  const fetchSavedCards = async () => {
    try {
      const response = await fetch('/api/payment/cards');
      if (response.ok) {
        const data = await response.json();
        setSavedCards(data.cards || []);
        
        // 保存されたカードがない場合は新規カードフォームを表示
        if (!data.cards || data.cards.length === 0) {
          setShowNewCardForm(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved cards:', error);
    }
  };

  // 保存されたカードでワンクリック決済
  const handleQuickPayment = async (cardId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payment/quick-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          cardId,
          packageId,
          amount: packageInfo.price,
          points: packageInfo.points + packageInfo.bonus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '決済に失敗しました');
      }

      const result = await response.json();
      
      if (result.requires3DSecure) {
        // 3Dセキュア認証が必要な場合
        window.location.href = result.authUrl;
      } else {
        // 決済完了
        toast.success('決済が完了しました！');
        router.push('/payment/success?order=' + orderId);
      }
    } catch (error: any) {
      console.error('Quick payment error:', error);
      toast.error(error.message || '決済処理中にエラーが発生しました');
      setIsLoading(false);
    }
  };

  // 新しいカードで決済
  const handleNewCardPayment = async (cardData: any) => {
    setIsLoading(true);
    
    try {
      // カード情報を使用して決済処理
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          cardNumber: cardData.cardNumber,
          cardholderName: cardData.cardholderName,
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          cvv: cardData.cvv,
          saveCard: cardData.saveCard,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '決済に失敗しました');
      }

      const result = await response.json();
      
      if (result.requires3DSecure) {
        // 3Dセキュア認証が必要な場合
        // 3DSフォームを作成して送信
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.authUrl;
        
        const paReqInput = document.createElement('input');
        paReqInput.type = 'hidden';
        paReqInput.name = 'PaReq';
        paReqInput.value = result.paReq;
        form.appendChild(paReqInput);
        
        const termUrlInput = document.createElement('input');
        termUrlInput.type = 'hidden';
        termUrlInput.name = 'TermUrl';
        termUrlInput.value = result.termUrl;
        form.appendChild(termUrlInput);
        
        const mdInput = document.createElement('input');
        mdInput.type = 'hidden';
        mdInput.name = 'MD';
        mdInput.value = orderId;
        form.appendChild(mdInput);
        
        document.body.appendChild(form);
        form.submit();
      } else {
        // 決済完了
        toast.success('決済が完了しました！');
        router.push('/payment/success?order=' + orderId);
      }
    } catch (error: any) {
      console.error('New card payment error:', error);
      toast.error(error.message || '決済処理中にエラーが発生しました');
      setIsLoading(false);
    }
  };

  if (!packageInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">決済手続き</h1>
          </div>

          <div className="p-6">
            {/* 購入内容 */}
            <div className="mb-8 bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">購入内容</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(packageInfo.points + packageInfo.bonus).toLocaleString()}ポイント
                  </p>
                  {packageInfo.bonus > 0 && (
                    <p className="text-sm text-gray-600">
                      ({packageInfo.points.toLocaleString()} + {packageInfo.bonus.toLocaleString()}ボーナス)
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    ¥{packageInfo.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* 保存されたカード or 新規カード選択 */}
            {savedCards.length > 0 && !showNewCardForm ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  お支払い方法を選択
                </h2>
                
                {/* 保存されたカードリスト */}
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleQuickPayment(card.id)}
                      disabled={isLoading}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedCard === card.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCardIcon className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              •••• •••• •••• {card.last4}
                            </p>
                            <p className="text-sm text-gray-500">
                              {card.brand} - 有効期限: {card.exp_month}/{card.exp_year}
                            </p>
                          </div>
                        </div>
                        {card.is_default && (
                          <span className="text-sm text-blue-600 font-medium">
                            デフォルト
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 新しいカードを使用 */}
                <button
                  onClick={() => setShowNewCardForm(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-center"
                  disabled={isLoading}
                >
                  <span className="text-gray-600">+ 新しいカードを使用</span>
                </button>

                {/* ワンクリック決済の説明 */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold">ワンクリック決済</p>
                      <p>保存されたカードをクリックするだけで、すぐに決済が完了します。</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {savedCards.length > 0 && (
                  <button
                    onClick={() => setShowNewCardForm(false)}
                    className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← 保存されたカードに戻る
                  </button>
                )}
                
                <FincodePaymentForm
                  amount={packageInfo.price}
                  onSubmit={handleNewCardPayment}
                  onCancel={() => router.push('/payment')}
                  loading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}