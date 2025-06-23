'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { CurrencyYenIcon, PlusIcon, PencilIcon, TrashIcon, GiftIcon } from '@heroicons/react/24/outline';

interface PointPackage {
  id: string;
  name: string;
  points: number;
  bonus: number;
  price: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface FreePointSetting {
  id: string;
  type: string;
  points: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PaymentsPage() {
  const supabase = createClientComponentClient();
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [freePointSettings, setFreePointSettings] = useState<FreePointSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFreePointModal, setShowFreePointModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<PointPackage> | null>(null);
  const [editingFreePoint, setEditingFreePoint] = useState<Partial<FreePointSetting> | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'free-points'>('packages');

  useEffect(() => {
    fetchPackages();
    fetchFreePointSettings();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('point_packages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('パッケージの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchFreePointSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('free_point_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFreePointSettings(data || []);
    } catch (error) {
      console.error('Error fetching free point settings:', error);
      toast.error('無料ポイント設定の取得に失敗しました');
    }
  };

  const handleSavePackage = async () => {
    if (!editingPackage) return;

    try {
      if (editingPackage.id) {
        // 更新
        const { error } = await supabase
          .from('point_packages')
          .update({
            name: editingPackage.name,
            points: editingPackage.points,
            bonus: editingPackage.bonus,
            price: editingPackage.price,
            is_popular: editingPackage.is_popular,
            is_active: editingPackage.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingPackage.id);

        if (error) throw error;
        toast.success('パッケージを更新しました');
      } else {
        // 新規作成
        const { error } = await supabase
          .from('point_packages')
          .insert({
            name: editingPackage.name,
            points: editingPackage.points || 0,
            bonus: editingPackage.bonus || 0,
            price: editingPackage.price || 0,
            is_popular: editingPackage.is_popular || false,
            is_active: editingPackage.is_active !== false,
            sort_order: packages.length,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('パッケージを作成しました');
      }

      setShowEditModal(false);
      setEditingPackage(null);
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error('保存に失敗しました');
    }
  };

  const handleSaveFreePoint = async () => {
    if (!editingFreePoint) return;

    try {
      if (editingFreePoint.id) {
        // 更新
        const { error } = await supabase
          .from('free_point_settings')
          .update({
            type: editingFreePoint.type,
            points: editingFreePoint.points,
            description: editingFreePoint.description,
            is_active: editingFreePoint.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFreePoint.id);

        if (error) throw error;
        toast.success('無料ポイント設定を更新しました');
      } else {
        // 新規作成
        const { error } = await supabase
          .from('free_point_settings')
          .insert({
            type: editingFreePoint.type,
            points: editingFreePoint.points || 0,
            description: editingFreePoint.description || '',
            is_active: editingFreePoint.is_active !== false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('無料ポイント設定を作成しました');
      }

      setShowFreePointModal(false);
      setEditingFreePoint(null);
      fetchFreePointSettings();
    } catch (error) {
      console.error('Error saving free point setting:', error);
      toast.error('保存に失敗しました');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('このパッケージを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('point_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('パッケージを削除しました');
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('削除に失敗しました');
    }
  };

  const handleDeleteFreePoint = async (id: string) => {
    if (!confirm('この無料ポイント設定を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('free_point_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('無料ポイント設定を削除しました');
      fetchFreePointSettings();
    } catch (error) {
      console.error('Error deleting free point setting:', error);
      toast.error('削除に失敗しました');
    }
  };

  const togglePackageActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('point_packages')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(isActive ? 'パッケージを非公開にしました' : 'パッケージを公開しました');
      fetchPackages();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('更新に失敗しました');
    }
  };

  const toggleFreePointActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('free_point_settings')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(isActive ? '無料ポイント設定を無効にしました' : '無料ポイント設定を有効にしました');
      fetchFreePointSettings();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error('更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">決済管理</h1>

      {/* タブ */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'packages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            決済パッケージ
          </button>
          <button
            onClick={() => setActiveTab('free-points')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'free-points'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            無料ポイント設定
          </button>
        </nav>
      </div>

      {/* 決済パッケージタブ */}
      {activeTab === 'packages' && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setEditingPackage({
                  name: '',
                  points: 0,
                  bonus: 0,
                  price: 0,
                  is_popular: false,
                  is_active: true,
                });
                setShowEditModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              新規パッケージ作成
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    パッケージ名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ポイント
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    価格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    1ポイントあたり
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packages.map((pkg) => {
                  const totalPoints = pkg.points + pkg.bonus;
                  const pricePerPoint = pkg.price / totalPoints;
                  
                  return (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                          {pkg.is_popular && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              人気
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {totalPoints.toLocaleString()}ポイント
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="text-xs text-gray-500">
                            ({pkg.points.toLocaleString()} + {pkg.bonus.toLocaleString()}ボーナス)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ¥{pkg.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ¥{pricePerPoint.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePackageActive(pkg.id, pkg.is_active)}
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            pkg.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {pkg.is_active ? '公開中' : '非公開'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setEditingPackage(pkg);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 無料ポイント設定タブ */}
      {activeTab === 'free-points' && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setEditingFreePoint({
                  type: '',
                  points: 0,
                  description: '',
                  is_active: true,
                });
                setShowFreePointModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <GiftIcon className="h-5 w-5 mr-2" />
              新規無料ポイント設定
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    付与ポイント
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    説明
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {freePointSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {setting.type === 'signup' && '新規登録ボーナス'}
                        {setting.type === 'daily' && 'デイリーボーナス'}
                        {setting.type === 'campaign' && 'キャンペーン'}
                        {setting.type === 'referral' && '友達紹介'}
                        {!['signup', 'daily', 'campaign', 'referral'].includes(setting.type) && setting.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {setting.points.toLocaleString()}ポイント
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {setting.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFreePointActive(setting.id, setting.is_active)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          setting.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {setting.is_active ? '有効' : '無効'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setEditingFreePoint(setting);
                          setShowFreePointModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFreePoint(setting.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 決済統計 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">今月の売上</p>
              <p className="text-2xl font-bold text-gray-900">¥0</p>
            </div>
            <CurrencyYenIcon className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">今月の決済数</p>
              <p className="text-2xl font-bold text-gray-900">0件</p>
            </div>
            <CurrencyYenIcon className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">平均決済額</p>
              <p className="text-2xl font-bold text-gray-900">¥0</p>
            </div>
            <CurrencyYenIcon className="h-12 w-12 text-gray-400" />
          </div>
        </div>
      </div>

      {/* パッケージ編集モーダル */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPackage?.id ? 'パッケージ編集' : '新規パッケージ作成'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  パッケージ名
                </label>
                <input
                  type="text"
                  value={editingPackage?.name || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="例: 150ポイントパック"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    基本ポイント
                  </label>
                  <input
                    type="number"
                    value={editingPackage?.points || 0}
                    onChange={(e) => setEditingPackage({ ...editingPackage, points: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ボーナスポイント
                  </label>
                  <input
                    type="number"
                    value={editingPackage?.bonus || 0}
                    onChange={(e) => setEditingPackage({ ...editingPackage, bonus: Number(e.target.value) })}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格（円）
                </label>
                <input
                  type="number"
                  value={editingPackage?.price || 0}
                  onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPackage?.is_popular || false}
                    onChange={(e) => setEditingPackage({ ...editingPackage, is_popular: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">人気パッケージとして表示</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPackage?.is_active !== false}
                    onChange={(e) => setEditingPackage({ ...editingPackage, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">公開する</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPackage(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSavePackage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 無料ポイント編集モーダル */}
      {showFreePointModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingFreePoint?.id ? '無料ポイント設定編集' : '新規無料ポイント設定'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  タイプ
                </label>
                <select
                  value={editingFreePoint?.type || ''}
                  onChange={(e) => setEditingFreePoint({ ...editingFreePoint, type: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="signup">新規登録ボーナス</option>
                  <option value="daily">デイリーボーナス</option>
                  <option value="campaign">キャンペーン</option>
                  <option value="referral">友達紹介</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付与ポイント
                </label>
                <input
                  type="number"
                  value={editingFreePoint?.points || 0}
                  onChange={(e) => setEditingFreePoint({ ...editingFreePoint, points: Number(e.target.value) })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  value={editingFreePoint?.description || ''}
                  onChange={(e) => setEditingFreePoint({ ...editingFreePoint, description: e.target.value })}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="例: 新規登録時に付与される無料ポイント"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingFreePoint?.is_active !== false}
                    onChange={(e) => setEditingFreePoint({ ...editingFreePoint, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">有効にする</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFreePointModal(false);
                  setEditingFreePoint(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveFreePoint}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}