'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  display_name: string;
}

export default function AddPointsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pointAmount, setPointAmount] = useState('');
  const [pointType, setPointType] = useState<'free' | 'paid'>('paid');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  };

  const handleAddPoints = async () => {
    if (!selectedUserId || !pointAmount) {
      alert('ユーザーとポイント数を入力してください');
      return;
    }

    setLoading(true);
    try {
      // ポイント履歴に追加
      const { error: historyError } = await supabase
        .from('point_history')
        .insert({
          user_id: selectedUserId,
          amount: parseInt(pointAmount),
          type: pointType === 'paid' ? 'purchase' : 'bonus',
          description: description || `管理者による${pointType === 'paid' ? '有料' : '無料'}ポイント追加`,
        });

      if (historyError) throw historyError;

      // ユーザーのポイントを更新
      const { data: currentUser, error: getUserError } = await supabase
        .from('users')
        .select(pointType === 'paid' ? 'points' : 'free_points')
        .eq('id', selectedUserId)
        .single();

      if (getUserError) throw getUserError;

      const currentPoints = pointType === 'paid' 
        ? (currentUser.points || 0)
        : (currentUser.free_points || 0);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          [pointType === 'paid' ? 'points' : 'free_points']: currentPoints + parseInt(pointAmount)
        })
        .eq('id', selectedUserId);

      if (updateError) throw updateError;

      alert(`${pointType === 'paid' ? '有料' : '無料'}ポイントを追加しました`);
      
      // フォームをリセット
      setSelectedUserId('');
      setPointAmount('');
      setDescription('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error adding points:', error);
      alert('ポイントの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ポイント手動追加</h1>

        <div className="bg-gray-800 rounded-lg p-6 space-y-6">
          {/* ポイントタイプ選択 */}
          <div>
            <label className="block text-sm font-medium mb-2">ポイントタイプ</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="paid"
                  checked={pointType === 'paid'}
                  onChange={(e) => setPointType(e.target.value as 'paid')}
                  className="mr-2"
                />
                <span className="text-yellow-400">有料ポイント</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="free"
                  checked={pointType === 'free'}
                  onChange={(e) => setPointType(e.target.value as 'free')}
                  className="mr-2"
                />
                <span className="text-blue-400">無料ポイント</span>
              </label>
            </div>
          </div>

          {/* ユーザー検索 */}
          <div>
            <label className="block text-sm font-medium mb-2">ユーザー検索</label>
            <input
              type="text"
              placeholder="メールアドレスまたは名前で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {/* ユーザー選択 */}
          <div>
            <label className="block text-sm font-medium mb-2">ユーザー選択</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">ユーザーを選択してください</option>
              {filteredUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.display_name || user.email} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* ポイント数入力 */}
          <div>
            <label className="block text-sm font-medium mb-2">追加ポイント数</label>
            <input
              type="number"
              min="1"
              placeholder="例: 1000"
              value={pointAmount}
              onChange={(e) => setPointAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {/* 説明入力 */}
          <div>
            <label className="block text-sm font-medium mb-2">説明（任意）</label>
            <textarea
              placeholder="例: キャンペーン特典"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              rows={3}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-4">
            <button
              onClick={handleAddPoints}
              disabled={loading || !selectedUserId || !pointAmount}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                loading || !selectedUserId || !pointAmount
                  ? 'bg-gray-600 cursor-not-allowed'
                  : pointType === 'paid'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '処理中...' : `${pointType === 'paid' ? '有料' : '無料'}ポイントを追加`}
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
          <h3 className="font-bold text-yellow-400 mb-2">注意事項</h3>
          <ul className="text-sm space-y-1 text-yellow-200">
            <li>• 有料ポイントは課金で取得するポイントです</li>
            <li>• 無料ポイントはキャンペーンなどで付与するポイントです</li>
            <li>• ポイント追加は取り消しできません</li>
            <li>• 追加履歴はpoint_historyテーブルに記録されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}