'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Play, Download, Settings, Trash2, Edit, Plus } from 'lucide-react';

interface VideoEffect {
  id: string;
  name: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  effects: string[];
  duration: number;
  previewUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export default function VideoEffectsPage() {
  const [effects, setEffects] = useState<VideoEffect[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<VideoEffect | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newEffect, setNewEffect] = useState({
    name: '',
    rarity: 'N' as const,
    effects: [''],
    duration: 3
  });

  // サンプル動画エフェクト設定
  useEffect(() => {
    const sampleEffects: VideoEffect[] = [
      {
        id: 'ssr-rainbow',
        name: 'SSR レインボー爆発',
        rarity: 'SSR',
        effects: ['rainbow-particles', 'zoom-burst', 'rotation-spiral'],
        duration: 8,
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        id: 'sr-fire',
        name: 'SR 炎バースト',
        rarity: 'SR',
        effects: ['fire-particles', 'shake-effect', 'orange-glow'],
        duration: 5,
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        id: 'r-water',
        name: 'R 水流リップル',
        rarity: 'R',
        effects: ['water-ripples', 'blue-particles', 'gentle-sway'],
        duration: 3,
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        id: 'n-simple',
        name: 'N シンプルグロー',
        rarity: 'N',
        effects: ['simple-glow', 'fade-in'],
        duration: 2,
        isActive: true,
        createdAt: '2024-01-15'
      }
    ];
    setEffects(sampleEffects);
  }, []);

  // プレビュー生成
  const generatePreview = async (effect: VideoEffect) => {
    setIsGenerating(true);
    setSelectedEffect(effect);
    
    try {
      const response = await fetch('/api/ai-video-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemonName: 'ピカチュウ',
          pokemonType: 'electric',
          rarity: effect.rarity,
          preferredService: 'openai'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // エフェクトにプレビューURLを追加
        setEffects(prev => prev.map(e => 
          e.id === effect.id 
            ? { ...e, previewUrl: data.data.thumbnail_url }
            : e
        ));
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setIsGenerating(false);
      setSelectedEffect(null);
    }
  };

  // エフェクト追加
  const addEffect = () => {
    const newId = `custom-${Date.now()}`;
    const effect: VideoEffect = {
      id: newId,
      name: newEffect.name,
      rarity: newEffect.rarity,
      effects: newEffect.effects.filter(e => e.trim() !== ''),
      duration: newEffect.duration,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setEffects(prev => [...prev, effect]);
    setNewEffect({
      name: '',
      rarity: 'N',
      effects: [''],
      duration: 3
    });
  };

  // エフェクト削除
  const deleteEffect = (id: string) => {
    if (confirm('このエフェクト設定を削除しますか？')) {
      setEffects(prev => prev.filter(e => e.id !== id));
    }
  };

  // エフェクト切り替え
  const toggleEffect = (id: string) => {
    setEffects(prev => prev.map(e => 
      e.id === id ? { ...e, isActive: !e.isActive } : e
    ));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'SR': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'R': return 'bg-gradient-to-r from-blue-500 to-purple-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">動画演出管理</h1>
          <p className="text-muted-foreground">ガチャ動画エフェクトの設定と管理</p>
        </div>
        <Badge variant="outline" className="bg-green-50">
          {effects.filter(e => e.isActive).length} / {effects.length} アクティブ
        </Badge>
      </div>

      {/* 新規エフェクト追加 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus size={20} />
            新規エフェクト追加
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">エフェクト名</label>
              <Input
                value={newEffect.name}
                onChange={(e) => setNewEffect({...newEffect, name: e.target.value})}
                placeholder="例: カスタムエフェクト"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">レアリティ</label>
              <select
                className="w-full p-2 border rounded"
                value={newEffect.rarity}
                onChange={(e) => setNewEffect({...newEffect, rarity: e.target.value as any})}
              >
                <option value="SSR">SSR</option>
                <option value="SR">SR</option>
                <option value="R">R</option>
                <option value="N">N</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">継続時間（秒）</label>
              <Input
                type="number"
                value={newEffect.duration}
                onChange={(e) => setNewEffect({...newEffect, duration: parseInt(e.target.value)})}
                min="1"
                max="10"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={addEffect} disabled={!newEffect.name}>
                <Plus size={16} className="mr-2" />
                追加
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">エフェクト種類</label>
            <div className="space-y-2">
              {newEffect.effects.map((effect, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={effect}
                    onChange={(e) => {
                      const newEffects = [...newEffect.effects];
                      newEffects[index] = e.target.value;
                      setNewEffect({...newEffect, effects: newEffects});
                    }}
                    placeholder="例: rainbow-particles"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newEffects = [...newEffect.effects, ''];
                      setNewEffect({...newEffect, effects: newEffects});
                    }}
                  >
                    +
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* エフェクト一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {effects.map((effect) => (
          <Card key={effect.id} className={`transition-all ${effect.isActive ? 'ring-2 ring-blue-500' : 'opacity-60'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{effect.name}</CardTitle>
                  <Badge className={`${getRarityColor(effect.rarity)} text-white text-xs`}>
                    {effect.rarity}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEffect(effect.id)}
                  >
                    <Settings size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEffect(effect.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">継続時間: {effect.duration}秒</p>
                <p className="text-sm text-muted-foreground">作成日: {effect.createdAt}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">エフェクト:</p>
                <div className="flex flex-wrap gap-1">
                  {effect.effects.map((eff, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {eff}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {effect.previewUrl && (
                <div>
                  <img
                    src={effect.previewUrl}
                    alt="プレビュー"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePreview(effect)}
                  disabled={isGenerating && selectedEffect?.id === effect.id}
                  className="flex-1"
                >
                  {isGenerating && selectedEffect?.id === effect.id ? (
                    <>生成中...</>
                  ) : (
                    <>
                      <Play size={14} className="mr-1" />
                      プレビュー
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: テスト動画ダウンロード
                    alert('テスト動画のダウンロード機能は実装中です');
                  }}
                >
                  <Download size={14} />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                状態: {effect.isActive ? '🟢 アクティブ' : '🔴 無効'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 利用可能エフェクト一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>利用可能エフェクト一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold text-yellow-600 mb-2">SSR エフェクト</h4>
              <ul className="text-sm space-y-1">
                <li>• rainbow-particles</li>
                <li>• zoom-burst</li>
                <li>• rotation-spiral</li>
                <li>• holographic-glow</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">SR エフェクト</h4>
              <ul className="text-sm space-y-1">
                <li>• fire-particles</li>
                <li>• shake-effect</li>
                <li>• orange-glow</li>
                <li>• lightning-flash</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">R エフェクト</h4>
              <ul className="text-sm space-y-1">
                <li>• water-ripples</li>
                <li>• blue-particles</li>
                <li>• gentle-sway</li>
                <li>• crystal-shine</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-600 mb-2">N エフェクト</h4>
              <ul className="text-sm space-y-1">
                <li>• simple-glow</li>
                <li>• fade-in</li>
                <li>• soft-particles</li>
                <li>• basic-animation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* システム情報 */}
      <Card>
        <CardHeader>
          <CardTitle>システム情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">OpenAI DALL-E 3</h4>
              <p className="text-sm text-green-600">✅ 接続済み</p>
              <p className="text-xs text-green-500">高品質画像生成</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Canvas動画生成</h4>
              <p className="text-sm text-blue-600">✅ 利用可能</p>
              <p className="text-xs text-blue-500">WebM形式 / 9:16</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Leonardo.ai</h4>
              <p className="text-sm text-yellow-600">⚠️ 設定中</p>
              <p className="text-xs text-yellow-500">フォールバック機能</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}