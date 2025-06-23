// GMO FINCODE SDK Integration
// Documentation: https://www.fincode.jp/docs/

export interface FincodeConfig {
  publicKey: string;
  apiVersion?: string;
  environment?: 'production' | 'test';
}

export interface FincodeCardData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface FincodePaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  customerId?: string;
  card?: FincodeCardData;
  tokenId?: string;
  saveCard?: boolean;
}

export interface FincodePaymentResponse {
  success: boolean;
  paymentId?: string;
  status?: string;
  error?: {
    code: string;
    message: string;
  };
}

class FincodeClient {
  private publicKey: string;
  private apiVersion: string;
  private environment: 'production' | 'test';
  private baseUrl: string;

  constructor(config: FincodeConfig) {
    this.publicKey = config.publicKey;
    this.apiVersion = config.apiVersion || 'v1';
    this.environment = config.environment || 'test';
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.fincode.jp'
      : 'https://api.test.fincode.jp';
  }

  // カードトークン生成
  async createCardToken(card: FincodeCardData): Promise<{ tokenId: string; maskedCardNumber: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify({
          card_no: card.cardNumber.replace(/\s/g, ''),
          expire: `${card.expiryMonth}${card.expiryYear}`,
          holder_name: card.cardholderName,
          security_code: card.cvv,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create card token');
      }

      const data = await response.json();
      return {
        tokenId: data.id,
        maskedCardNumber: data.masked_card_no,
      };
    } catch (error) {
      console.error('Fincode token creation error:', error);
      throw error;
    }
  }

  // 決済実行
  async processPayment(request: FincodePaymentRequest): Promise<FincodePaymentResponse> {
    try {
      const payload: any = {
        pay_type: 'Card',
        access_id: request.orderId,
        amount: request.amount,
        currency: request.currency || 'JPY',
      };

      if (request.tokenId) {
        payload.token = request.tokenId;
      } else if (request.card) {
        payload.card_no = request.card.cardNumber.replace(/\s/g, '');
        payload.expire = `${request.card.expiryMonth}${request.card.expiryYear}`;
        payload.holder_name = request.card.cardholderName;
        payload.security_code = request.card.cvv;
      }

      if (request.customerId) {
        payload.customer_id = request.customerId;
      }

      if (request.saveCard) {
        payload.save_card = '1';
      }

      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error_code || 'UNKNOWN_ERROR',
            message: data.error_message || 'Payment failed',
          },
        };
      }

      return {
        success: true,
        paymentId: data.id,
        status: data.status,
      };
    } catch (error) {
      console.error('Fincode payment error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'ネットワークエラーが発生しました',
        },
      };
    }
  }

  // 3Dセキュア認証
  async verify3DSecure(paymentId: string): Promise<{ authUrl?: string; required: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/payments/${paymentId}/3dsecure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.publicKey}`,
        },
      });

      const data = await response.json();

      if (data.tds_required === '1') {
        return {
          required: true,
          authUrl: data.acs_url,
        };
      }

      return { required: false };
    } catch (error) {
      console.error('3D Secure verification error:', error);
      throw error;
    }
  }

  // 決済状態確認
  async getPaymentStatus(paymentId: string): Promise<{ status: string; success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.publicKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const data = await response.json();
      return {
        status: data.status,
        success: data.status === 'CAPTURED',
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }
}

// シングルトンインスタンス
let fincodeClient: FincodeClient | null = null;

export function initializeFincode(config: FincodeConfig): FincodeClient {
  fincodeClient = new FincodeClient(config);
  return fincodeClient;
}

export function getFincode(): FincodeClient {
  if (!fincodeClient) {
    throw new Error('Fincode client not initialized. Call initializeFincode first.');
  }
  return fincodeClient;
}

// エラーメッセージの日本語化
export function getFincodeErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'INVALID_CARD_NUMBER': 'カード番号が正しくありません',
    'INVALID_EXPIRY': '有効期限が正しくありません',
    'INVALID_CVV': 'セキュリティコードが正しくありません',
    'INSUFFICIENT_FUNDS': 'カードの残高が不足しています',
    'CARD_DECLINED': 'カードが利用できません',
    'EXPIRED_CARD': 'カードの有効期限が切れています',
    'NETWORK_ERROR': 'ネットワークエラーが発生しました',
    'UNKNOWN_ERROR': '決済処理中にエラーが発生しました',
  };

  return errorMessages[errorCode] || errorMessages['UNKNOWN_ERROR'];
}