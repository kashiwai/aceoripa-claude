#!/usr/bin/env python3
import urllib.request
import json

try:
    print("APIをテスト中...")
    with urllib.request.urlopen('http://localhost:3000/api/admin/cards/without-images', timeout=90) as response:
        data = json.loads(response.read().decode())

    print(f"\n画像なしカード数: {data.get('totalWithoutImages', 0)}件")
    print(f"総画像数: {data.get('totalImages', 0)}件")
    print(f"返されたカード数: {len(data.get('cards', []))}件")

    if len(data.get('cards', [])) > 0:
        print(f"\n最初の3件のカード:")
        for i, item in enumerate(data['cards'][:3]):
            card = item['card']
            print(f"\n{i+1}. {card['card_name']}")
            print(f"   image_url: {card.get('image_url', 'なし')}")
            print(f"   候補数: {len(item['candidates'])}件")
    else:
        print("\nカードが返されませんでした")

except Exception as e:
    print(f"エラー: {e}")
