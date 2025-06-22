'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Zap, Image, Video, Download, Settings, RefreshCw } from 'lucide-react';

interface GenerationJob {
  id: string;
  type: 'image' | 'video';
  pokemonName: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  service: 'OpenAI' | 'Leonardo' | 'Local';
  createdAt: string;
  completedAt?: string;
}

export default function AIGeneratorPage() {
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [newGeneration, setNewGeneration] = useState({
    type: 'image' as 'image' | 'video',
    pokemonName: '',
    rarity: 'N' as const,
    customPrompt: ''
  });
  const [apiStatus, setApiStatus] = useState({
    openai: 'unknown',
    leonardo: 'unknown',
    local: 'available'
  });

  // API状態確認
  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      // OpenAI状態確認
      const openaiResponse = await fetch('/api/test-openai');
      const openaiData = await openaiResponse.json();
      
      setApiStatus(prev => ({
        ...prev,
        openai: openaiData.success ? 'available' : 'error'
      }));
    } catch (error) {
      setApiStatus(prev => ({ ...prev, openai: 'error' }));
    }
  };

  // 生成実行
  const startGeneration = async () => {
    if (!newGeneration.pokemonName) {
      alert('ポケモン名を入力してください');
      return;
    }

    setIsGenerating(true);
    
    const jobId = `job_${Date.now()}`;
    const newJob: GenerationJob = {
      id: jobId,
      type: newGeneration.type,
      pokemonName: newGeneration.pokemonName,
      rarity: newGeneration.rarity,
      prompt: newGeneration.customPrompt || `${newGeneration.pokemonName} Pokemon, ${newGeneration.rarity} rarity`,
      status: 'pending',
      service: 'OpenAI',
      createdAt: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);

    try {
      let endpoint = newGeneration.type === 'image' ? '/api/test-openai' : '/api/ai-video-generate';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemonName: newGeneration.pokemonName,
          pokemonType: 'electric', // デフォルト
          rarity: newGeneration.rarity,
          prompt: newJob.prompt
        })
      });

      const data = await response.json();

      if (data.success) {
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? {
                ...job,
                status: 'completed',
                result: newGeneration.type === 'image' ? data.imageUrl : data.data.thumbnail_url,
                completedAt: new Date().toISOString()
              }
            : job
        ));
      } else {
        throw new Error(data.error || '生成に失敗しました');
      }
    } catch (error) {
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'failed' }
          : job
      ));
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ジョブ削除
  const deleteJob = (id: string) => {
    if (confirm('この生成履歴を削除しますか？')) {
      setJobs(prev => prev.filter(job => job.id !== id));
    }
  };

  // ジョブ再実行
  const retryJob = async (job: GenerationJob) => {
    const retryJob = {
      ...job,
      id: `retry_${Date.now()}`,
      status: 'pending' as const,
      result: undefined,
      createdAt: new Date().toISOString(),
      completedAt: undefined
    };

    setJobs(prev => [retryJob, ...prev]);
    // TODO: 再実行ロジック
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI生成管理</h1>
          <p className="text-muted-foreground">画像・動画のAI生成とアセット管理</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50">
            画像: {jobs.filter(j => j.type === 'image' && j.status === 'completed').length}
          </Badge>
          <Badge variant="outline" className="bg-purple-50">
            動画: {jobs.filter(j => j.type === 'video' && j.status === 'completed').length}
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">ダッシュボード</TabsTrigger>
          <TabsTrigger value="generate">新規生成</TabsTrigger>
          <TabsTrigger value="history">生成履歴</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        {/* ダッシュボード */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* API状態 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                API状態
                <Button variant="ghost" size="sm" onClick={checkAPIStatus}>
                  <RefreshCw size={16} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">OpenAI DALL-E 3</h4>
                  <p className={`text-sm ${getApiStatusColor(apiStatus.openai)}`}>
                    {apiStatus.openai === 'available' ? '✅ 利用可能' : 
                     apiStatus.openai === 'error' ? '❌ エラー' : '⏳ 確認中'}
                  </p>
                  <p className="text-xs text-muted-foreground">高品質画像生成</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">Leonardo.ai</h4>
                  <p className="text-sm text-yellow-600">⚠️ 設定中</p>
                  <p className="text-xs text-muted-foreground">動画生成フォールバック</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">ローカル処理</h4>
                  <p className="text-sm text-green-600">✅ 利用可能</p>
                  <p className="text-xs text-muted-foreground">Canvas動画レンダリング</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 統計 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {jobs.filter(j => j.type === 'image').length}
                </div>
                <p className="text-sm text-muted-foreground">画像生成総数</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {jobs.filter(j => j.type === 'video').length}
                </div>
                <p className="text-sm text-muted-foreground">動画生成総数</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {jobs.filter(j => j.status === 'completed').length}
                </div>
                <p className="text-sm text-muted-foreground">成功数</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {jobs.filter(j => j.status === 'failed').length}
                </div>
                <p className="text-sm text-muted-foreground">失敗数</p>
              </CardContent>
            </Card>
          </div>

          {/* 最近のジョブ */}
          <Card>
            <CardHeader>
              <CardTitle>最近の生成</CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getStatusIcon(job.status)}</span>
                    <div>
                      <p className="font-medium">{job.pokemonName} ({job.rarity})</p>
                      <p className="text-sm text-muted-foreground">{job.type} - {job.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{new Date(job.createdAt).toLocaleString()}</p>
                    <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">生成履歴がありません</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 新規生成 */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>新規AI生成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">生成タイプ</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newGeneration.type}
                    onChange={(e) => setNewGeneration({...newGeneration, type: e.target.value as any})}
                  >
                    <option value="image">画像生成</option>
                    <option value="video">動画生成</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">レアリティ</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newGeneration.rarity}
                    onChange={(e) => setNewGeneration({...newGeneration, rarity: e.target.value as any})}
                  >
                    <option value="SSR">SSR (最高品質)</option>
                    <option value="SR">SR (高品質)</option>
                    <option value="R">R (標準)</option>
                    <option value="N">N (シンプル)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">ポケモン名</label>
                <Input
                  value={newGeneration.pokemonName}
                  onChange={(e) => setNewGeneration({...newGeneration, pokemonName: e.target.value})}
                  placeholder="例: ピカチュウ"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">カスタムプロンプト（オプション）</label>
                <textarea
                  className="w-full p-2 border rounded h-24"
                  value={newGeneration.customPrompt}
                  onChange={(e) => setNewGeneration({...newGeneration, customPrompt: e.target.value})}
                  placeholder="カスタムプロンプトを入力（空白の場合は自動生成）"
                />
              </div>
              
              <Button
                onClick={startGeneration}
                disabled={isGenerating || !newGeneration.pokemonName}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    {newGeneration.type === 'image' ? <Image size={16} className="mr-2" /> : <Video size={16} className="mr-2" />}
                    {newGeneration.type === 'image' ? '画像' : '動画'}生成開始
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生成履歴 */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {job.type === 'image' ? <Image size={16} /> : <Video size={16} />}
                        {job.pokemonName}
                      </CardTitle>
                      <Badge className={`text-xs ${
                        job.rarity === 'SSR' ? 'bg-yellow-500' :
                        job.rarity === 'SR' ? 'bg-orange-500' :
                        job.rarity === 'R' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}>
                        {job.rarity}
                      </Badge>
                    </div>
                    <span className="text-xl">{getStatusIcon(job.status)}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {job.result && (
                    <div>
                      <img
                        src={job.result}
                        alt="生成結果"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  <div className="text-sm space-y-1">
                    <p><strong>サービス:</strong> {job.service}</p>
                    <p><strong>作成:</strong> {new Date(job.createdAt).toLocaleString()}</p>
                    {job.completedAt && (
                      <p><strong>完了:</strong> {new Date(job.completedAt).toLocaleString()}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {job.status === 'failed' && (
                      <Button variant="outline" size="sm" onClick={() => retryJob(job)}>
                        <RefreshCw size={14} className="mr-1" />
                        再実行
                      </Button>
                    )}
                    
                    {job.result && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.result} download target="_blank">
                          <Download size={14} className="mr-1" />
                          DL
                        </a>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteJob(job.id)}
                      className="text-red-500"
                    >
                      削除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {jobs.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">生成履歴がありません</p>
                <p className="text-sm text-muted-foreground mt-2">「新規生成」タブから画像・動画を生成してください</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 設定 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">OpenAI API</h4>
                <p className="text-sm text-muted-foreground">DALL-E 3による高品質画像生成</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={checkAPIStatus}>
                    接続テスト
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/test-openai-api.html" target="_blank">
                      詳細テスト
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Leonardo.ai API</h4>
                <p className="text-sm text-muted-foreground">動画生成フォールバック（設定中）</p>
                <Button variant="outline" disabled>
                  設定画面（準備中）
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">ローカル処理</h4>
                <p className="text-sm text-muted-foreground">Canvas APIによる動画レンダリング</p>
                <Button variant="outline" asChild>
                  <a href="/test-canvas-video.html" target="_blank">
                    Canvas動画テスト
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>品質設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">デフォルト画像サイズ</label>
                  <select className="w-full p-2 border rounded">
                    <option value="1024x1792">1024x1792 (9:16)</option>
                    <option value="1024x1024">1024x1024 (1:1)</option>
                    <option value="1792x1024">1792x1024 (16:9)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">動画品質</label>
                  <select className="w-full p-2 border rounded">
                    <option value="hd">HD (推奨)</option>
                    <option value="standard">標準</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}