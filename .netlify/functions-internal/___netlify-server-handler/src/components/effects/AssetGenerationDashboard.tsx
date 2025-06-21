'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GenerationOrder {
  id: string;
  category: 'background' | 'effect' | 'object' | 'ui' | 'particle';
  tool: 'dalle3' | 'midjourney' | 'leonardo';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  prompt: string;
  resultUrl?: string;
  estimatedTime?: string;
  createdAt: Date;
}

interface AssetTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  tool: string;
  priority: string;
}

const assetTemplates: AssetTemplate[] = [
  // SSR Effects
  {
    id: 'ssr-01',
    name: 'SSR虹色オーラ爆発',
    category: 'effect',
    prompt: 'Explosive rainbow aura effect, iridescent prismatic light rays...',
    tool: 'dalle3',
    priority: 'urgent'
  },
  {
    id: 'ssr-02',
    name: 'SSR虹色螺旋エネルギー',
    category: 'effect',
    prompt: 'Spiraling rainbow energy vortex, prismatic light trails...',
    tool: 'dalle3',
    priority: 'urgent'
  },
  // SR Effects
  {
    id: 'sr-01',
    name: 'SR爆炎エフェクト',
    category: 'effect',
    prompt: 'Explosive fire burst effect, intense orange red flames...',
    tool: 'leonardo',
    priority: 'high'
  },
  // Backgrounds
  {
    id: 'bg-01',
    name: '古代神殿の宝物庫',
    category: 'background',
    prompt: 'Ancient temple treasure chamber, golden pillars...',
    tool: 'midjourney',
    priority: 'high'
  },
  {
    id: 'bg-02',
    name: '宇宙の祭壇',
    category: 'background',
    prompt: 'Cosmic altar in deep space, floating platform...',
    tool: 'midjourney',
    priority: 'high'
  }
];

export const AssetGenerationDashboard = () => {
  const [orders, setOrders] = useState<GenerationOrder[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AssetTemplate | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');

  // 進行状況のシミュレーション
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => prev.map(order => {
        if (order.status === 'processing' && order.progress < 100) {
          const newProgress = Math.min(order.progress + Math.random() * 10, 100);
          if (newProgress >= 100) {
            return { ...order, progress: 100, status: 'completed' };
          }
          return { ...order, progress: newProgress };
        }
        return order;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createOrder = () => {
    if (!selectedTemplate) return;

    const newOrder: GenerationOrder = {
      id: `order-${Date.now()}`,
      category: selectedTemplate.category as any,
      tool: selectedTemplate.tool as any,
      priority: selectedTemplate.priority as any,
      status: 'pending',
      progress: 0,
      prompt: customPrompt || selectedTemplate.prompt,
      createdAt: new Date(),
      estimatedTime: '2-3分'
    };

    setOrders(prev => [...prev, newOrder]);
    
    // 自動的に処理開始（シミュレーション）
    setTimeout(() => {
      setOrders(prev => prev.map(order => 
        order.id === newOrder.id ? { ...order, status: 'processing' } : order
      ));
    }, 1000);
  };

  const createBatchOrders = () => {
    const urgentTemplates = assetTemplates.filter(t => t.priority === 'urgent');
    
    urgentTemplates.forEach((template, index) => {
      setTimeout(() => {
        const newOrder: GenerationOrder = {
          id: `batch-${Date.now()}-${index}`,
          category: template.category as any,
          tool: template.tool as any,
          priority: template.priority as any,
          status: 'pending',
          progress: 0,
          prompt: template.prompt,
          createdAt: new Date(),
          estimatedTime: '2-3分'
        };
        setOrders(prev => [...prev, newOrder]);
      }, index * 500);
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">🎨 AI素材生成ダッシュボード</h1>
        <p className="opacity-90">最高クオリティの素材を効率的に生成</p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          className="bg-white p-4 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-gray-600">総オーダー数</div>
        </motion.div>
        <motion.div
          className="bg-yellow-50 p-4 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-gray-600">待機中</div>
        </motion.div>
        <motion.div
          className="bg-blue-50 p-4 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-blue-600">{stats.processing}</div>
          <div className="text-gray-600">生成中</div>
        </motion.div>
        <motion.div
          className="bg-green-50 p-4 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-gray-600">完了</div>
        </motion.div>
      </div>

      {/* 新規オーダー作成 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🚀 新規オーダー作成</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {/* テンプレート選択 */}
          <div>
            <h3 className="font-semibold mb-2">テンプレート選択</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {assetTemplates.map(template => (
                <motion.div
                  key={template.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                  whileHover={{ x: 5 }}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-gray-600">
                    {template.tool} | {template.priority}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* プロンプト編集 */}
          <div>
            <h3 className="font-semibold mb-2">プロンプト</h3>
            <textarea
              className="w-full h-48 p-3 border rounded-lg resize-none"
              placeholder="カスタムプロンプトを入力（オプション）"
              value={customPrompt || selectedTemplate?.prompt || ''}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            
            <div className="mt-4 flex gap-4">
              <motion.button
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold"
                onClick={createOrder}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!selectedTemplate}
              >
                オーダー作成
              </motion.button>
              
              <motion.button
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold"
                onClick={createBatchOrders}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                緊急バッチ生成
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* オーダー一覧 */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📋 オーダー一覧</h2>
          
          <div className="flex gap-2">
            {(['all', 'pending', 'processing', 'completed'] as const).map(status => (
              <button
                key={status}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? '全て' :
                 status === 'pending' ? '待機中' :
                 status === 'processing' ? '生成中' : '完了'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredOrders.map(order => (
            <motion.div
              key={order.id}
              className="border rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{order.id}</span>
                  <span className="ml-3 text-sm text-gray-600">
                    {order.category} | {order.tool}
                  </span>
                  <span className={`ml-3 px-2 py-1 rounded text-xs ${
                    order.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    order.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {order.priority}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  {order.status === 'processing' && (
                    <div className="w-32">
                      <div className="bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${order.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1 text-center">
                        {Math.round(order.progress)}%
                      </div>
                    </div>
                  )}
                  
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'completed' ? 'bg-green-100 text-green-600' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'failed' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {order.status === 'completed' ? '✅ 完了' :
                     order.status === 'processing' ? '⚡ 生成中' :
                     order.status === 'failed' ? '❌ 失敗' :
                     '⏳ 待機中'}
                  </span>
                </div>
              </div>
              
              {order.prompt && (
                <div className="mt-2 text-sm text-gray-600 truncate">
                  {order.prompt}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 使用ガイド */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-3">📚 クイックガイド</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold mb-1">1️⃣ DALL-E 3（ChatGPT Plus）</div>
            <div className="text-gray-600">SSR素材・UI要素に最適</div>
          </div>
          <div>
            <div className="font-semibold mb-1">2️⃣ Midjourney v6</div>
            <div className="text-gray-600">背景素材の最高品質</div>
          </div>
          <div>
            <div className="font-semibold mb-1">3️⃣ Leonardo.ai</div>
            <div className="text-gray-600">大量生成・バリエーション</div>
          </div>
        </div>
      </div>
    </div>
  );
};