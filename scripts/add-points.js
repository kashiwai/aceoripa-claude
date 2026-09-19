const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = 'https://vshkekffhjbvszzpagjt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaGtla2ZmaGpidnN6enBhZ2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwMjYyNywiZXhwIjoyMDY1OTc4NjI3fQ.rIPYTr2iHWRoe6Q57GT1wz907luOMnYkUyJd6ZFvmIE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addPoints() {
  const email = 'mmz2501@gmail.com';
  const pointsToAdd = 5000;
  
  try {
    // ユーザーIDを取得
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError) {
      console.error('ユーザーの取得に失敗しました:', userError);
      return;
    }
    
    if (!userData) {
      console.error('ユーザーが見つかりません');
      return;
    }
    
    const userId = userData.id;
    console.log(`ユーザーID: ${userId}`);
    
    // 現在のポイントを取得
    const { data: currentPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('paid_points')
      .eq('user_id', userId)
      .single();
    
    if (pointsError && pointsError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('ポイントの取得に失敗しました:', pointsError);
      return;
    }
    
    const currentPaidPoints = currentPoints?.paid_points || 0;
    const newPaidPoints = currentPaidPoints + pointsToAdd;
    
    // ポイントを更新または挿入
    const { error: updateError } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        paid_points: newPaidPoints,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (updateError) {
      console.error('ポイントの更新に失敗しました:', updateError);
      return;
    }
    
    // トランザクション履歴を記録
    const { error: transactionError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'add',
        amount: pointsToAdd,
        point_type: 'paid',
        description: '管理者による有料ポイント追加',
        created_at: new Date().toISOString()
      });
    
    if (transactionError) {
      console.error('トランザクション記録に失敗しました:', transactionError);
      // ポイントは追加されているので、エラーは警告のみ
    }
    
    console.log(`✅ ${email} に ${pointsToAdd} 有料ポイントを追加しました`);
    console.log(`現在の有料ポイント: ${currentPaidPoints} → ${newPaidPoints}`);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

// 実行
addPoints();