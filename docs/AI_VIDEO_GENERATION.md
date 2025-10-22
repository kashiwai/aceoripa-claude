# AI動画生成システム（VEO3/SORA2統合版）

ガチャ演出動画をGoogle Veo 3とOpenAI Sora 2を使用して自動生成するシステムです。

## 📋 概要

### 対応プロバイダー

- **Google Veo 3**: 高品質、比較的高速な動画生成
- **OpenAI Sora 2**: 最高品質、処理時間は長め

### 生成可能な演出

- **レアリティ**: SS / S / A / B / C
- **フェーズ**:
  - **Intro（イントロ）**: 期待感を高める導入演出（2-5秒）
  - **Reveal（リビール）**: カード開封演出（3-8秒）

---

## 🚀 セットアップ

### 1. 環境変数設定

`.env.local`に以下を追加（既に設定済み）:

```bash
# Google Veo 3 API
GOOGLE_VEO3_API_KEY=your_veo3_api_key

# OpenAI Sora 2 API
OPENAI_SORA2_API_KEY=your_sora2_api_key
```

### 2. データベースマイグレーション

Supabase Dashboardで以下のマイグレーションを実行:

```bash
supabase/migrations/20251021000003_create_video_generation_system.sql
```

または、Supabase Dashboard → SQL Editorでファイルの内容を実行してください。

---

## 💻 使用方法

### 管理画面から生成

1. **管理画面にアクセス**
   ```
   /admin/ai-generator/effect-video
   ```

2. **生成設定**
   - AIプロバイダーを選択（VEO3 または SORA2）
   - レアリティを選択（SS/S/A/B/C）
   - フェーズを選択（Intro/Reveal）
   - カード名を入力（オプション）

3. **生成実行**
   - 「🎬 動画を生成」ボタンをクリック
   - ジョブリストで進捗を確認
   - 完了後、プレビュー・ダウンロード・ライブラリ保存が可能

4. **一括生成**
   - 「全レアリティ一括生成」ボタンで全10個（SS/S/A/B/C × intro/reveal）を一度に生成可能

### APIから生成

#### 動画生成リクエスト

```typescript
POST /api/ai/generate-video

Body:
{
  "rarity": "SS",           // SS, S, A, B, C
  "phase": "intro",         // intro, reveal
  "cardName": "リザードン",  // オプション
  "provider": "veo3",       // veo3, sora2
  "customPrompt": "..."     // オプション（カスタムプロンプト）
}

Response:
{
  "jobId": "uuid",
  "providerJobId": "provider_job_id",
  "status": "processing",
  "videoUrl": null,         // 完了時にURL
  "thumbnailUrl": null,     // 完了時にURL
  "provider": "veo3",
  "rarity": "SS",
  "phase": "intro",
  "createdAt": "2025-10-21T..."
}
```

#### ジョブステータス確認

```typescript
GET /api/ai/generate-video?jobId=xxx

Response:
{
  "jobId": "uuid",
  "status": "completed",   // pending, processing, completed, failed
  "videoUrl": "https://...",
  "thumbnailUrl": "https://...",
  "error": null
}
```

### プログラムから生成

```typescript
import { videoGenerationService } from '@/lib/ai-video/video-generation-service'

// SS賞のイントロ演出を生成
const result = await videoGenerationService.generateGachaAnimation(
  'SS',           // rarity
  'intro',        // phase
  'リザードン',    // cardName
  'veo3'          // provider
)

console.log('Video URL:', result.videoUrl)
```

---

## 📊 データベース構造

### ai_video_generation_jobs

動画生成ジョブを管理:

```sql
- id: UUID (PK)
- user_id: UUID
- provider: veo3 | sora2
- provider_job_id: プロバイダー側のジョブID
- rarity: SS | S | A | B | C
- phase: intro | reveal
- card_name: カード名
- prompt: 生成プロンプト
- status: pending | processing | completed | failed
- video_url: 生成された動画URL
- thumbnail_url: サムネイルURL
- error: エラーメッセージ
- created_at, updated_at, completed_at
```

### gacha_animation_library

ライブラリ化された演出動画:

```sql
- id: UUID (PK)
- rarity: SS | S | A | B | C
- phase: intro | reveal
- video_url: 動画URL
- thumbnail_url: サムネイルURL
- storage_path: Supabase Storageパス
- provider: veo3 | sora2
- generation_job_id: 元のジョブID
- is_active: アクティブフラグ（1レアリティ・フェーズにつき1つのみアクティブ）
- usage_count: 使用回数
- last_used_at: 最終使用日時
```

---

## 🎬 動画の利用

### ガチャ実行時に演出を表示

```typescript
import { AIVideoGachaAnimation } from '@/components/gacha/AIVideoGachaAnimation'

// データベースから対応する動画を取得
const { data } = await supabase
  .rpc('get_active_gacha_animation', {
    p_rarity: 'SS',
    p_phase: 'intro'
  })

// コンポーネントで表示
<AIVideoGachaAnimation
  rarity="SS"
  cardData={{
    id: card.id,
    name: card.name,
    imageUrl: card.image_url
  }}
  onComplete={() => console.log('Animation complete')}
  onSkip={() => console.log('Animation skipped')}
/>
```

---

## 🔧 トラブルシューティング

### 動画生成が失敗する

**原因と対処法**:

1. **APIキーエラー**
   - `.env.local`のAPIキーが正しいか確認
   - APIキーに権限があるか確認

2. **プロンプトエラー**
   - プロンプトが長すぎる場合は短縮
   - 禁止ワードが含まれていないか確認

3. **レート制限**
   - 一括生成時は各生成の間に2秒の待機時間あり
   - 必要に応じて待機時間を延長

### 動画が生成されても表示されない

1. **video_urlを確認**
   - データベースの`ai_video_generation_jobs`テーブルで`video_url`が正しく保存されているか確認

2. **CORS設定**
   - プロバイダーから返されたURLがCORS対応しているか確認

3. **ブラウザコンソール**
   - エラーメッセージを確認

---

## 📈 パフォーマンス

### 生成時間の目安

| プロバイダー | フェーズ | 時間 |
|------------|----------|------|
| Veo3 | Intro (2-5秒) | 1-3分 |
| Veo3 | Reveal (3-8秒) | 2-5分 |
| Sora2 | Intro (2-5秒) | 3-8分 |
| Sora2 | Reveal (3-8秒) | 5-15分 |

### コスト（概算）

- **Veo3**: $0.01-0.05 / 秒
- **Sora2**: $0.05-0.20 / 秒

※実際のコストはプロバイダーの価格表を確認してください

---

## 🔐 セキュリティ

- APIキーは`.env.local`で管理（Gitに含めない）
- 管理画面は認証済みユーザーのみアクセス可能
- RLS（Row Level Security）で各ユーザーは自分のジョブのみ閲覧可能

---

## 🚧 今後の改善予定

- [ ] Supabase Storageへの自動保存
- [ ] 生成動画の品質評価・自動選別
- [ ] カスタムプロンプトテンプレートエディタ
- [ ] バッチ処理キュー（大量生成時の効率化）
- [ ] 生成コストの自動計算・表示
- [ ] A/Bテスト機能（複数バージョンの動画を生成して比較）

---

## 📝 ログ

### サンプルログ（成功時）

```
[VideoGen] Generating SS intro animation for リザードン
[Veo3] Generating video with prompt: Epic cinematic reveal...
[Veo3] Generation response received
[API] Generating SS intro video with veo3
[Gacha] Starting draw: ポケモンカードパック, 1 pulls
[Gacha] Pull 1/1: SS - リザードン (CEILING, PICKUP)
```

### サンプルログ（エラー時）

```
[Veo3] API error: 401 - Invalid API key
[API] Error generating video: Veo3 API error: 401
```

---

## 📞 サポート

問題が発生した場合は、以下の情報を含めて報告してください:

- エラーメッセージ
- ジョブID
- 使用したプロバイダー（VEO3/SORA2）
- リクエストパラメータ
- ブラウザコンソールのログ

---

*最終更新: 2025-10-21*
