
import os
from openai import OpenAI
import requests
import json
from datetime import datetime

# OpenAI クライアント初期化
client = OpenAI()

def generate_background(prompt, filename):
    """DALL-E 3で背景画像を生成"""
    try:
        # 画像生成
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt + ", 800x450 pixels, high quality, no text, no watermarks",
            size="1792x1024",  # DALL-E 3の利用可能サイズ
            quality="hd",
            n=1,
        )
        
        # 画像URLを取得
        image_url = response.data[0].url
        
        # 画像をダウンロード
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            # 保存先ディレクトリ
            save_dir = "public/images/ai-backgrounds"
            os.makedirs(save_dir, exist_ok=True)
            
            # ファイルパス
            filepath = os.path.join(save_dir, f"{filename}.png")
            
            # 画像を保存
            with open(filepath, 'wb') as f:
                f.write(img_response.content)
            
            print(f"✅ 背景生成完了: {filename}")
            return filepath
        else:
            print(f"❌ 画像ダウンロード失敗: {filename}")
            return None
            
    except Exception as e:
        print(f"❌ エラー発生 ({filename}): {str(e)}")
        return None

# プロンプトリスト
prompts = [
  {
    "name": "explosion-red",
    "prompt": "Explosive red and orange radial burst background with lightning effects, no text, no characters, abstract energy explosion, bright center fading to dark edges, digital art style"
  },
  {
    "name": "ocean-blue",
    "prompt": "Deep ocean blue gradient background with water ripples and bubbles, underwater lighting effects, no text, abstract aquatic theme, glowing particles"
  },
  {
    "name": "luxury-black",
    "prompt": "Premium black and gold abstract background, scattered gold dust particles, elegant gradients, no text, luxury theme, subtle diamond patterns"
  },
  {
    "name": "neon-cyber",
    "prompt": "Cyberpunk neon background with pink and blue glowing lines, digital grid pattern, no text, futuristic theme, laser lights"
  },
  {
    "name": "rainbow-party",
    "prompt": "Vibrant rainbow gradient explosion with confetti and sparkles, party celebration theme, no text, festive abstract background"
  },
  {
    "name": "fire-dragon",
    "prompt": "Fiery dragon flame background with swirling fire effects, red orange yellow gradients, no text, intense heat waves, ember particles"
  },
  {
    "name": "galaxy-purple",
    "prompt": "Cosmic purple galaxy background with stars and nebula, space theme, no text, swirling cosmic dust, glowing particles"
  },
  {
    "name": "golden-royal",
    "prompt": "Royal golden background with ornate patterns, luxury baroque style, no text, shimmering gold effects, elegant swirls"
  }
]

# メイン処理
def main():
    print("🎨 AI背景画像生成開始\n")
    
    generated_files = []
    
    for bg in prompts:
        print(f"生成中: {bg['name']}...")
        filepath = generate_background(bg['prompt'], bg['name'])
        if filepath:
            generated_files.append({
                'name': bg['name'],
                'path': filepath
            })
    
    # 結果を保存
    with open('ai-backgrounds-list.json', 'w') as f:
        json.dump(generated_files, f, indent=2)
    
    print(f"\n🎉 生成完了: {len(generated_files)}枚の背景")

if __name__ == "__main__":
    main()
