'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PurchasePage() {
  const router = useRouter();

  useEffect(() => {
    // /paymentページにリダイレクト
    router.replace('/payment');
  }, [router]);

  return null;
}