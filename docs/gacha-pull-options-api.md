# ガチャ回数オプションAPI実装ガイド

## 概要
このドキュメントでは、ガチャ回数オプション（1回、3回、5回、10回など）を管理するためのAPI実装方法を説明します。

## 1. データベーススキーマ

### Supabaseテーブル作成SQL

```sql
-- ガチャ回数オプションテーブル
CREATE TABLE gacha_pull_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pull_count INTEGER NOT NULL UNIQUE,           -- 回数（1, 3, 5, 10など）
  display_name VARCHAR(50) NOT NULL,            -- 表示名（"1回", "3回"など）
  icon_url TEXT,                                -- アイコンURL（オプション）
  price_multiplier DECIMAL(10,2) NOT NULL,      -- 価格倍率（1回=1.0, 10回=9.0など）
  is_popular BOOLEAN DEFAULT FALSE,             -- 人気フラグ
  is_discount BOOLEAN DEFAULT FALSE,            -- お得フラグ
  order_index INTEGER NOT NULL,                 -- 表示順
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新時刻自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gacha_pull_options_updated_at
BEFORE UPDATE ON gacha_pull_options
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初期データ投入
INSERT INTO gacha_pull_options (pull_count, display_name, price_multiplier, order_index, is_popular, is_discount) VALUES
(1, '1回', 1.0, 0, false, false),
(3, '3回', 2.8, 1, false, true),
(5, '5回', 4.5, 2, false, true),
(10, '10回', 9.0, 3, true, true);
```

## 2. API エンドポイント

### 2.1 一覧取得
**GET** `/api/gacha/pull-options`

```typescript
// app/api/gacha/pull-options/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('gacha_pull_options')
    .select('*')
    .order('order_index');
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ options: data });
}
```

**レスポンス例:**
```json
{
  "options": [
    {
      "id": "uuid-1",
      "pull_count": 1,
      "display_name": "1回",
      "icon_url": null,
      "price_multiplier": 1.0,
      "is_popular": false,
      "is_discount": false,
      "order_index": 0
    },
    {
      "id": "uuid-2",
      "pull_count": 10,
      "display_name": "10回",
      "icon_url": "/images/icons/pull-10.png",
      "price_multiplier": 9.0,
      "is_popular": true,
      "is_discount": true,
      "order_index": 3
    }
  ]
}
```

### 2.2 個別取得
**GET** `/api/gacha/pull-options/[id]`

```typescript
// app/api/gacha/pull-options/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('gacha_pull_options')
    .select('*')
    .eq('id', params.id)
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  
  return NextResponse.json(data);
}
```

### 2.3 作成
**POST** `/api/gacha/pull-options`

```typescript
export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  const body = await request.json();
  
  // バリデーション
  if (!body.pull_count || !body.display_name || !body.price_multiplier) {
    return NextResponse.json(
      { error: 'Required fields missing' },
      { status: 400 }
    );
  }
  
  const { data, error } = await supabase
    .from('gacha_pull_options')
    .insert({
      pull_count: body.pull_count,
      display_name: body.display_name,
      icon_url: body.icon_url,
      price_multiplier: body.price_multiplier,
      is_popular: body.is_popular || false,
      is_discount: body.is_discount || false,
      order_index: body.order_index || 999
    })
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
}
```

**リクエスト例:**
```json
{
  "pull_count": 20,
  "display_name": "20回",
  "icon_url": "/images/icons/pull-20.png",
  "price_multiplier": 17.0,
  "is_popular": false,
  "is_discount": true,
  "order_index": 4
}
```

### 2.4 更新
**PUT** `/api/gacha/pull-options/[id]`

```typescript
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient({ cookies });
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('gacha_pull_options')
    .update({
      display_name: body.display_name,
      icon_url: body.icon_url,
      price_multiplier: body.price_multiplier,
      is_popular: body.is_popular,
      is_discount: body.is_discount,
      order_index: body.order_index
    })
    .eq('id', params.id)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

### 2.5 削除
**DELETE** `/api/gacha/pull-options/[id]`

```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerComponentClient({ cookies });
  
  const { error } = await supabase
    .from('gacha_pull_options')
    .delete()
    .eq('id', params.id);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
```

## 3. アイコン画像生成

### AI生成プロンプト例（DALL-E 3, Midjourney, Leonardo.ai）

```javascript
// 1回アイコン
"Single golden dice with number 1, game UI icon style, transparent background, glossy 3D render, centered composition"

// 3回アイコン
"Three silver dice stacked, sparkle effects, game asset, transparent PNG, premium quality, UI design"

// 5回アイコン
"Five star burst effect, rainbow gradient colors, game icon, transparent background, magical aura, high quality render"

// 10回アイコン
"Number 10 with golden crown, explosion effect, best value badge, game UI element, transparent background, premium design"

// カスタム回数アイコン
"Infinity symbol with colorful particles, choose your amount concept, game icon, transparent background, dynamic design"
```

### 画像アップロードAPI
**POST** `/api/gacha/pull-options/upload-icon`

```typescript
// app/api/gacha/pull-options/upload-icon/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const optionId = formData.get('optionId') as string;
  
  if (!file || !optionId) {
    return NextResponse.json(
      { error: 'File and optionId required' },
      { status: 400 }
    );
  }
  
  const supabase = createServerComponentClient({ cookies });
  
  // ストレージにアップロード
  const fileName = `pull-options/${optionId}/${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('gacha-assets')
    .upload(fileName, file);
    
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  
  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from('gacha-assets')
    .getPublicUrl(fileName);
    
  // データベースを更新
  const { error: updateError } = await supabase
    .from('gacha_pull_options')
    .update({ icon_url: publicUrl })
    .eq('id', optionId);
    
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  
  return NextResponse.json({ url: publicUrl });
}
```

## 4. フロントエンド実装例

### ガチャ画面での使用例

```typescript
// components/GachaPullButtons.tsx
import { useState, useEffect } from 'react';

interface PullOption {
  id: string;
  pull_count: number;
  display_name: string;
  icon_url?: string;
  price_multiplier: number;
  is_popular?: boolean;
  is_discount?: boolean;
}

export function GachaPullButtons({ onPull }: { onPull: (count: number) => void }) {
  const [options, setOptions] = useState<PullOption[]>([]);
  
  useEffect(() => {
    fetch('/api/gacha/pull-options')
      .then(res => res.json())
      .then(data => setOptions(data.options));
  }, []);
  
  return (
    <div className="flex gap-4 justify-center">
      {options.map(option => (
        <button
          key={option.id}
          onClick={() => onPull(option.pull_count)}
          className="relative p-4 bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg"
        >
          {option.is_popular && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              人気
            </span>
          )}
          {option.icon_url && (
            <img src={option.icon_url} alt={option.display_name} className="w-16 h-16 mx-auto mb-2" />
          )}
          <div className="text-white font-bold">{option.display_name}</div>
          {option.is_discount && (
            <div className="text-yellow-300 text-sm">お得!</div>
          )}
        </button>
      ))}
    </div>
  );
}
```

## 5. セキュリティ考慮事項

1. **認証**: 管理APIは管理者のみアクセス可能にする
2. **バリデーション**: 入力値の検証を必ず実施
3. **レート制限**: API呼び出し回数を制限
4. **画像検証**: アップロードファイルのMIMEタイプとサイズを検証

## 6. パフォーマンス最適化

1. **キャッシュ**: Redisやメモリキャッシュで頻繁にアクセスされるデータをキャッシュ
2. **CDN**: アイコン画像はCDN経由で配信
3. **データベースインデックス**: `pull_count`と`order_index`にインデックスを設定

## まとめ
このAPIを使用することで、管理チームは柔軟にガチャ回数オプションを追加・編集・削除できます。アイコンは専用のAI生成ツールで作成し、APIを通じてアップロードすることで、魅力的なUIを実現できます。