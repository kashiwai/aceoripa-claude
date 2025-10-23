# ガチャ演出仕様書 - AI動画生成版

## 1. 演出コンセプト

### 1.1 基本方針
- **Veo3**や**Sora**などのAI動画生成サービスを活用
- 8秒×2本の動画で構成（前半：期待感演出、後半：カード登場演出）
- 音声も含めて生成し、没入感のある演出を実現

### 1.2 レアリティ別演出テーマ
- **SS賞**: 宇宙・神話的な壮大な演出
- **S賞**: 炎・雷などのエレメンタルな演出
- **A賞**: 星空・オーロラなどの美しい演出
- **B賞**: 花・自然などの穏やかな演出
- **C賞**: シンプルで心地よい演出

## 2. 動画構成（8秒×2本）

### 2.1 前半動画（期待感演出）- 8秒
```
[0-2秒] イントロ
- 暗闇から徐々に光が集まる
- 低音のビルドアップサウンド
- カメラがゆっくりズームイン

[2-5秒] テンション上昇
- 光のパーティクルが渦を巻き始める
- 音楽のテンポが上がる
- 色彩が徐々に豊かになる

[5-8秒] クライマックス直前
- エネルギーが最高潮に
- 一瞬の静寂（ため）
- 画面が白くフラッシュ
```

### 2.2 後半動画（カード登場演出）- 8秒
```
[0-2秒] カード出現
- 爆発的なエフェクトと共にカード登場
- インパクトサウンド
- カメラの回転演出

[2-5秒] カード詳細表示
- カードが中央で回転
- レアリティに応じた背景エフェクト
- カード名の表示アニメーション

[5-8秒] 祝福演出
- 花火や星などの祝福エフェクト
- 勝利のファンファーレ
- フェードアウト
```

## 3. レアリティ別演出詳細

### 3.1 SS賞 - 「宇宙の創生」
**前半プロンプト例**:
```
"A cosmic void gradually fills with golden stardust, swirling into a galaxy formation. 
Divine light rays pierce through nebula clouds. Epic orchestral crescendo with choir. 
Camera slowly zooms into the center of the galaxy. 8 seconds, cinematic quality."
```

**後半プロンプト例**:
```
"A legendary Pokemon card emerges from a supernova explosion, floating in space 
surrounded by rainbow auroras. The card rotates majestically with holographic effects. 
Triumphant orchestral finale with bells. Golden particles rain down. 8 seconds."
```

### 3.2 S賞 - 「元素の舞」
**前半プロンプト例**:
```
"Fire and lightning dance together in a mesmerizing spiral. Red and purple energy 
builds up in intensity. Electronic music with Japanese taiko drums. Dynamic camera 
movement following the energy flow. 8 seconds, high energy."
```

**後半プロンプト例**:
```
"A rare Pokemon card materializes from elemental flames, glowing with inner fire. 
The card spins with fire tornado effects. Victory fanfare with rock guitar. 
Ember particles float upward. 8 seconds."
```

### 3.3 A賞 - 「星降る夜」
**前半プロンプト例**:
```
"Northern lights shimmer across a starry sky. Shooting stars converge to one point. 
Ethereal piano melody with strings. Gentle camera pan following the light trails. 
8 seconds, dreamy atmosphere."
```

**後半プロンプト例**:
```
"A special Pokemon card descends from the stars, glowing softly. The card floats 
gracefully with stardust trails. Magical chime sounds with harp. Constellation 
patterns form around the card. 8 seconds."
```

## 4. 実装方法

### 4.1 動画ファイル構成
```
public/videos/gacha/
├── ss_intro.mp4      # SS賞前半
├── ss_reveal.mp4     # SS賞後半
├── s_intro.mp4       # S賞前半
├── s_reveal.mp4      # S賞後半
├── a_intro.mp4       # A賞前半
├── a_reveal.mp4      # A賞後半
├── b_intro.mp4       # B賞前半
├── b_reveal.mp4      # B賞後半
└── c_intro.mp4       # C賞前半
    c_reveal.mp4      # C賞後半
```

### 4.2 React実装例
```typescript
const GachaAnimation = ({ rarity, cardData, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'reveal'>('intro');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videoSources = {
    intro: `/videos/gacha/${rarity.toLowerCase()}_intro.mp4`,
    reveal: `/videos/gacha/${rarity.toLowerCase()}_reveal.mp4`
  };
  
  const handleVideoEnd = () => {
    if (phase === 'intro') {
      setPhase('reveal');
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        src={videoSources[phase]}
        className="w-full h-full object-cover"
        autoPlay
        onEnded={handleVideoEnd}
      />
      
      {phase === 'reveal' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={cardData.imageUrl} 
            className="w-64 h-64 object-contain animate-float"
            style={{ 
              animation: 'float 2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))' 
            }}
          />
        </div>
      )}
    </div>
  );
};
```

### 4.3 カード合成処理
動画の後半でカード画像を動的に合成：
1. 動画は透明部分（アルファチャンネル）を含む
2. JavaScriptでカード画像をオーバーレイ
3. WebGLシェーダーでエフェクト追加

## 5. 音響設計

### 5.1 効果音の構成
- **イントロ**: 低音のハム音→徐々に高まる
- **ビルドアップ**: リズミカルなビート追加
- **クライマックス**: 爆発音・衝撃音
- **リビール**: きらめき音・ベル音
- **フィナーレ**: 勝利のファンファーレ

### 5.2 レアリティ別音響
- **SS**: 壮大なオーケストラ＋聖歌隊
- **S**: ロック＋和太鼓
- **A**: ピアノ＋ストリングス
- **B**: アコースティックギター
- **C**: シンプルなチャイム

## 6. パフォーマンス最適化

### 6.1 動画の仕様
- **解像度**: 1920×1080（フルHD）
- **フレームレート**: 30fps
- **ビットレート**: 5Mbps
- **フォーマット**: MP4（H.264）
- **ファイルサイズ**: 各5MB以下

### 6.2 プリロード戦略
```typescript
// ガチャ画面表示時に事前読み込み
useEffect(() => {
  const preloadVideos = async () => {
    const videos = [
      'ss_intro.mp4', 'ss_reveal.mp4',
      's_intro.mp4', 's_reveal.mp4',
      // ... 他のレアリティ
    ];
    
    videos.forEach(video => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = `/videos/gacha/${video}`;
      document.head.appendChild(link);
    });
  };
  
  preloadVideos();
}, []);
```

## 7. フォールバック対応

### 7.1 動画が再生できない場合
- Canvas/WebGLベースのアニメーション
- Lottieアニメーション
- CSSアニメーション

### 7.2 低スペック端末対応
- 動画品質の自動調整
- 簡易版アニメーションへの切り替え
- スキップオプションの提供

---

この仕様に基づいて、Veo3やSoraなどで動画を生成し、
より感動的なガチャ演出を実現します。