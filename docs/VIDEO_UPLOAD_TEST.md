# 動画アップロード機能 テスト手順

本日実装した動画アップロード機能のテスト手順書です。

## 📋 実装内容サマリー

### 新規作成ファイル
1. `src/app/api/ai/upload-video/route.ts` - 動画アップロードAPI
2. `src/app/admin/ai-generator/upload-video/page.tsx` - アップロード管理画面
3. `scripts/setup-video-storage.sql` - Storageバケット設定スクリプト

### 更新ファイル
1. `supabase/migrations/20251021000003_create_video_generation_system.sql` - final_revealフェーズ対応
2. `src/app/admin/ai-generator/effect-video/page.tsx` - アップロードページへのリンク追加

## 🚀 事前準備

### 1. データベースマイグレーション実行

Supabase Dashboard (https://vshkekffhjbvszzpagjt.supabase.co) にアクセス:

1. **SQL Editor** を開く
2. 以下のマイグレーションファイルの内容を実行:
   - `supabase/migrations/20251021000003_create_video_generation_system.sql`

#### 確認SQL
```sql
-- テーブルが作成されているか確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'ai_video_generation_jobs',
  'gacha_animation_library',
  'card_final_reveal_videos'
);

-- カラムにfinal_revealフェーズが含まれているか確認
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%gacha_animation_library%phase%';
```

### 2. Supabase Storageバケット作成

Supabase Dashboard > **SQL Editor** で以下を実行:

```bash
cat scripts/setup-video-storage.sql
```

上記ファイルの内容をSQL Editorにコピー＆ペーストして実行。

#### 確認方法
Supabase Dashboard > **Storage** で `videos` バケットが表示されることを確認。

### 3. 開発サーバー起動確認

```bash
cd /Users/kousuke/aceoripa/aceoripa/aceoripa-claude
npm run dev
```

起動後、http://localhost:3000 にアクセス可能か確認。

## 🧪 テスト手順

### テスト1: ページアクセステスト

#### 手順
1. ブラウザで http://localhost:3000/admin/login にアクセス
2. 管理者でログイン
   - Email: `admin@aceoripa.com`
   - Password: `AceoripaAdmin2024!`
3. http://localhost:3000/admin/ai-generator/effect-video にアクセス
4. 右上の「📹 動画をアップロード」ボタンをクリック
5. http://localhost:3000/admin/ai-generator/upload-video に遷移

#### 期待結果
✅ ページが正常に表示される
✅ レアリティ選択（SS/S/A/B/C）が表示される
✅ フェーズ選択（イントロ/リビール/最終演出）が表示される
✅ ファイル選択ボタンが表示される
✅ 使い方ガイドが表示される

### テスト2: 動画アップロードテスト

#### 準備
以下の4つの動画ファイルを使用:
- `/Users/kousuke/Downloads/20251019_1750_01k7kpy836e5aa373kfkc5cdj4.mp4`
- `/Users/kousuke/Downloads/20251019_1751_01k7kpdtk3fhc9bjs9e5jyec6m.mp4`
- `/Users/kousuke/Downloads/20251019_1751_01k7kp7m0nemabtqc9f1m2bm1e.mp4`
- `/Users/kousuke/Downloads/20251019_1751_01k7kp7z0mf7m9pa6mtswspwjd.mp4`

#### 手順
1. レアリティで「SS賞」を選択
2. フェーズで「イントロ」を選択
3. 「ファイルを選択」をクリック
4. 最初の動画ファイルを選択
5. 「アップロード」ボタンをクリック

#### 期待結果
✅ 「アップロード中...」が表示される
✅ 「✅ アップロード完了！」が表示される
✅ 下部の「アップロード済み動画」リストに新しい動画が表示される
✅ 動画に「有効」バッジが表示される
✅ ファイルサイズ、品質、使用回数が表示される

#### データベース確認
```sql
-- アップロードされた動画を確認
SELECT
  id,
  rarity,
  phase,
  is_active,
  video_url,
  created_at
FROM gacha_animation_library
ORDER BY created_at DESC
LIMIT 5;
```

#### Storage確認
Supabase Dashboard > **Storage** > **videos** > **gacha-animations** フォルダに動画ファイルが保存されているか確認。

### テスト3: 動画プレビューテスト

#### 手順
1. アップロード済み動画リストから任意の動画を選択
2. 「再生」ボタンをクリック

#### 期待結果
✅ モーダルが開く
✅ 動画プレーヤーが表示される
✅ 動画が自動再生される
✅ ×ボタンでモーダルが閉じる

### テスト4: 動画有効化/無効化テスト

#### 手順
1. 同じレアリティ・フェーズで2つ目の動画をアップロード
2. 1つ目の動画の「無効化」ボタンをクリック
3. 2つ目の動画の「有効化」ボタンをクリック

#### 期待結果
✅ 1つ目の動画から「有効」バッジが消える
✅ 2つ目の動画に「有効」バッジが表示される
✅ 同じレアリティ・フェーズで有効な動画は常に1つだけ

#### データベース確認
```sql
-- 有効な動画が1つだけか確認
SELECT
  rarity,
  phase,
  COUNT(*) as active_count
FROM gacha_animation_library
WHERE is_active = true
GROUP BY rarity, phase;
-- 各グループでactive_countが1であること
```

### テスト5: 動画削除テスト

#### 手順
1. テスト用にアップロードした動画の「削除」ボタン（ゴミ箱アイコン）をクリック
2. 確認ダイアログで「OK」をクリック

#### 期待結果
✅ 確認ダイアログが表示される
✅ OKをクリックすると動画が一覧から消える
✅ Storageからもファイルが削除される

### テスト6: フィルター機能テスト

#### 手順
1. 複数のレアリティ・フェーズで動画をアップロード
2. レアリティドロップダウンで「SS賞」を選択
3. フェーズドロップダウンで「イントロ」を選択

#### 期待結果
✅ 選択したレアリティ・フェーズの動画のみ表示される
✅ 「全レアリティ」「全フェーズ」を選択するとすべて表示される

### テスト7: API動作確認

#### GET - 動画一覧取得
```bash
curl -X GET 'http://localhost:3000/api/ai/upload-video' \
  -H 'Cookie: <ログインCookie>'
```

#### 期待結果
```json
{
  "videos": [
    {
      "id": "xxx",
      "rarity": "SS",
      "phase": "intro",
      "video_url": "https://...",
      "is_active": true,
      ...
    }
  ]
}
```

### テスト8: ガチャ演出での動画使用テスト

#### 手順
1. SS賞の intro, reveal, final_reveal 動画をすべてアップロード
2. 実際にガチャを引く（SS賞が出るまで）
3. ガチャ演出を確認

#### 期待結果
✅ イントロでアップロードした動画が再生される
✅ リビールでアップロードした動画が再生される
✅ 最終演出でアップロードした動画が再生される
✅ スキップボタンが3秒後に表示される

## 🐛 トラブルシューティング

### エラー: "Failed to upload"

**原因**: Storageバケットが作成されていない

**解決策**:
```sql
-- Supabase Dashboard > SQL Editorで実行
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;
```

### エラー: "Unauthorized"

**原因**: 管理者としてログインしていない

**解決策**:
- http://localhost:3000/admin/login で再度ログイン
- Cookieが有効か確認

### エラー: "Failed to save to library"

**原因**: RLSポリシーまたはテーブルが存在しない

**解決策**:
1. マイグレーションが実行されているか確認
2. サービスロールキーが `.env.local` に設定されているか確認

### 動画が再生されない

**原因**: ファイル形式が非対応

**解決策**:
- MP4形式の動画を使用
- H.264コーデックを推奨

## ✅ テスト完了チェックリスト

- [ ] ページアクセステスト
- [ ] 動画アップロードテスト（4本すべて）
- [ ] 動画プレビューテスト
- [ ] 動画有効化/無効化テスト
- [ ] 動画削除テスト
- [ ] フィルター機能テスト
- [ ] API動作確認
- [ ] ガチャ演出での動画使用テスト

## 📝 テスト結果記録

### テスト実施日
yyyy/mm/dd

### 実施者
[名前]

### 結果
| テスト項目 | 結果 | 備考 |
|----------|------|------|
| ページアクセス | ✅/❌ | |
| 動画アップロード | ✅/❌ | |
| 動画プレビュー | ✅/❌ | |
| 有効化/無効化 | ✅/❌ | |
| 動画削除 | ✅/❌ | |
| フィルター機能 | ✅/❌ | |
| API動作確認 | ✅/❌ | |
| ガチャ演出 | ✅/❌ | |

### 発見された問題
[問題があれば記載]

### 改善提案
[改善案があれば記載]
