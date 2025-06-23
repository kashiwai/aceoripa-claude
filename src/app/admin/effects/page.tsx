'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UltimateGachaExperience } from '@/components/effects/UltimateGachaExperience';
import { EmotionalGachaEffects } from '@/components/effects/EmotionalGachaEffects';

export default function EffectsManagementPage() {
  const [showEffect, setShowEffect] = useState(false);
  const [selectedRarity, setSelectedRarity] = useState<'SS' | 'S' | 'A' | 'B' | 'C'>('SS');
  const [selectedEffectType, setSelectedEffectType] = useState<'ultimate' | 'emotional'>('ultimate');
  const [enableSound, setEnableSound] = useState(true);
  const [enableHaptics, setEnableHaptics] = useState(true);

  const testPokemon = {
    SS: { name: 'リザードンex SSR', imageUrl: '/images/pokemon/008_マリオピカチュウ PSA10_PK-0008.jpg' },
    S: { name: 'ピカチュウVMAX', imageUrl: '/images/pokemon/003_アセロラ(エクバ) PSA10_PK-0003.jpg' },
    A: { name: 'ミュウツーV', imageUrl: '/images/pokemon/016_ポンチョを着たピカチュウ(リザ) PSA10_PK-0016.jpg' },
    B: { name: 'イーブイ', imageUrl: '/images/pokemon/009_アセロラ（エクバ）_PK-0009.jpg' },
    C: { name: 'コイキング', imageUrl: '/images/ngcard.jpg' }
  };

  const handleTestEffect = () => {
    setShowEffect(true);
  };

  const handleEffectComplete = () => {
    setShowEffect(false);
  };

  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/admin" className="text-decoration-none">
              管理画面
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            演出管理
          </li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">🎭 ガチャ演出管理</h1>
      </div>

      <div className="row">
        {/* 演出設定パネル */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">演出設定</h5>
            </div>
            <div className="card-body">
              {/* 演出タイプ選択 */}
              <div className="mb-4">
                <label className="form-label">演出タイプ</label>
                <div className="btn-group w-100" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="effectType"
                    id="ultimate"
                    checked={selectedEffectType === 'ultimate'}
                    onChange={() => setSelectedEffectType('ultimate')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="ultimate">
                    🎊 究極演出
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="effectType"
                    id="emotional"
                    checked={selectedEffectType === 'emotional'}
                    onChange={() => setSelectedEffectType('emotional')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="emotional">
                    💖 感動演出
                  </label>
                </div>
                <div className="form-text">
                  究極演出: ストーリー性のある壮大な演出<br/>
                  感動演出: 感情に訴える段階的な演出
                </div>
              </div>

              {/* レアリティ選択 */}
              <div className="mb-4">
                <label className="form-label">レアリティ</label>
                <select
                  className="form-select"
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value as any)}
                >
                  <option value="SS">SS賞 - 超激レア（伝説との遭遇）</option>
                  <option value="S">S賞 - 激レア（特別な絆）</option>
                  <option value="A">A賞 - レア（新たな仲間）</option>
                  <option value="B">B賞 - アンコモン（心の響き）</option>
                  <option value="C">C賞 - コモン（小さな奇跡）</option>
                </select>
              </div>

              {/* オプション設定 */}
              <div className="mb-4">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="enableSound"
                    checked={enableSound}
                    onChange={(e) => setEnableSound(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableSound">
                    🔊 サウンドエフェクトを有効化
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="enableHaptics"
                    checked={enableHaptics}
                    onChange={(e) => setEnableHaptics(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="enableHaptics">
                    📳 バイブレーションを有効化（モバイル）
                  </label>
                </div>
              </div>

              {/* テストボタン */}
              <button
                className="btn btn-primary btn-lg w-100"
                onClick={handleTestEffect}
                disabled={showEffect}
              >
                <i className="bi bi-play-circle me-2"></i>
                演出をテスト
              </button>
            </div>
          </div>

          {/* 演出説明 */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">レアリティ別演出時間</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>レアリティ</th>
                      <th>演出名</th>
                      <th>時間</th>
                      <th>特徴</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge bg-warning">SS賞</span></td>
                      <td>伝説との遭遇</td>
                      <td>12秒</td>
                      <td>虹色エフェクト、壮大なファンファーレ</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-info">S賞</span></td>
                      <td>特別な絆</td>
                      <td>9秒</td>
                      <td>炎のエフェクト、力強い音響</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-primary">A賞</span></td>
                      <td>新たな仲間</td>
                      <td>7秒</td>
                      <td>星のエフェクト、希望の音色</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-success">B賞</span></td>
                      <td>心の響き</td>
                      <td>5秒</td>
                      <td>緑のエフェクト、優しい音</td>
                    </tr>
                    <tr>
                      <td><span className="badge bg-secondary">C賞</span></td>
                      <td>小さな奇跡</td>
                      <td>4秒</td>
                      <td>シンプルなエフェクト</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 演出の特徴 */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">🌟 新演出システムの特徴</h5>
            </div>
            <div className="card-body">
              <div className="accordion" id="featuresAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#feature1">
                      1. 感情の段階的構築
                    </button>
                  </h2>
                  <div id="feature1" className="accordion-collapse collapse show" data-bs-parent="#featuresAccordion">
                    <div className="accordion-body">
                      <ul>
                        <li><strong>前奏</strong>：雰囲気作り</li>
                        <li><strong>期待</strong>：ドキドキ感の演出</li>
                        <li><strong>緊張</strong>：ハラハラ感の高まり</li>
                        <li><strong>クライマックス</strong>：最高潮の瞬間</li>
                        <li><strong>開示</strong>：カードが現れる驚き</li>
                        <li><strong>余韻</strong>：感動と満足感</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#feature2">
                      2. 五感に訴える体験
                    </button>
                  </h2>
                  <div id="feature2" className="accordion-collapse collapse" data-bs-parent="#featuresAccordion">
                    <div className="accordion-body">
                      <ul>
                        <li><strong>視覚</strong>：段階的パーティクル、色彩変化、3D効果</li>
                        <li><strong>聴覚</strong>：心拍音、ドラムロール、ファンファーレ</li>
                        <li><strong>触覚</strong>：モバイルでのバイブレーション</li>
                        <li><strong>時間</strong>：絶妙なタイミング制御</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#feature3">
                      3. ストーリー性のある演出
                    </button>
                  </h2>
                  <div id="feature3" className="accordion-collapse collapse" data-bs-parent="#featuresAccordion">
                    <div className="accordion-body">
                      <p>各レアリティに応じた物語性：</p>
                      <ul>
                        <li><strong>SS賞</strong>：「遥か彼方から響く神秘の調べ...」</li>
                        <li><strong>S賞</strong>：「心の奥で何かが呼んでいる...」</li>
                        <li><strong>A賞</strong>：「新しい出会いの予感...」</li>
                        <li>感情に訴えるテキスト演出で体験を深化</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#feature4">
                      4. 技術的特徴
                    </button>
                  </h2>
                  <div id="feature4" className="accordion-collapse collapse" data-bs-parent="#featuresAccordion">
                    <div className="accordion-body">
                      <ul>
                        <li>Web Audio APIによるリアルタイム音声生成</li>
                        <li>Canvas APIによる高性能パーティクルシステム</li>
                        <li>Framer Motionによる滑らかなアニメーション</li>
                        <li>モバイル最適化された軽量設計</li>
                        <li>スキップ機能による柔軟な体験</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">📊 演出効果の統計（想定）</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6 mb-3">
                  <div className="h3 text-primary">+45%</div>
                  <div className="small text-muted">ユーザー満足度</div>
                </div>
                <div className="col-6 mb-3">
                  <div className="h3 text-success">+30%</div>
                  <div className="small text-muted">リピート率</div>
                </div>
                <div className="col-6">
                  <div className="h3 text-warning">+25%</div>
                  <div className="small text-muted">シェア率</div>
                </div>
                <div className="col-6">
                  <div className="h3 text-info">+60%</div>
                  <div className="small text-muted">感動体験</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 演出プレビュー */}
      {showEffect && (
        <>
          {selectedEffectType === 'ultimate' ? (
            <UltimateGachaExperience
              pokemonName={testPokemon[selectedRarity].name}
              rarity={selectedRarity}
              cardImageUrl={testPokemon[selectedRarity].imageUrl}
              onComplete={handleEffectComplete}
              enableHaptics={enableHaptics}
              enableSound={enableSound}
              autoPlay={true}
            />
          ) : (
            <EmotionalGachaEffects
              pokemonName={testPokemon[selectedRarity].name}
              rarity={selectedRarity}
              cardImageUrl={testPokemon[selectedRarity].imageUrl}
              onComplete={handleEffectComplete}
              enableHaptics={enableHaptics}
            />
          )}
        </>
      )}
    </div>
  );
}