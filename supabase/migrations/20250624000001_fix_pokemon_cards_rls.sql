-- 既存のRLSポリシーを削除
DROP POLICY IF EXISTS "pokemon_cards_read_all" ON pokemon_cards;
DROP POLICY IF EXISTS "pokemon_cards_insert_authenticated" ON pokemon_cards;
DROP POLICY IF EXISTS "pokemon_cards_update_authenticated" ON pokemon_cards;
DROP POLICY IF EXISTS "pokemon_cards_delete_authenticated" ON pokemon_cards;

-- service_roleを除くすべてのユーザーがポケモンカードを読み取れるポリシー
CREATE POLICY "pokemon_cards_read_all" ON pokemon_cards
    FOR SELECT USING (true);

-- 認証されたユーザーがポケモンカードを挿入できるポリシー
-- 注: service_roleはRLSをバイパスするため、このポリシーは通常の認証ユーザー向け
CREATE POLICY "pokemon_cards_insert_authenticated" ON pokemon_cards
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- 認証されたユーザーがポケモンカードを更新できるポリシー
CREATE POLICY "pokemon_cards_update_authenticated" ON pokemon_cards
    FOR UPDATE USING (
        auth.uid() IS NOT NULL
    );

-- 認証されたユーザーがポケモンカードを削除できるポリシー
CREATE POLICY "pokemon_cards_delete_authenticated" ON pokemon_cards
    FOR DELETE USING (
        auth.uid() IS NOT NULL
    );

-- 管理者テーブルを作成（オプション：特定のユーザーのみに権限を付与する場合）
CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- より厳格な管理者のみのポリシーを追加（オプション）
-- これらのポリシーを使用する場合は、上記の基本的なポリシーを削除してください
-- CREATE POLICY "pokemon_cards_insert_admin_only" ON pokemon_cards
--     FOR INSERT WITH CHECK (
--         auth.uid() IN (SELECT user_id FROM admin_users)
--     );

-- CREATE POLICY "pokemon_cards_update_admin_only" ON pokemon_cards
--     FOR UPDATE USING (
--         auth.uid() IN (SELECT user_id FROM admin_users)
--     );

-- CREATE POLICY "pokemon_cards_delete_admin_only" ON pokemon_cards
--     FOR DELETE USING (
--         auth.uid() IN (SELECT user_id FROM admin_users)
--     );

-- その他のテーブルのRLSポリシーも修正
DROP POLICY IF EXISTS "gacha_pokemon_pools_insert_authenticated" ON gacha_pokemon_pools;
DROP POLICY IF EXISTS "gacha_pokemon_pools_update_authenticated" ON gacha_pokemon_pools;
DROP POLICY IF EXISTS "gacha_pokemon_pools_delete_authenticated" ON gacha_pokemon_pools;

CREATE POLICY "gacha_pokemon_pools_insert_authenticated" ON gacha_pokemon_pools
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "gacha_pokemon_pools_update_authenticated" ON gacha_pokemon_pools
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "gacha_pokemon_pools_delete_authenticated" ON gacha_pokemon_pools
    FOR DELETE USING (auth.uid() IS NOT NULL);