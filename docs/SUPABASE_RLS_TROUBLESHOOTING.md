# Supabase RLS (Row Level Security) トラブルシューティングガイド

## 問題の概要
pokemon_cardsテーブルへのINSERT操作でRLSポリシーによるアクセス拒否が発生している問題について。

## 原因と解決策

### 1. RLSポリシーの修正
元のRLSポリシーで使用されていた `auth.role()` は正しい関数ではありませんでした。
正しくは `auth.uid()` を使用して認証されたユーザーをチェックする必要があります。

**修正前:**
```sql
CREATE POLICY "pokemon_cards_insert_authenticated" ON pokemon_cards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**修正後:**
```sql
CREATE POLICY "pokemon_cards_insert_authenticated" ON pokemon_cards
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 2. Service Roleキーの使用
Service Roleキーを使用したSupabaseクライアントはRLSを完全にバイパスします。

#### 環境変数の確認
以下の環境変数が正しく設定されていることを確認してください：

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Service Roleキーの取得方法
1. Supabaseダッシュボードにログイン
2. プロジェクト設定 > API
3. "Service role key (secret)"をコピー

### 3. 管理者クライアントの使用方法

```typescript
// src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
```

### 4. RLSポリシーのデバッグ

#### RLSが有効になっているかの確認
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'pokemon_cards';
```

#### 現在のポリシーの確認
```sql
SELECT * FROM pg_policies WHERE tablename = 'pokemon_cards';
```

#### RLSを一時的に無効化（開発環境のみ）
```sql
ALTER TABLE pokemon_cards DISABLE ROW LEVEL SECURITY;
```

### 5. トラブルシューティングチェックリスト

- [ ] 環境変数 `SUPABASE_SERVICE_ROLE_KEY` が設定されている
- [ ] Service Roleキーが正しい（Supabaseダッシュボードから確認）
- [ ] RLSポリシーが正しく設定されている（上記の修正を適用）
- [ ] 認証されたユーザーでAPIを呼び出している
- [ ] Supabaseクライアントが正しく初期化されている

### 6. よくあるエラーとその対処法

#### エラー: "new row violates row-level security policy"
**原因:** RLSポリシーが正しく設定されていない、またはユーザーが認証されていない
**解決策:** 
1. Service Roleキーを使用する
2. RLSポリシーを修正する
3. ユーザーが認証されていることを確認する

#### エラー: "permission denied for table pokemon_cards"
**原因:** データベース権限の問題
**解決策:** Supabaseダッシュボードでテーブル権限を確認

### 7. 推奨される実装パターン

#### 管理者専用エンドポイント
```typescript
// src/app/api/admin/cards/route.ts
export async function POST(request: NextRequest) {
  // 認証チェック
  const { user, adminClient } = await getAuthenticatedAdminClient()
  
  // Service Roleクライアントを使用してRLSをバイパス
  const { data, error } = await adminClient
    .from('pokemon_cards')
    .insert([{ /* カードデータ */ }])
    
  if (error) {
    // エラーハンドリング
  }
  
  return NextResponse.json(data)
}
```

#### 一般ユーザー向けエンドポイント
```typescript
// src/app/api/cards/route.ts
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // RLSにより自動的にフィルタリングされる
  const { data, error } = await supabase
    .from('pokemon_cards')
    .select('*')
    
  return NextResponse.json(data)
}
```

## まとめ
1. RLSポリシーを修正済み（`auth.role()` → `auth.uid()`）
2. Service Roleキーを使用することでRLSをバイパス可能
3. 管理者操作にはService Roleクライアントを使用
4. 一般ユーザー操作には通常のクライアントを使用してRLSで保護