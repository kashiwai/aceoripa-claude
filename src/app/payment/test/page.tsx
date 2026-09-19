'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

export default function PaymentTestPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [selectedPackage] = useState(FINCODE_CONFIG.pointPackages[0]);
  
  const [cardData, setCardData] = useState({
    cardNumber: '4111111111111111',
    cardholderName: 'TEST USER',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123'
  });

  // 決済セッション作成テスト
  const testCreateSession = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          amount: selectedPackage.price,
          points: selectedPackage.points + selectedPackage.bonus,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Session creation failed');
      }

      setTestResult({
        success: true,
        step: 'Session Created',
        orderId: data.orderId,
        data
      });

      toast.success('セッション作成成功: ' + data.orderId);
      return data.orderId;
    } catch (error: any) {
      console.error('Session creation error:', error);
      setTestResult({
        success: false,
        step: 'Session Creation',
        error: error.message
      });
      toast.error('セッション作成失敗: ' + error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 決済処理テスト
  const testProcessPayment = async (orderId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          ...cardData,
          saveCard: false,
        }),
      });

      const data = await response.json();
      
      setTestResult({
        success: response.ok,
        step: 'Payment Processing',
        status: response.status,
        data
      });

      if (response.ok) {
        toast.success('決済処理成功');
      } else {
        toast.error('決済処理失敗: ' + (data.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setTestResult({
        success: false,
        step: 'Payment Processing',
        error: error.message
      });
      toast.error('決済処理エラー: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 完全な決済フローテスト
  const testFullPaymentFlow = async () => {
    const orderId = await testCreateSession();
    if (orderId) {
      await testProcessPayment(orderId);
    }
  };

  // Fincode設定確認
  const checkFincodeConfig = () => {
    const config = {
      publicKey: FINCODE_CONFIG.publicKey ? '設定済み' : '未設定',
      secretKey: process.env.FINCODE_SECRET_KEY ? '設定済み' : '未設定',
      shopId: FINCODE_CONFIG.shopId || '未設定',
      environment: FINCODE_CONFIG.environment,
    };
    
    setTestResult({
      step: 'Configuration Check',
      data: config
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-red-600">ログインしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">決済テストページ</h1>
        
        {/* 設定確認 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Fincode設定確認</h2>
          <button
            onClick={checkFincodeConfig}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            設定を確認
          </button>
        </div>

        {/* テストカード情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">テストカード情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">カード番号</label>
              <input
                type="text"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">有効期限（月）</label>
                <input
                  type="text"
                  value={cardData.expiryMonth}
                  onChange={(e) => setCardData({...cardData, expiryMonth: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">有効期限（年）</label>
                <input
                  type="text"
                  value={cardData.expiryYear}
                  onChange={(e) => setCardData({...cardData, expiryYear: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">CVV</label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">カード名義</label>
              <input
                type="text"
                value={cardData.cardholderName}
                onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              />
            </div>
          </div>
        </div>

        {/* テストボタン */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">決済テスト</h2>
          <div className="space-x-4">
            <button
              onClick={testCreateSession}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              1. セッション作成テスト
            </button>
            <button
              onClick={testFullPaymentFlow}
              disabled={isLoading}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              2. 完全決済フローテスト
            </button>
          </div>
        </div>

        {/* 結果表示 */}
        {testResult && (
          <div className={`bg-white rounded-lg shadow p-6 ${testResult.success === false ? 'border-2 border-red-500' : ''}`}>
            <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">処理中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}