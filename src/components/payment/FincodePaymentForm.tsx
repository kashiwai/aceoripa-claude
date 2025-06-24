'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { FINCODE_CONFIG } from '@/lib/fincode/config';

interface FincodeCardData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

declare global {
  interface Window {
    Fincode: any;
  }
}

interface FincodePaymentFormProps {
  amount: number;
  onSubmit: (cardData: FincodeCardData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function FincodePaymentForm({ 
  amount, 
  onSubmit, 
  onCancel,
  loading = false 
}: FincodePaymentFormProps) {
  const [cardData, setCardData] = useState<FincodeCardData>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [errors, setErrors] = useState<Partial<FincodeCardData>>({});
  const [saveCard, setSaveCard] = useState(false);

  // カード番号のフォーマット（4桁ごとにスペース）
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

  // 有効期限のフォーマット（MM/YY）
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardData({ ...cardData, cardNumber: formatted });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    const [month, year] = formatted.split('/');
    setCardData({ 
      ...cardData, 
      expiryMonth: month || '',
      expiryYear: year || ''
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FincodeCardData> = {};

    // カード番号検証
    const cardNum = cardData.cardNumber.replace(/\s/g, '');
    if (!cardNum || cardNum.length < 13 || cardNum.length > 16) {
      newErrors.cardNumber = 'カード番号を正しく入力してください';
    }

    // カード名義人検証
    if (!cardData.cardholderName || cardData.cardholderName.length < 2) {
      newErrors.cardholderName = 'カード名義人を入力してください';
    }

    // 有効期限検証
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      newErrors.expiryMonth = '有効期限を入力してください';
    } else {
      const month = parseInt(cardData.expiryMonth);
      if (month < 1 || month > 12) {
        newErrors.expiryMonth = '有効期限が正しくありません';
      }
    }

    // CVV検証
    if (!cardData.cvv || (cardData.cvv.length !== 3 && cardData.cvv.length !== 4)) {
      newErrors.cvv = 'セキュリティコードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (isScriptLoaded && window.Fincode) {
      console.log('Fincode object:', window.Fincode);
      console.log('Available methods:', Object.keys(window.Fincode));
      console.log('Public key:', FINCODE_CONFIG.publicKey);
      
      // FINCODE初期化を試行
      try {
        if (typeof window.Fincode.initialize === 'function') {
          window.Fincode.initialize(FINCODE_CONFIG.publicKey);
          console.log('Initialized with initialize()');
        } else if (typeof window.Fincode.init === 'function') {
          window.Fincode.init(FINCODE_CONFIG.publicKey);
          console.log('Initialized with init()');
        } else if (typeof window.Fincode.setPublicKey === 'function') {
          window.Fincode.setPublicKey(FINCODE_CONFIG.publicKey);
          console.log('Initialized with setPublicKey()');
        } else {
          console.error('No initialization method found');
        }
      } catch (error) {
        console.error('Fincode initialization error:', error);
      }
    } else {
      console.log('Script loaded:', isScriptLoaded, 'Fincode available:', !!window.Fincode);
    }
  }, [isScriptLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // FINCODE形式でカード情報を送信（トークン化は使用しない）
      await onSubmit({
        cardNumber: cardData.cardNumber.replace(/\s/g, ''),
        cardholderName: cardData.cardholderName,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cvv: cardData.cvv,
        saveCard: saveCard,
      });
      
    } catch (error) {
      console.error('Payment form error:', error);
      setErrors({ cardNumber: '決済処理中にエラーが発生しました' });
    }
  };

  return (
    <>
      <Script
        src="https://js.fincode.jp/v1/fincode.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">お支払い金額</span>
          <span className="text-2xl font-bold text-blue-600">¥{amount.toLocaleString()}</span>
        </div>
      </div>

      {/* カード番号 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カード番号
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          <CreditCardIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      {/* カード名義人 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カード名義人（ローマ字）
        </label>
        <input
          type="text"
          value={cardData.cardholderName}
          onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value.toUpperCase() })}
          placeholder="TARO YAMADA"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.cardholderName ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.cardholderName && (
          <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
        )}
      </div>

      {/* 有効期限とCVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            有効期限 (MM/YY)
          </label>
          <input
            type="text"
            value={cardData.expiryMonth + (cardData.expiryYear ? '/' + cardData.expiryYear : '')}
            onChange={handleExpiryChange}
            placeholder="12/25"
            maxLength={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.expiryMonth && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            セキュリティコード
          </label>
          <input
            type="text"
            value={cardData.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value.length <= 4) {
                setCardData({ ...cardData, cvv: value });
              }
            }}
            placeholder="123"
            maxLength={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cvv ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* カード情報保存オプション */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="save-card"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={loading}
        />
        <label htmlFor="save-card" className="ml-2 text-sm text-gray-700">
          次回のためにカード情報を保存する
        </label>
      </div>

      {/* セキュリティ表示 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <LockClosedIcon className="h-5 w-5 text-green-500 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-1">安全な決済</p>
            <p>お客様のカード情報は暗号化され、安全に処理されます。</p>
            <p className="mt-1">決済はGMO FINCODEにより処理されます。</p>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              処理中...
            </span>
          ) : (
            '支払う'
          )}
        </button>
      </div>
    </form>
    </>
  );
}