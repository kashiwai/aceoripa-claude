'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { motion } from 'framer-motion';
import { CardData } from '@/types/gacha';

interface PokemonGachaEffectsProps {
  card: CardData;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  onComplete: () => void;
}

export const PokemonGachaEffects = ({ card, rarity, onComplete }: PokemonGachaEffectsProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const composerRef = useRef<EffectComposer>();

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js シーン設定
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // ポストプロセッシング
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    composer.addPass(new RenderPass(scene, camera));

    // Bloom効果（キラキラ感）
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // 強度
      0.4, // 半径
      0.85 // 閾値
    );
    composer.addPass(bloomPass);

    // レアリティ別演出
    switch (rarity) {
      case 'SSR':
        createSSREffect(scene, camera);
        break;
      case 'SR':
        createSREffect(scene, camera);
        break;
      case 'R':
        createREffect(scene, camera);
        break;
      default:
        createNEffect(scene, camera);
    }

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);
      updateEffects(scene, camera);
      composer.render();
    };
    animate();

    // 演出完了タイマー
    const duration = getRarityDuration(rarity);
    setTimeout(() => {
      onComplete();
    }, duration);

    // クリーンアップ
    return () => {
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [card, rarity, onComplete]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Three.js描画エリア */}
      <div ref={mountRef} className="absolute inset-0" />
      
      {/* UI オーバーレイ */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* パック開封アニメーション */}
        {rarity === 'SSR' && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 360, 720]
            }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute"
          >
            <PackOpeningAnimation />
          </motion.div>
        )}

        {/* カード出現 */}
        <motion.div
          initial={{ scale: 0, y: 100, rotateY: 0 }}
          animate={{ 
            scale: 1,
            y: 0,
            rotateY: [0, 360]
          }}
          transition={{ 
            delay: getRarityDelay(rarity),
            duration: 1.5,
            ease: "easeOut"
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative"
        >
          <CardReveal card={card} rarity={rarity} />
        </motion.div>

        {/* レアリティテキスト */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: getRarityDelay(rarity) + 0.5, duration: 0.5 }}
          className="absolute top-20"
        >
          <RarityText rarity={rarity} />
        </motion.div>
      </div>
    </div>
  );
};

// SSR演出：虹色オーラ、雷、星
function createSSREffect(scene: THREE.Scene, camera: THREE.Camera) {
  // 虹色パーティクル
  const particleCount = 1000;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 2 + Math.random() * 3;
    
    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = Math.sin(angle) * radius;
    positions[i3 + 2] = (Math.random() - 0.5) * 2;

    // 虹色
    const hue = i / particleCount;
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8
  });

  const particleSystem = new THREE.Points(particles, material);
  scene.add(particleSystem);

  // 雷エフェクト
  const lightningGeometry = new THREE.BufferGeometry();
  const lightningMaterial = new THREE.LineBasicMaterial({
    color: 0xffff00,
    linewidth: 3,
    transparent: true,
    opacity: 0.8
  });

  // モンスターボール
  const ballGeometry = new THREE.SphereGeometry(1, 32, 32);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5
  });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  scene.add(ball);

  // ライト
  const light = new THREE.PointLight(0xffffff, 2, 100);
  light.position.set(0, 0, 10);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);
}

// SR演出：炎、爆発
function createSREffect(scene: THREE.Scene, camera: THREE.Camera) {
  // 炎パーティクル
  const fireCount = 500;
  const fireGeometry = new THREE.BufferGeometry();
  const firePositions = new Float32Array(fireCount * 3);
  const fireColors = new Float32Array(fireCount * 3);

  for (let i = 0; i < fireCount; i++) {
    const i3 = i * 3;
    firePositions[i3] = (Math.random() - 0.5) * 4;
    firePositions[i3 + 1] = Math.random() * 3 - 1;
    firePositions[i3 + 2] = (Math.random() - 0.5) * 2;

    // 炎の色（赤〜オレンジ〜黄色）
    const t = Math.random();
    fireColors[i3] = 1;
    fireColors[i3 + 1] = t;
    fireColors[i3 + 2] = 0;
  }

  fireGeometry.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));
  fireGeometry.setAttribute('color', new THREE.BufferAttribute(fireColors, 3));

  const fireMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6
  });

  const fireSystem = new THREE.Points(fireGeometry, fireMaterial);
  scene.add(fireSystem);
}

// R演出：水、波紋
function createREffect(scene: THREE.Scene, camera: THREE.Camera) {
  // 水の波紋
  const rippleGeometry = new THREE.RingGeometry(0.1, 2, 32);
  const rippleMaterial = new THREE.MeshBasicMaterial({
    color: 0x0099ff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 5; i++) {
    const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial.clone());
    ripple.position.z = -i * 0.5;
    ripple.scale.set(1 + i * 0.3, 1 + i * 0.3, 1);
    scene.add(ripple);
  }
}

// N演出：シンプルな光
function createNEffect(scene: THREE.Scene, camera: THREE.Camera) {
  const glowGeometry = new THREE.SphereGeometry(1.5, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glow);
}

// エフェクト更新
function updateEffects(scene: THREE.Scene, camera: THREE.Camera) {
  const time = Date.now() * 0.001;

  scene.traverse((child) => {
    if (child instanceof THREE.Points) {
      child.rotation.y = time * 0.5;
      child.rotation.z = time * 0.2;
    }
    if (child instanceof THREE.Mesh) {
      if (child.geometry instanceof THREE.SphereGeometry) {
        child.rotation.y = time;
        const scale = 1 + Math.sin(time * 2) * 0.1;
        child.scale.set(scale, scale, scale);
      }
      if (child.geometry instanceof THREE.RingGeometry) {
        const scale = 1 + time * 0.5;
        child.scale.set(scale, scale, 1);
        child.material.opacity = Math.max(0, 0.5 - time * 0.1);
      }
    }
  });
}

// パック開封アニメーション
const PackOpeningAnimation = () => (
  <div className="relative w-64 h-96">
    <motion.div
      initial={{ rotateY: 0 }}
      animate={{ rotateY: 180 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 rounded-lg shadow-2xl"
      style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
    >
      <div className="flex items-center justify-center h-full">
        <span className="text-white text-2xl font-bold">Pokemon Pack</span>
      </div>
    </motion.div>
    <motion.div
      initial={{ rotateY: -180 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-2xl"
      style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
    />
  </div>
);

// カード表示
const CardReveal = ({ card, rarity }: { card: CardData; rarity: string }) => (
  <div className={`relative w-64 h-96 ${getRarityGlow(rarity)}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl">
      <div className="p-4">
        <h3 className="text-white text-xl font-bold">{card.name}</h3>
        <div className="mt-2">
          <img 
            src={card.imageUrl || '/placeholder-card.png'} 
            alt={card.name}
            className="w-full h-64 object-cover rounded"
          />
        </div>
      </div>
    </div>
    {rarity === 'SSR' && (
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-400/20 to-transparent animate-pulse" />
    )}
  </div>
);

// レアリティテキスト
const RarityText = ({ rarity }: { rarity: string }) => (
  <div className={`text-6xl font-bold ${getRarityTextStyle(rarity)}`}>
    {rarity}
  </div>
);

// ヘルパー関数
function getRarityDuration(rarity: string): number {
  const durations = { SSR: 8000, SR: 5000, R: 3000, N: 2000 };
  return durations[rarity as keyof typeof durations] || 2000;
}

function getRarityDelay(rarity: string): number {
  const delays = { SSR: 2, SR: 1.5, R: 1, N: 0.5 };
  return delays[rarity as keyof typeof delays] || 0.5;
}

function getRarityGlow(rarity: string): string {
  const glows = {
    SSR: 'shadow-[0_0_60px_20px_rgba(255,215,0,0.8)]',
    SR: 'shadow-[0_0_40px_15px_rgba(255,69,0,0.8)]',
    R: 'shadow-[0_0_30px_10px_rgba(0,191,255,0.8)]',
    N: 'shadow-[0_0_20px_5px_rgba(255,255,255,0.5)]'
  };
  return glows[rarity as keyof typeof glows] || '';
}

function getRarityTextStyle(rarity: string): string {
  const styles = {
    SSR: 'text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 animate-pulse',
    SR: 'text-orange-500 drop-shadow-[0_0_20px_rgba(255,69,0,0.8)]',
    R: 'text-blue-500 drop-shadow-[0_0_15px_rgba(0,191,255,0.8)]',
    N: 'text-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'
  };
  return styles[rarity as keyof typeof styles] || '';
}