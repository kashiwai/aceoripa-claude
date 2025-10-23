'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

declare global {
  interface Window {
    Fincode: any;
  }
}

export default function ProductionPaymentTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [fincodeReady, setFincodeReady] = useState(false);
  const [fincode, setFincode] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  
  // カード情報入力フォーム
  const [cardData, setCardData] = useState({
    card_no: '',
    expire_month: '',
    expire_year: '',
    holder_name: '',
    security_code: '',
    amount: 100
  });

  // 環境チェック
  const isProduction = FINCODE_CONFIG.environment === 'prod';

  useEffect(() => {
    // Fincode.jsをロード
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

  // カード番号のフォーマット（スペース追加）
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // 入力ハンドラー
  const handleInputChange = (field: string, value: string) => {
    if (field === 'card_no') {
      value = formatCardNumber(value);
    }
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  // 決済実行（カード情報を直接送信）
  const executePayment = async () => {
    // 入力検証
    if (!cardData.card_no || !cardData.expire_month || !cardData.expire_year || 
        !cardData.holder_name || !cardData.security_code) {
      toast.error('すべての項目を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      // カード情報を直接バックエンドに送信（PCI DSS準拠のため本番では非推奨）
      const paymentResponse = await fetch('/api/payment/fincode-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: cardData.card_no.replace(/\s/g, ''),
          expiryMonth: cardData.expire_month,
          expiryYear: cardData.expire_year,
          holderName: cardData.holder_name,
          cvv: cardData.security_code,
          amount: cardData.amount,
          orderId: 'ORDER_' + Date.now()
        })
      });

      const result = await paymentResponse.json();
      
      setTestResult({
        success: paymentResponse.ok,
        step: '決済処理',
        result: result,
        timestamp: new Date().toISOString()
      });

      if (result.requires3DSecure) {
              // 3Dセキュア認証が必要な場合
              toast.info('3Dセキュア認証にリダイレクトします...');
              
              // 3DSフォームを作成して自動送信
              const form = document.createElement('form');
              form.method = 'POST';
              form.action = result.authUrl;
              form.target = '_self';
              
              if (result.paReq) {
                const paReqInput = document.createElement('input');
                paReqInput.type = 'hidden';
                paReqInput.name = 'PaReq';
                paReqInput.value = result.paReq;
                form.appendChild(paReqInput);
              }
              
              if (result.termUrl) {
                const termUrlInput = document.createElement('input');
                termUrlInput.type = 'hidden';
                termUrlInput.name = 'TermUrl';
                termUrlInput.value = result.termUrl;
                form.appendChild(termUrlInput);
              }
              
              if (result.md) {
                const mdInput = document.createElement('input');
                mdInput.type = 'hidden';
                mdInput.name = 'MD';
                mdInput.value = result.md;
                form.appendChild(mdInput);
              }
              
              document.body.appendChild(form);
              form.submit();
      } else if (paymentResponse.ok && result.success) {
        toast.success('決済成功！');
      } else {
        toast.error('決済失敗: ' + (result.error || 'Unknown error'));
      }
      setIsLoading(false);
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

  // テスト環境用のデータを自動入力
  const fillTestData = () => {
    setCardData({
      card_no: '4111 1111 1111 1111',
      expire_month: '12',
      expire_year: '25',
      holder_name: 'TEST USER',
      security_code: '123',
      amount: 100
    });
    toast.success('テストデータを入力しました');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* ヘッダー */}
          <div className={`p-6 ${isProduction ? 'bg-red-600' : 'bg-blue-600'}`}>
            <h1 className="text-2xl font-bold text-white">
              {isProduction ? '⚠️ 本番環境' : '🧪 テスト環境'} 決済フォーム
            </h1>
            <p className="text-white/90 mt-2 text-sm">
              環境: {FINCODE_CONFIG.environment} | 
              API: {isProduction ? 'api.fincode.jp' : 'api.test.fincode.jp'}
            </p>
          </div>

          <div className="p-6">
            {/* ステータス */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fincode.js状態:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  fincodeReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {fincodeReady ? '準備完了' : '初期化中...'}
                </span>
              </div>
            </div>

            {/* カード情報入力フォーム */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カード番号 {isProduction && <span className="text-red-500">*本番用</span>}
                </label>
                <input
                  type="text"
                  value={cardData.card_no}
                  onChange={(e) => handleInputChange('card_no', e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    有効期限（月）
                  </label>
                  <input
                    type="text"
                    value={cardData.expire_month}
                    onChange={(e) => handleInputChange('expire_month', e.target.value)}
                    placeholder="MM"
                    maxLength={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    有効期限（年）
                  </label>
                  <input
                    type="text"
                    value={cardData.expire_year}
                    onChange={(e) => handleInputChange('expire_year', e.target.value)}
                    placeholder="YY"
                    maxLength={2}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カード名義人
                </label>
                <input
                  type="text"
                  value={cardData.holder_name}
                  onChange={(e) => handleInputChange('holder_name', e.target.value)}
                  placeholder="TARO YAMADA"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    セキュリティコード
                  </label>
                  <input
                    type="text"
                    value={cardData.security_code}
                    onChange={(e) => handleInputChange('security_code', e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    金額（円）
                  </label>
                  <input
                    type="number"
                    value={cardData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="mt-6 space-y-3">
              <button
                onClick={executePayment}
                disabled={!fincodeReady || isLoading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isProduction 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
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
                  `💳 決済を実行（¥${cardData.amount}）`
                )}
              </button>

              {!isProduction && (
                <button
                  onClick={fillTestData}
                  className="w-full py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                  🧪 テストデータを入力
                </button>
              )}
            </div>

            {/* 警告メッセージ */}
            {isProduction && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>⚠️ 警告:</strong> 本番環境です。実際の決済が処理されます。
                  テスト環境で試す場合は、.env.localの NEXT_PUBLIC_FINCODE_ENV を test に変更してください。
                </p>
              </div>
            )}

            {!isProduction && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ 情報:</strong> テスト環境です。実際の課金は発生しません。
                  テストカード: 4111 1111 1111 1111
                </p>
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
}