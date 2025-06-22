// Google Vertex AI クライアント（Imagen API）
class GoogleVertexClient {
  constructor(apiKey, projectId) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.location = 'us-central1';
    this.baseURL = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${this.location}`;
  }

  // Imagen 3で画像生成
  async generateImage(prompt, options = {}) {
    const endpoint = `${this.baseURL}/publishers/google/models/imagen-3:predict`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Goog-User-Project': this.projectId
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: options.sampleCount || 1,
          aspectRatio: options.aspectRatio || '1:1',
          safetyFilterLevel: options.safetyFilterLevel || 'block_some',
          personGeneration: options.personGeneration || 'dont_allow',
          negativePrompt: options.negativePrompt || '',
          seed: options.seed,
          language: 'ja' // 日本語対応
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vertex AI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data;
  }

  // Imagen Video生成（将来的な実装）
  async generateVideo(prompt, options = {}) {
    // Imagen VideoがGAになったら実装
    // 現在はプレビュー段階
    return {
      status: 'preview',
      message: 'Imagen Video is currently in limited preview',
      alternativeMethod: 'Use image-to-video conversion'
    };
  }

  // ガチャ演出用プロンプト生成（日本語対応）
  generateGachaPrompt(template, rarity) {
    const prompts = {
      explosion: {
        base: '壮大な爆発エフェクト、金色の粒子が舞う、ドラマチックな照明、映画的な演出',
        N: 'シンプルなキラキラエフェクト、柔らかい光の粒子、優しい輝き',
        R: '青いエネルギー爆発、中程度の強度、電気のような光',
        SR: '黄金の爆発、稲妻エフェクト付き、強烈な光の放射',
        SSR: '巨大な虹色爆発、プリズムカラー、神々しい光の演出',
        SS: '究極の宇宙的爆発、銀河の背景、神の力を示す光',
        PSA10: '伝説的な深紅の爆発、現実を超越するエフェクト、至高の力'
      },
      galaxy: {
        base: '宇宙銀河のエフェクト、流れ星、星雲の渦、宇宙空間の演出',
        N: '星空の夜、優しく瞬く星',
        R: '青い星雲、流れ星が一筋',
        SR: '黄金の銀河渦巻き、彗星の軌跡',
        SSR: '虹色の星雲爆発、超新星の輝き',
        SS: '宇宙の誕生、銀河の衝突、神聖な宇宙',
        PSA10: '宇宙創造、ビッグバン効果、現実の歪み'
      },
      lightning: {
        base: '雷撃エフェクト、電気のボルト、稲妻の衝撃',
        N: '小さな電気火花、静電気効果',
        R: '青い稲妻、雷鳴とともに',
        SR: '黄金の雷嵐、電界の広がり',
        SSR: '虹色の稲妻網、プラズマ爆発',
        SS: '神の雷、神々の嵐',
        PSA10: '深紅の雷撃黙示録、世界を終わらせる嵐'
      },
      dragon: {
        base: '火を吐くドラゴン、炎のブレス効果、ファンタジー演出',
        N: '小さな火の玉、煙の演出',
        R: '青い炎のドラゴン、火の息',
        SR: '黄金のドラゴン、溶岩の炎',
        SSR: '虹色の竜、神聖な炎',
        SS: '天空の竜王、神々の炎',
        PSA10: '深紅の破壊竜、世界を焼き尽くす炎'
      },
      rainbow: {
        base: '虹色のプリズム効果、七色の光、幻想的な演出',
        N: '淡い虹の光、優しい色彩',
        R: '鮮やかな虹の架け橋',
        SR: '黄金に輝く虹、光の洪水',
        SSR: '全方位の虹色爆発、極彩色の世界',
        SS: '神聖な虹の光、天界への道',
        PSA10: '究極の虹色次元、色彩の限界を超える'
      }
    };

    const basePrompt = prompts[template]?.base || prompts.explosion.base;
    const rarityPrompt = prompts[template]?.[rarity] || prompts.explosion[rarity];

    return `${basePrompt}、${rarityPrompt}、超高精細、8K品質、傑作、テキスト無し、ウォーターマーク無し`;
  }

  // 画像から動画への変換（代替手段）
  async imageToVideo(imageUrl, motionType = 'zoom_pan') {
    // クライアントサイドでのモーション追加で対応
    // Canvas/WebGLを使用したアニメーション
    return {
      method: 'client_side_animation',
      imageUrl: imageUrl,
      motionType: motionType,
      duration: 8,
      effects: ['particle', 'glow', 'camera_movement']
    };
  }
}

export default GoogleVertexClient;