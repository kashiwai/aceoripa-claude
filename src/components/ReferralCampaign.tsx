'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardDocumentIcon, UserGroupIcon, GiftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  totalEarned: number;
  pendingRewards: number;
  referralLink: string;
}

export default function ReferralCampaign() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      // ダミーデータ（実際はAPIから取得）
      setStats({
        referralCode: 'ACEORIPA-XYZ123',
        referralCount: 5,
        totalEarned: 15000,
        pendingRewards: 3000,
        referralLink: `${window.location.origin}/register?ref=ACEORIPA-XYZ123`
      });
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('コピーしました！');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareOnTwitter = () => {
    const text = `ACEORIPAで友達を紹介して3000ポイントGET！🎁\n今なら新規登録で5000ポイントプレゼント中！\n\n登録はこちら👇`;
    const url = stats?.referralLink || '';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLine = () => {
    const text = `ACEORIPAで友達を紹介して3000ポイントGET！🎁\n今なら新規登録で5000ポイントプレゼント中！\n\n${stats?.referralLink || ''}`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-800 rounded-xl"></div>
        <div className="h-32 bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* メインキャンペーンカード */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden"
      >
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <UserGroupIcon className="h-10 w-10" />
            <h2 className="text-3xl font-black">友達紹介キャンペーン</h2>
          </div>
          
          <p className="text-lg mb-6 opacity-90">
            友達を紹介するとあなたも友達も<span className="text-2xl font-bold">3,000ポイント</span>GET！
          </p>

          {/* 紹介コード */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
            <p className="text-sm mb-2 opacity-90">あなたの紹介コード</p>
            <div className="flex items-center space-x-3">
              <code className="text-2xl font-mono font-bold bg-white/30 px-4 py-2 rounded-lg flex-1 text-center">
                {stats?.referralCode}
              </code>
              <button
                onClick={() => copyToClipboard(stats?.referralCode || '')}
                className="bg-white text-purple-600 p-3 rounded-lg hover:bg-gray-100 transition"
              >
                <ClipboardDocumentIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* シェアボタン */}
          <div className="flex space-x-3">
            <button
              onClick={shareOnTwitter}
              className="flex-1 bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Twitterでシェア</span>
            </button>
            <button
              onClick={shareOnLine}
              className="flex-1 bg-[#00B900] hover:bg-[#00a000] text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              <span>LINEでシェア</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">紹介人数</p>
              <p className="text-3xl font-bold text-white">{stats?.referralCount || 0}人</p>
            </div>
            <UserGroupIcon className="h-10 w-10 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">獲得ポイント</p>
              <p className="text-3xl font-bold text-white">{stats?.totalEarned?.toLocaleString() || 0}P</p>
            </div>
            <GiftIcon className="h-10 w-10 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">保留中の報酬</p>
              <p className="text-3xl font-bold text-yellow-400">{stats?.pendingRewards?.toLocaleString() || 0}P</p>
              <p className="text-xs text-gray-500 mt-1">友達の初回購入後に付与</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 紹介の流れ */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">🎯 紹介の流れ</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-white">紹介コードまたはリンクを友達にシェア</p>
              <p className="text-sm text-gray-400">Twitter、LINE、メールなどで簡単にシェアできます</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-white">友達が新規登録</p>
              <p className="text-sm text-gray-400">紹介コードを使って登録すると、友達も5000ポイントGET！</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-white">友達が初回購入完了</p>
              <p className="text-sm text-gray-400">友達が初めてポイントを購入すると...</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <p className="font-medium text-white">あなたも友達も3000ポイントGET！</p>
              <p className="text-sm text-gray-400">何人でも紹介OK！どんどん紹介してポイントを貯めよう！</p>
            </div>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4">
        <p className="text-yellow-400 text-sm">
          ※ 紹介ポイントは友達の初回購入完了後、24時間以内に付与されます<br />
          ※ 不正な紹介が確認された場合、ポイントの取り消しやアカウント停止の対象となります
        </p>
      </div>
    </div>
  );
}