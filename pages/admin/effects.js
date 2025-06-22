import { useState } from 'react';
import Head from 'next/head';
import GachaEffectMain from '../../src/components/GachaEffectSystem/GachaEffectMain';

export default function EffectsAdmin() {
  return (
    <>
      <Head>
        <title>ガチャ演出管理 - 管理画面</title>
        <meta name="description" content="ガチャ演出の設定・プレビュー・動画生成" />
      </Head>
      
      <GachaEffectMain />
    </>
  );
}