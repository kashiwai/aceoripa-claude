'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

export default function EmergencyPaymentTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  // テスト用のカード情報
  const [cardData] = useState({
    cardNumber: '4111111111111111',
    cardholderName: 'TEST USER',
    expiryMonth: '12',
    expiryYear: '25',
    cvv: '123'
  });

  // 簡易決済テスト（認証なし）
  const testDirectPayment = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Step 1: Fincodeの設定確認
      const config = {
        publicKey: FINCODE_CONFIG.publicKey ? '✅ 設定済み' : '❌ 未設定',
        shopId: FINCODE_CONFIG.shopId || '❌ 未設定',
        environment: FINCODE_CONFIG.environment,
        apiUrl: FINCODE_CONFIG.environment === 'prod' 
          ? 'https://api.fincode.jp' 
          : 'https://api.test.fincode.jp'
      };
      
      console.log('Fincode Config:', config);
      
      // Step 2: 決済APIテスト（モック）
      const testOrderId = 'TEST_' + Date.now();
      const amount = 100; // 100円テスト
      
      // Fincode APIの直接呼び出しテスト
      const paymentUrl = config.apiUrl;
      
      // 決済作成のテスト
      const createPaymentData = {
        pay_type: 'Card',
        job_code: 'CAPTURE',
        amount: amount.toString(),
        id: testOrderId,
      };
      
      console.log('Payment Request:', createPaymentData);
      console.log('API URL:', paymentUrl);
      console.log('Shop ID:', FINCODE_CONFIG.shopId);
      
      setTestResult({
        step: 'Configuration Check',
        config: config,
        testData: {
          orderId: testOrderId,
          amount: amount,
          cardMask: cardData.cardNumber.substring(0, 4) + '****' + cardData.cardNumber.substring(12)
        },
        timestamp: new Date().toISOString(),
        message: 'Fincode設定を確認しました。実際の決済処理にはAPIキーが必要です。'
      });
      
      toast.success('設定確認完了');
    } catch (error: any) {
      console.error('Test error:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('テストエラー: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fincode.jsを使用したテスト
  const testWithFincodeJs = async () => {
    setIsLoading(true);
    
    try {
      // Fincode.jsのロード確認
      const script = document.createElement('script');
      script.src = 'https://js.fincode.jp/v1/fincode.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Fincode.js loaded');
        
        // @ts-ignore
        if (window.Fincode) {
          // @ts-ignore
          const fincode = window.Fincode(FINCODE_CONFIG.publicKey);
          
          setTestResult({
            success: true,
            message: 'Fincode.jsが正常にロードされました',
            publicKey: FINCODE_CONFIG.publicKey ? 'Set' : 'Not set',
            timestamp: new Date().toISOString()
          });
          
          toast.success('Fincode.js ロード成功');
        } else {
          throw new Error('Fincode object not found');
        }
      };
      
      script.onerror = () => {
        throw new Error('Failed to load Fincode.js');
      };
      
      document.body.appendChild(script);
    } catch (error: any) {
      console.error('Fincode.js test error:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      toast.error('Fincode.jsロードエラー');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6">
          <h1 className="text-2xl font-bold text-red-700">🚨 緊急決済テスト</h1>
          <p className="text-red-600 mt-2">ログイン不要・最小限の決済機能テスト</p>
        </div>

        {/* Fincode設定表示 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">現在の設定</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>Environment: <span className="text-blue-600">{FINCODE_CONFIG.environment}</span></div>
            <div>Shop ID: <span className="text-blue-600">{FINCODE_CONFIG.shopId || 'NOT SET'}</span></div>
            <div>Public Key: <span className="text-blue-600">{FINCODE_CONFIG.publicKey ? 'SET' : 'NOT SET'}</span></div>
            <div>API URL: <span className="text-blue-600">
              {FINCODE_CONFIG.environment === 'prod' ? 'https://api.fincode.jp' : 'https://api.test.fincode.jp'}
            </span></div>
          </div>
        </div>

        {/* テストカード情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">テストカード情報</h2>
          <div className="bg-gray-50 p-4 rounded font-mono text-sm">
            <div>番号: {cardData.cardNumber}</div>
            <div>名義: {cardData.cardholderName}</div>
            <div>有効期限: {cardData.expiryMonth}/{cardData.expiryYear}</div>
            <div>CVV: {cardData.cvv}</div>
          </div>
        </div>

        {/* テストボタン */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">テスト実行</h2>
          <div className="space-y-3">
            <button
              onClick={testDirectPayment}
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded hover:bg-red-700 disabled:opacity-50 font-bold"
            >
              🔥 設定確認テスト（認証なし）
            </button>
            
            <button
              onClick={testWithFincodeJs}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
            >
              📦 Fincode.js ロードテスト
            </button>
          </div>
        </div>

        {/* 結果表示 */}
        {testResult && (
          <div className={`bg-white rounded-lg shadow p-6 border-2 ${
            testResult.success === false ? 'border-red-500' : 'border-green-500'
          }`}>
            <h2 className="text-lg font-semibold mb-4">
              {testResult.success === false ? '❌ エラー' : '✅ 結果'}
            </h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ 注意:</strong> これは緊急テスト用ページです。
            実際の決済処理にはAPIキーと認証が必要です。
          </p>
        </div>
      </div>
    </div>
  );
}