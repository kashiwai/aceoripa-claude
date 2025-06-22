// サンプル動画のマッピング設定

export interface VideoMapping {
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  filename: string;
  description: string;
  duration: number; // 秒
  type: 'opening' | 'reveal' | 'effect' | 'celebration';
}

export const SAMPLE_VIDEOS: VideoMapping[] = [
  {
    rarity: 'SSR',
    filename: '4nqylI1QZNsBBP70FCr711ZfUzFLFQYD98gLzcOw.mp4',
    description: 'SSR レジェンド演出',
    duration: 8,
    type: 'celebration'
  },
  {
    rarity: 'SSR',
    filename: 'HxjlmOx8efWFbeynxqr2PR5vKv6lBcT6rD0RhVqD.mp4',
    description: 'SSR パック開封演出',
    duration: 10,
    type: 'opening'
  },
  {
    rarity: 'SR',
    filename: 'Ivhz3TieIc2XzA2LJyLfIdN59bTVspCY5pEr9eMK.mp4',
    description: 'SR 炎エフェクト',
    duration: 6,
    type: 'effect'
  },
  {
    rarity: 'SR',
    filename: 'U6KTRGJhrgVXoxMdCAkikd7GkLpYvWN0m1gV7Gee.mp4',
    description: 'SR カード出現',
    duration: 5,
    type: 'reveal'
  },
  {
    rarity: 'R',
    filename: 'YTpfPjkUK8Yldpa7JznXgN4kiXHBek7n6hYuToyY.mp4',
    description: 'R 水エフェクト',
    duration: 4,
    type: 'effect'
  },
  {
    rarity: 'R',
    filename: 'aoOQpdFxr1Im58SFYZbSKgmU34aHNRoBKsPtORwh.mp4',
    description: 'R 標準演出',
    duration: 3,
    type: 'reveal'
  },
  {
    rarity: 'N',
    filename: 'hMIdEcguForZnsWOqmC27Gwwwio8XpelgS920QXJ.mp4',
    description: 'N シンプル演出',
    duration: 2,
    type: 'reveal'
  },
  {
    rarity: 'N',
    filename: 'vvCggB2zveAraxH1WkGIHOIXgpjra5vtcPByLt43.mp4',
    description: 'N 基本エフェクト',
    duration: 2,
    type: 'effect'
  }
];

// レアリティと演出タイプに基づいて動画を取得
export function getVideoForRarity(
  rarity: 'SSR' | 'SR' | 'R' | 'N',
  type: 'opening' | 'reveal' | 'effect' | 'celebration' = 'reveal'
): VideoMapping | null {
  // 指定されたレアリティとタイプに一致する動画を取得
  let video = SAMPLE_VIDEOS.find(v => v.rarity === rarity && v.type === type);
  
  // 見つからない場合は同じレアリティの別タイプを取得
  if (!video) {
    video = SAMPLE_VIDEOS.find(v => v.rarity === rarity);
  }
  
  return video || null;
}

// ランダムに動画を選択
export function getRandomVideoForRarity(rarity: 'SSR' | 'SR' | 'R' | 'N'): VideoMapping | null {
  const videos = SAMPLE_VIDEOS.filter(v => v.rarity === rarity);
  return videos.length > 0 ? videos[Math.floor(Math.random() * videos.length)] : null;
}

// 全ての利用可能な動画を取得
export function getAllVideos(): VideoMapping[] {
  return SAMPLE_VIDEOS;
}

// 動画の存在確認
export async function validateVideoExists(filename: string): Promise<boolean> {
  try {
    const response = await fetch(`/samplemovie/${filename}`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}