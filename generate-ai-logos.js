const fs = require('fs');
const path = require('path');

// OpenAI APIを使ってロゴ生成
const generateAILogo = async (prompt, filename) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('xxx')) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    // 画像をダウンロード
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();
    
    // ファイルに保存
    const filepath = path.join('public/images/logos', filename);
    fs.writeFileSync(filepath, imageBuffer);
    
    console.log(`✅ ${filename} 生成完了`);
    return filepath;
    
  } catch (error) {
    console.error(`❌ ${filename} 生成エラー:`, error.message);
    return null;
  }
};

// ロゴプロンプト定義
const logoPrompts = [
  {
    filename: 'aceoripa-ai-gaming.png',
    prompt: `Create a professional gaming logo for "ACEORIPA" - an online Japanese card pack (oripa) service. 
    Style: Modern gaming logo with excitement and luck elements. 
    Features: Bold "ACEORIPA" text, trading card motifs, sparkle effects, dice or treasure elements, 
    colorful and energetic design with Japanese gaming aesthetics. 
    Colors: Vibrant blues, golds, and purples. Clean, readable typography with gaming feel. 
    Background: Dark or gradient background. High quality, professional game logo design.`
  },
  {
    filename: 'aceoripa-ai-premium.png',
    prompt: `Design a premium luxury logo for "ACEORIPA" - Japanese online card pack service. 
    Style: Elegant and luxurious with golden accents. 
    Features: "ACEORIPA" in premium typography, crown or diamond elements, 
    playing card suits (hearts, spades), premium foil effects, sophisticated design. 
    Colors: Gold, black, and white with metallic shine effects. 
    Background: Dark luxury background. Professional brand logo, high-end feel.`
  },
  {
    filename: 'aceoripa-ai-anime.png',
    prompt: `Create an anime-style logo for "ACEORIPA" - Japanese card pack service. 
    Style: Anime/manga inspired with bright colors and dynamic effects. 
    Features: "ACEORIPA" in anime-style lettering, magical sparkles, 
    card pack opening effects, cute mascot elements, energy beams or aura effects. 
    Colors: Bright rainbow colors, pink, blue, yellow highlights. 
    Background: Colorful gradient or star field. Kawaii and exciting design.`
  },
  {
    filename: 'aceoripa-ai-mystical.png',
    prompt: `Design a mystical fortune-telling logo for "ACEORIPA" - card pack service. 
    Style: Mystical and magical with fortune elements. 
    Features: "ACEORIPA" with mystical typography, crystal ball, tarot cards, 
    magic circles, constellation patterns, fortune wheel elements. 
    Colors: Deep purples, mystic blues, silver, and glowing effects. 
    Background: Starry night or magical aura. Enchanting and mysterious design.`
  }
];

// メイン実行関数
const main = async () => {
  // ディレクトリ作成
  const logoDir = 'public/images/logos';
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  console.log('🎨 AI生成aceoripaロゴを4パターン作成中...\n');

  for (const logoConfig of logoPrompts) {
    console.log(`🔄 ${logoConfig.filename} を生成中...`);
    await generateAILogo(logoConfig.prompt, logoConfig.filename);
    
    // API制限回避のため少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✨ AI生成ロゴの作成が完了しました！');
  console.log('生成されたファイル:');
  logoPrompts.forEach(config => {
    console.log(`- public/images/logos/${config.filename}`);
  });
};

// 実行
main().catch(console.error);