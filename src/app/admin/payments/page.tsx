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
      <div className="d-flex justify-content-center align-items-center" style={{height: '200px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">決済管理</h1>
      </div>

      {/* タブ */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('packages')}
            className={`nav-link ${
              activeTab === 'packages' ? 'active' : ''
            }`}
          >
            決済パッケージ
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('free-points')}
            className={`nav-link ${
              activeTab === 'free-points' ? 'active' : ''
            }`}
          >
            無料ポイント設定
          </button>
        </li>
      </ul>

      {/* 決済パッケージタブ */}
      {activeTab === 'packages' && (
        <>
          <div className="d-flex justify-content-end mb-4">
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
              className="btn btn-primary"
            >
              ➕ 新規パッケージ作成
            </button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>パッケージ名</th>
                      <th>ポイント</th>
                      <th>価格</th>
                      <th>1ポイントあたり</th>
                      <th>ステータス</th>
                      <th>アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => {
                      const totalPoints = pkg.points + pkg.bonus;
                      const pricePerPoint = pkg.price / totalPoints;
                      
                      return (
                        <tr key={pkg.id}>
                          <td>
                            <div>
                              <div className="fw-medium">{pkg.name}</div>
                              {pkg.is_popular && (
                                <span className="badge bg-warning text-dark">
                                  人気
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              {totalPoints.toLocaleString()}ポイント
                            </div>
                            {pkg.bonus > 0 && (
                              <small className="text-muted">
                                ({pkg.points.toLocaleString()} + {pkg.bonus.toLocaleString()}ボーナス)
                              </small>
                            )}
                          </td>
                          <td>
                            ¥{pkg.price.toLocaleString()}
                          </td>
                          <td>
                            ¥{pricePerPoint.toFixed(2)}
                          </td>
                          <td>
                            <button
                              onClick={() => togglePackageActive(pkg.id, pkg.is_active)}
                              className={`badge ${
                                pkg.is_active
                                  ? 'bg-success'
                                  : 'bg-secondary'
                              } text-decoration-none border-0 cursor-pointer`}
                            >
                              {pkg.is_active ? '公開中' : '非公開'}
                            </button>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                onClick={() => {
                                  setEditingPackage(pkg);
                                  setShowEditModal(true);
                                }}
                                className="btn btn-outline-primary"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeletePackage(pkg.id)}
                                className="btn btn-outline-danger"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 無料ポイント設定タブ */}
      {activeTab === 'free-points' && (
        <>
          <div className="d-flex justify-content-end mb-4">
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
              className="btn btn-success"
            >
              🎁 新規無料ポイント設定
            </button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>タイプ</th>
                      <th>付与ポイント</th>
                      <th>説明</th>
                      <th>ステータス</th>
                      <th>アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freePointSettings.map((setting) => (
                      <tr key={setting.id}>
                        <td>
                          <div className="fw-medium">
                            {setting.type === 'signup' && '新規登録ボーナス'}
                            {setting.type === 'daily' && 'デイリーボーナス'}
                            {setting.type === 'campaign' && 'キャンペーン'}
                            {setting.type === 'referral' && '友達紹介'}
                            {!['signup', 'daily', 'campaign', 'referral'].includes(setting.type) && setting.type}
                          </div>
                        </td>
                        <td>
                          {setting.points.toLocaleString()}ポイント
                        </td>
                        <td>
                          {setting.description}
                        </td>
                        <td>
                          <button
                            onClick={() => toggleFreePointActive(setting.id, setting.is_active)}
                            className={`badge ${
                              setting.is_active
                                ? 'bg-success'
                                : 'bg-secondary'
                            } text-decoration-none border-0 cursor-pointer`}
                          >
                            {setting.is_active ? '有効' : '無効'}
                          </button>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => {
                                setEditingFreePoint(setting);
                                setShowFreePointModal(true);
                              }}
                              className="btn btn-outline-primary"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteFreePoint(setting.id)}
                              className="btn btn-outline-danger"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 決済統計 */}
      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h5 className="card-title">今月の売上</h5>
              <h2 className="mb-0">¥0</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h5 className="card-title">今月の決済数</h5>
              <h2 className="mb-0">0件</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h5 className="card-title">平均決済額</h5>
              <h2 className="mb-0">¥0</h2>
            </div>
          </div>
        </div>
      </div>

      {/* パッケージ編集モーダル */}
      {showEditModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPackage?.id ? 'パッケージ編集' : '新規パッケージ作成'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPackage(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">パッケージ名</label>
                  <input
                    type="text"
                    value={editingPackage?.name || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    className="form-control"
                    placeholder="例: 150ポイントパック"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">基本ポイント</label>
                    <input
                      type="number"
                      value={editingPackage?.points || 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, points: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">ボーナスポイント</label>
                    <input
                      type="number"
                      value={editingPackage?.bonus || 0}
                      onChange={(e) => setEditingPackage({ ...editingPackage, bonus: Number(e.target.value) })}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">価格（円）</label>
                  <input
                    type="number"
                    value={editingPackage?.price || 0}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={editingPackage?.is_popular || false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, is_popular: e.target.checked })}
                      className="form-check-input"
                      id="is_popular"
                    />
                    <label className="form-check-label" htmlFor="is_popular">
                      人気パッケージとして表示
                    </label>
                  </div>
                  
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={editingPackage?.is_active !== false}
                      onChange={(e) => setEditingPackage({ ...editingPackage, is_active: e.target.checked })}
                      className="form-check-input"
                      id="is_active"
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      公開する
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPackage(null);
                  }}
                  className="btn btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSavePackage}
                  className="btn btn-primary"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 無料ポイント編集モーダル */}
      {showFreePointModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingFreePoint?.id ? '無料ポイント設定編集' : '新規無料ポイント設定'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowFreePointModal(false);
                    setEditingFreePoint(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">タイプ</label>
                  <select
                    value={editingFreePoint?.type || ''}
                    onChange={(e) => setEditingFreePoint({ ...editingFreePoint, type: e.target.value })}
                    className="form-select"
                  >
                    <option value="">選択してください</option>
                    <option value="signup">新規登録ボーナス</option>
                    <option value="daily">デイリーボーナス</option>
                    <option value="campaign">キャンペーン</option>
                    <option value="referral">友達紹介</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">付与ポイント</label>
                  <input
                    type="number"
                    value={editingFreePoint?.points || 0}
                    onChange={(e) => setEditingFreePoint({ ...editingFreePoint, points: Number(e.target.value) })}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">説明</label>
                  <textarea
                    value={editingFreePoint?.description || ''}
                    onChange={(e) => setEditingFreePoint({ ...editingFreePoint, description: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="例: 新規登録時に付与される無料ポイント"
                  />
                </div>

                <div className="form-check">
                  <input
                    type="checkbox"
                    checked={editingFreePoint?.is_active !== false}
                    onChange={(e) => setEditingFreePoint({ ...editingFreePoint, is_active: e.target.checked })}
                    className="form-check-input"
                    id="free_point_active"
                  />
                  <label className="form-check-label" htmlFor="free_point_active">
                    有効にする
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowFreePointModal(false);
                    setEditingFreePoint(null);
                  }}
                  className="btn btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveFreePoint}
                  className="btn btn-success"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}