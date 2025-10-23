'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

declare global {
  interface Window {
    Fincode: any;
  }
}

export default function TokenPaymentTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [fincodeReady, setFincodeReady] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [token, setToken] = useState<string>('');
  
  // カード情報
  const [cardData, setCardData] = useState({
    card_no: '4111 1111 1111 1111',
    expire_month: '12',
    expire_year: '25',
    holder_name: 'TEST USER',
    security_code: '123',
    amount: 100
  });

  const isProduction = FINCODE_CONFIG.environment === 'prod';

  useEffect(() => {
    // Fincode.jsをロード
    const loadFincode = () => {
      if (window.Fincode) {
        setFincodeReady(true);
        toast.success('Fincode.js準備完了');
        return;
      }

      const script = document.createElement('script');
      script.src = FINCODE_CONFIG.jsUrl || (isProduction 
        ? 'https://js.fincode.jp/v1/fincode.js'
        : 'https://js.test.fincode.jp/v1/fincode.js');
      script.async = true;
      
      script.onload = () => {
        if (window.Fincode) {
          setFincodeReady(true);
          toast.success('Fincode.js ロード完了');
        }
      };
      
      script.onerror = () => {
        toast.error('Fincode.jsのロードに失敗');
      };
      
      document.body.appendChild(script);
    };

    loadFincode();
  }, [isProduction]);

  // Step 1: トークン生成
  const generateToken = async () => {
    if (!window.Fincode) {
      toast.error('Fincode.jsが初期化されていません');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const fincode = window.Fincode(FINCODE_CONFIG.publicKey);
      
      // カード情報
      const tokenData = {
        card_no: cardData.card_no.replace(/\s/g, ''),
        expire: cardData.expire_year + cardData.expire_month,
        holder_name: cardData.holder_name,
        security_code: cardData.security_code
      };

      console.log('Generating token with data:', {
        ...tokenData,
        card_no: tokenData.card_no.substring(0, 4) + '****'
      });

      // トークン生成
      fincode.tokens(
        tokenData,
        (status: number, response: any) => {
          console.log('Token response:', { status, response });
          
          // Fincodeのレスポンス構造に対応
          // status 200でlist配列にトークンが含まれる場合
          if (status === 200 && response.list && response.list[0]?.token) {
            const tokenValue = response.list[0].token;
            setToken(tokenValue);
            setTestResult({
              success: true,
              step: 'トークン生成成功',
              token: tokenValue,
              cardMask: response.card_no || '************1111',
              expire: response.expire,
              timestamp: new Date().toISOString()
            });
            toast.success('トークン生成成功！');
          } 
          // 通常のトークンレスポンス
          else if (status === 200 && response.token) {
            setToken(response.token);
            setTestResult({
              success: true,
              step: 'トークン生成成功',
              token: response.token,
              cardMask: response.card_no_mask || response.card_no || '****',
              timestamp: new Date().toISOString()
            });
            toast.success('トークン生成成功！');
          } else {
            setTestResult({
              success: false,
              step: 'トークン生成失敗',
              error: response,
              status: status,
              timestamp: new Date().toISOString()
            });
            toast.error('トークン生成エラー: ' + (response.errors?.[0]?.error_message || 'Unknown error'));
          }
          setIsLoading(false);
        }
      );
    } catch (error: any) {
      console.error('Token generation error:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('エラー: ' + error.message);
      setIsLoading(false);
    }
  };

  // Step 2: トークンで決済実行
  const executePaymentWithToken = async () => {
    if (!token) {
      toast.error('先にトークンを生成してください');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/payment/fincode-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          amount: cardData.amount,
          orderId: 'TOKEN_TEST_' + Date.now()
        })
      });

      const result = await response.json();
      
      setTestResult({
        success: response.ok,
        step: '決済処理',
        result: result,
        timestamp: new Date().toISOString()
      });

      if (result.requires3DSecure) {
        toast.info('3Dセキュア認証が必要です');
        
        // 3Dセキュア認証画面へリダイレクト
        if (result.authUrl) {
          window.location.href = result.authUrl;
        }
      } else if (response.ok && result.success) {
        toast.success('決済成功！');
      } else {
        toast.error('決済失敗: ' + (result.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('エラー: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Fincodeトークン決済テスト
          </h1>
          <p className="text-gray-600 mb-8">
            トークン化を使用した安全な決済処理
          </p>

          {/* ステータス */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Fincode.js:</span>
                <span className={`ml-2 font-medium ${fincodeReady ? 'text-green-600' : 'text-yellow-600'}`}>
                  {fincodeReady ? '準備完了' : '初期化中...'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">環境:</span>
                <span className={`ml-2 font-medium ${isProduction ? 'text-red-600' : 'text-blue-600'}`}>
                  {isProduction ? '本番' : 'テスト'}
                </span>
              </div>
            </div>
          </div>

          {/* カード情報 */}
          <div className="mb-6 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">テストカード情報</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カード番号</label>
                <input
                  type="text"
                  value={cardData.card_no}
                  onChange={(e) => setCardData({...cardData, card_no: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">月</label>
                  <input
                    type="text"
                    value={cardData.expire_month}
                    onChange={(e) => setCardData({...cardData, expire_month: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">年</label>
                  <input
                    type="text"
                    value={cardData.expire_year}
                    onChange={(e) => setCardData({...cardData, expire_year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    value={cardData.security_code}
                    onChange={(e) => setCardData({...cardData, security_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    maxLength={4}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カード名義</label>
                <input
                  type="text"
                  value={cardData.holder_name}
                  onChange={(e) => setCardData({...cardData, holder_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">金額（円）</label>
                <input
                  type="number"
                  value={cardData.amount}
                  onChange={(e) => setCardData({...cardData, amount: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* トークン表示 */}
          {token && (
            <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-lg">
              <p className="text-sm font-medium text-green-800">生成されたトークン:</p>
              <p className="text-xs font-mono text-gray-600 mt-1 break-all">{token}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="space-y-3">
            <button
              onClick={generateToken}
              disabled={!fincodeReady || isLoading}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
            >
              {isLoading ? '処理中...' : 'Step 1: トークンを生成'}
            </button>

            <button
              onClick={executePaymentWithToken}
              disabled={!token || isLoading}
              className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
            >
              {isLoading ? '処理中...' : `Step 2: 決済を実行（¥${cardData.amount}）`}
            </button>
          </div>

          {/* 結果表示 */}
          {testResult && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${
              testResult.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
            }`}>
              <h3 className={`font-bold mb-2 ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ 成功' : '❌ エラー'}
              </h3>
              <pre className="bg-white p-3 rounded border overflow-auto text-xs">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          {/* 注意事項 */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>📝 使い方:</strong>
              <br />1. 「Step 1: トークンを生成」でカード情報をトークン化
              <br />2. 「Step 2: 決済を実行」でトークンを使用して決済
              <br />
              <br />環境: {isProduction ? '本番モード（実際の決済）' : 'テストモード（テスト決済）'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}