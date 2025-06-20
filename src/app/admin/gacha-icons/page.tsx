'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface GachaPullOption {
  id: string;
  pull_count: number;
  display_name: string;
  icon_url?: string;
  price_multiplier: number;
  is_popular?: boolean;
  is_discount?: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export default function GachaIconsPage() {
  const [pullOptions, setPullOptions] = useState<GachaPullOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOption, setEditingOption] = useState<GachaPullOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const supabase = createClientComponentClient();

  // デフォルトのプルオプション
  const defaultOptions = [
    { pull_count: 1, display_name: '1回', price_multiplier: 1, order_index: 0 },
    { pull_count: 3, display_name: '3回', price_multiplier: 2.8, order_index: 1, is_discount: true },
    { pull_count: 5, display_name: '5回', price_multiplier: 4.5, order_index: 2, is_discount: true },
    { pull_count: 10, display_name: '10回', price_multiplier: 9, order_index: 3, is_popular: true, is_discount: true },
  ];

  useEffect(() => {
    fetchPullOptions();
  }, []);

  const fetchPullOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('gacha_pull_options')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setPullOptions(data || []);
    } catch (error) {
      console.error('Error fetching pull options:', error);
      // テーブルが存在しない場合はデフォルトを表示
      setPullOptions(defaultOptions.map((opt, i) => ({ ...opt, id: `default-${i}` })));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (option: GachaPullOption) => {
    try {
      if (option.id?.startsWith('default-')) {
        // 新規作成
        const { error } = await supabase
          .from('gacha_pull_options')
          .insert({
            pull_count: option.pull_count,
            display_name: option.display_name,
            icon_url: option.icon_url,
            price_multiplier: option.price_multiplier,
            is_popular: option.is_popular || false,
            is_discount: option.is_discount || false,
            order_index: option.order_index
          });
        
        if (error) throw error;
        toast.success('プルオプションを作成しました');
      } else {
        // 更新
        const { error } = await supabase
          .from('gacha_pull_options')
          .update({
            display_name: option.display_name,
            icon_url: option.icon_url,
            price_multiplier: option.price_multiplier,
            is_popular: option.is_popular,
            is_discount: option.is_discount,
            order_index: option.order_index
          })
          .eq('id', option.id);
        
        if (error) throw error;
        toast.success('プルオプションを更新しました');
      }
      
      fetchPullOptions();
      setEditingOption(null);
    } catch (error) {
      console.error('Error saving pull option:', error);
      toast.error('保存に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このプルオプションを削除しますか？')) return;
    
    try {
      const { error } = await supabase
        .from('gacha_pull_options')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('プルオプションを削除しました');
      fetchPullOptions();
    } catch (error) {
      console.error('Error deleting pull option:', error);
      toast.error('削除に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">ガチャ回数アイコン管理</h1>

        {/* 新規作成ボタン */}
        <div className="mb-8">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + 新規プルオプション追加
          </button>
        </div>

        {/* プルオプション一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pullOptions.map((option) => (
            <motion.div
              key={option.id}
              className="bg-gray-800 rounded-xl p-6 relative"
              whileHover={{ scale: 1.02 }}
            >
              {/* バッジ */}
              <div className="absolute top-4 right-4 flex gap-2">
                {option.is_popular && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">人気</span>
                )}
                {option.is_discount && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">お得</span>
                )}
              </div>

              {/* アイコン */}
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-xl flex items-center justify-center">
                {option.icon_url ? (
                  <img src={option.icon_url} alt={option.display_name} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl font-bold text-white">{option.pull_count}</span>
                )}
              </div>

              {/* 情報 */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-white mb-1">{option.display_name}</h3>
                <p className="text-gray-400">×{option.price_multiplier} 価格</p>
              </div>

              {/* アクション */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingOption(option)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(option.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                >
                  削除
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 編集モーダル */}
        {(editingOption || isCreating) && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-gray-800 rounded-xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {isCreating ? '新規プルオプション' : 'プルオプション編集'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">回数</label>
                  <input
                    type="number"
                    value={editingOption?.pull_count || 1}
                    onChange={(e) => setEditingOption(prev => ({ ...prev!, pull_count: parseInt(e.target.value) }))}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                    disabled={!isCreating}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">表示名</label>
                  <input
                    type="text"
                    value={editingOption?.display_name || ''}
                    onChange={(e) => setEditingOption(prev => ({ ...prev!, display_name: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">アイコンURL（オプション）</label>
                  <input
                    type="text"
                    value={editingOption?.icon_url || ''}
                    onChange={(e) => setEditingOption(prev => ({ ...prev!, icon_url: e.target.value }))}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                    placeholder="/api/placeholder/icons/pull-1"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">価格倍率</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingOption?.price_multiplier || 1}
                    onChange={(e) => setEditingOption(prev => ({ ...prev!, price_multiplier: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">表示順</label>
                  <input
                    type="number"
                    value={editingOption?.order_index || 0}
                    onChange={(e) => setEditingOption(prev => ({ ...prev!, order_index: parseInt(e.target.value) }))}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center text-gray-300">
                    <input
                      type="checkbox"
                      checked={editingOption?.is_popular || false}
                      onChange={(e) => setEditingOption(prev => ({ ...prev!, is_popular: e.target.checked }))}
                      className="mr-2"
                    />
                    人気
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input
                      type="checkbox"
                      checked={editingOption?.is_discount || false}
                      onChange={(e) => setEditingOption(prev => ({ ...prev!, is_discount: e.target.checked }))}
                      className="mr-2"
                    />
                    お得
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    handleSave(editingOption!);
                    setIsCreating(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-semibold"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setEditingOption(null);
                    setIsCreating(false);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded font-semibold"
                >
                  キャンセル
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI生成ヒント */}
        <div className="mt-12 bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">🤖 アイコンAI生成プロンプト例</h3>
          <div className="space-y-2 text-gray-300">
            <p>• 1回: "Single dice roll icon, gold color, game UI style, transparent background"</p>
            <p>• 3回: "Three dice stacked, silver color, sparkle effect, game icon design"</p>
            <p>• 5回: "Five star burst, rainbow gradient, premium game icon, transparent PNG"</p>
            <p>• 10回: "Ten explosion effect, golden crown, best value badge, game UI asset"</p>
          </div>
        </div>
      </div>
    </div>
  );
}