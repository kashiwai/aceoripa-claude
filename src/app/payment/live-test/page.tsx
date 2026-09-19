'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

declare global {
  interface Window {
    Fincode: any;
  }
}

export default function LivePaymentTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [fincodeReady, setFincodeReady] = useState(false);
  const [fincode, setFincode] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  
  // テスト金額
  const testAmount = 100; // 100円

  useEffect(() => {
    // Fincode.jsをロード（環境に応じて切り替え）
    const script = document.createElement('script');
    script.src = FINCODE_CONFIG.jsUrl || (FINCODE_CONFIG.environment === 'test' 
      ? 'https://js.test.fincode.jp/v1/fincode.js'
      : 'https://js.fincode.jp/v1/fincode.js');
    script.async = true;
    
    script.onload = () => {
      if (window.Fincode) {
        const fincodeInstance = window.Fincode(FINCODE_CONFIG.publicKey);
        setFincode(fincodeInstance);
        setFincodeReady(true);
        toast.success('Fincode.js準備完了');
      }
    };
    
    script.onerror = () => {
      toast.error('Fincode.jsのロードに失敗');
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // トークン化テスト
  const testTokenization = async () => {
    if (!fincode) {
      toast.error('Fincodeが初期化されていません');
      return;
    }

    setIsLoading(true);
    try {
      // カード情報をトークン化（Fincodeの正しいパラメータ名）
      const cardData = {
        card_no: '4111111111111111',        // cardNo → card_no
        expire: '2512',                     // YYMM形式
        holder_name: 'TEST USER',           // holderName → holder_name
        security_code: '123'                // securityCode → security_code
      };

      console.log('Tokenizing card data...');
      
      // Fincodeのトークン化API呼び出し
      fincode.tokens(
        cardData,
        (status: number, response: any) => {
          console.log('Tokenization response:', { status, response });
          
          if (status === 200) {
            setTestResult({
              success: true,
              step: 'トークン化成功',
              token: response.token,
              cardMask: response.card_no_mask || '****',
              timestamp: new Date().toISOString()
            });
            toast.success('カードトークン生成成功！');
          } else {
            setTestResult({
              success: false,
              step: 'トークン化失敗',
              error: response,
              status: status,
              timestamp: new Date().toISOString()
            });
            toast.error('トークン化エラー: ' + (response.message || 'Unknown error'));
          }
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      console.error('Tokenization error:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('エラー: ' + error.message);
      setIsLoading(false);
    }
  };

  // 決済実行テスト
  const testPayment = async () => {
    if (!fincode) {
      toast.error('Fincodeが初期化されていません');
      return;
    }

    setIsLoading(true);
    try {
      // まずトークンを生成（正しいパラメータ名）
      const cardData = {
        card_no: '4111111111111111',
        expire: '2512',
        holder_name: 'TEST USER',
        security_code: '123'
      };

      fincode.tokens(
        cardData,
        async (status: number, response: any) => {
          if (status === 200) {
            // トークンが取得できたら決済APIを呼び出す
            const token = response.token;
            console.log('Token obtained:', token);
            
            // バックエンドの決済APIを呼び出す（新しいエンドポイント）
            const paymentResponse = await fetch('/api/payment/fincode-direct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                token: token,
                amount: testAmount,
                orderId: 'TEST_' + Date.now()
              })
            });

            const result = await paymentResponse.json();
            
            setTestResult({
              success: paymentResponse.ok,
              step: '決済処理',
              result: result,
              timestamp: new Date().toISOString()
            });

            if (paymentResponse.ok) {
              toast.success('決済成功！');
            } else {
              toast.error('決済失敗: ' + (result.error || 'Unknown error'));
            }
          } else {
            toast.error('トークン化失敗');
          }
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('エラー: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Fincode決済ライブテスト
          </h1>
          <p className="text-gray-600 mb-8">
            実際のFincode APIを使用した決済テスト
          </p>

          {/* ステータス表示 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">システムステータス</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${fincodeReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>Fincode.js: {fincodeReady ? '準備完了' : '初期化中...'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span>環境: {FINCODE_CONFIG.environment === 'prod' ? '本番' : 'テスト'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span>Shop ID: {FINCODE_CONFIG.shopId}</span>
              </div>
            </div>
          </div>

          {/* テストカード情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">テストカード情報</h2>
            <div className="font-mono text-sm space-y-1">
              <div>番号: 4111 1111 1111 1111</div>
              <div>有効期限: 12/25</div>
              <div>CVV: 123</div>
              <div>名義: TEST USER</div>
              <div className="text-blue-600 mt-2">金額: ¥{testAmount}</div>
            </div>
          </div>

          {/* テストボタン */}
          <div className="space-y-3">
            <button
              onClick={testTokenization}
              disabled={!fincodeReady || isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  処理中...
                </span>
              ) : (
                '🔐 カードトークン化テスト'
              )}
            </button>

            <button
              onClick={testPayment}
              disabled={!fincodeReady || isLoading}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  処理中...
                </span>
              ) : (
                '💳 決済実行テスト（¥100）'
              )}
            </button>
          </div>

          {/* 結果表示 */}
          {testResult && (
            <div className={`mt-6 p-6 rounded-lg border-2 ${
              testResult.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
            }`}>
              <h3 className={`text-lg font-bold mb-3 ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ 成功' : '❌ エラー'}
              </h3>
              <pre className="bg-white p-4 rounded border overflow-auto text-xs">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          {/* 注意事項 */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>📝 注意:</strong> これは本番環境のFincode APIを使用したテストです。
              実際の課金は発生しませんが、APIリクエストは本番環境に送信されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}