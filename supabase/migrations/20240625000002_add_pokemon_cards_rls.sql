-- pokemon_cardsテーブルのRLS（Row Level Security）を有効化
ALTER TABLE pokemon_cards ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがポケモンカードを読み取れるポリシー
CREATE POLICY "pokemon_cards_read_all" ON pokemon_cards
    FOR SELECT USING (true);

-- 認証されたユーザーがポケモンカードを挿入できるポリシー（管理者のみ）
-- 注: 実際の本番環境では、管理者ロールチェックを追加することを推奨
CREATE POLICY "pokemon_cards_insert_authenticated" ON pokemon_cards
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 認証されたユーザーがポケモンカードを更新できるポリシー（管理者のみ）
CREATE POLICY "pokemon_cards_update_authenticated" ON pokemon_cards
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 認証されたユーザーがポケモンカードを削除できるポリシー（管理者のみ）
CREATE POLICY "pokemon_cards_delete_authenticated" ON pokemon_cards
    FOR DELETE USING (auth.role() = 'authenticated');

-- gacha_pokemon_poolsテーブルのRLSを有効化
ALTER TABLE gacha_pokemon_pools ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがガチャプールを読み取れるポリシー
CREATE POLICY "gacha_pokemon_pools_read_all" ON gacha_pokemon_pools
    FOR SELECT USING (true);

-- 認証されたユーザーがガチャプールを管理できるポリシー
CREATE POLICY "gacha_pokemon_pools_insert_authenticated" ON gacha_pokemon_pools
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "gacha_pokemon_pools_update_authenticated" ON gacha_pokemon_pools
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "gacha_pokemon_pools_delete_authenticated" ON gacha_pokemon_pools
    FOR DELETE USING (auth.role() = 'authenticated');

-- gacha_results_pokemonテーブルのRLSを有効化
ALTER TABLE gacha_results_pokemon ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のガチャ結果を読み取れるポリシー
CREATE POLICY "gacha_results_pokemon_read_own" ON gacha_results_pokemon
    FOR SELECT USING (auth.uid() = user_id);

-- 認証されたユーザーがガチャ結果を挿入できるポリシー
CREATE POLICY "gacha_results_pokemon_insert_authenticated" ON gacha_results_pokemon
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_pokemon_cardsテーブルのRLSを有効化
ALTER TABLE user_pokemon_cards ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のコレクションを読み取れるポリシー
CREATE POLICY "user_pokemon_cards_read_own" ON user_pokemon_cards
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーが自分のコレクションを更新できるポリシー
CREATE POLICY "user_pokemon_cards_insert_own" ON user_pokemon_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_pokemon_cards_update_own" ON user_pokemon_cards
    FOR UPDATE USING (auth.uid() = user_id);

-- ai_generation_logsテーブルのRLSを有効化（存在する場合）
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のAI生成ログを読み取れるポリシー
CREATE POLICY "ai_generation_logs_read_own" ON ai_generation_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーが自分のAI生成ログを作成できるポリシー
CREATE POLICY "ai_generation_logs_insert_own" ON ai_generation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);