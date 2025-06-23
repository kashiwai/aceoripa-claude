'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GiftIcon, CalendarIcon, FireIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Campaign {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special' | 'event';
  title: string;
  description: string;
  points: number;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  claimed: boolean;
  progress?: {
    current: number;
    total: number;
  };
}

export default function CampaignSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/claim`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('報酬を受け取りました！');
        fetchCampaigns(); // リロード
      } else {
        toast.error('報酬の受け取りに失敗しました');
      }
    } catch (error) {
      toast.error('エラーが発生しました');
    }
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <CalendarIcon className="h-6 w-6" />;
      case 'special':
        return <FireIcon className="h-6 w-6" />;
      default:
        return <GiftIcon className="h-6 w-6" />;
    }
  };

  const getCampaignColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'from-blue-500 to-blue-600';
      case 'weekly':
        return 'from-purple-500 to-purple-600';
      case 'monthly':
        return 'from-green-500 to-green-600';
      case 'special':
        return 'from-red-500 to-pink-500';
      case 'event':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-800 rounded-xl"></div>
        <div className="h-48 bg-gray-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-white">🎁 キャンペーン・ボーナス</h3>
        <span className="text-sm text-gray-400">
          アクティブ: {campaigns.filter(c => c.isActive && !c.claimed).length}件
        </span>
      </div>

      {/* デイリーボーナス */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-8 w-8" />
            <div>
              <h4 className="text-xl font-bold">デイリーボーナス</h4>
              <p className="text-sm opacity-90">毎日ログインで無料ポイントGET！</p>
            </div>
          </div>
          <div className="text-2xl font-bold">+100P</div>
        </div>
        
        {/* ログインストリーク */}
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">連続ログイン</span>
            <span className="text-sm font-bold">5日目</span>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                  day <= 5 ? 'bg-white text-blue-600' : 'bg-white/30'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          <p className="text-xs mt-2 opacity-90">7日連続で500Pボーナス！</p>
        </div>

        <button
          className="w-full mt-4 bg-white text-blue-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition"
          onClick={() => claimReward('daily')}
        >
          受け取る
        </button>
      </div>

      {/* アクティブキャンペーン */}
      <div className="space-y-4">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${
              campaign.claimed ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${getCampaignColor(campaign.type)}`}>
                  {getCampaignIcon(campaign.type)}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-1">{campaign.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{campaign.description}</p>
                  
                  {/* 進捗バー */}
                  {campaign.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>進捗</span>
                        <span>{campaign.progress.current}/{campaign.progress.total}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(campaign.progress.current / campaign.progress.total) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 期間 */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>期間: {campaign.startDate} ~ {campaign.endDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-2">
                  +{campaign.points.toLocaleString()}P
                </div>
                {!campaign.claimed && campaign.isActive && (
                  <button
                    onClick={() => claimReward(campaign.id)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition text-sm"
                  >
                    受け取る
                  </button>
                )}
                {campaign.claimed && (
                  <span className="text-green-400 text-sm">✓ 受取済</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* キャンペーン一覧へのリンク */}
      <div className="text-center pt-4">
        <a href="/campaigns" className="text-blue-400 hover:text-blue-500 font-medium">
          すべてのキャンペーンを見る →
        </a>
      </div>
    </div>
  );
}