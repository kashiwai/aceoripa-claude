'use client'

export default function PrizeLawPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">景品表示法に基づく表示</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">当サービスにおける景品提供について</h2>
                <div className="text-gray-700">
                  <p>ACEorIPAは、景品表示法（不当景品類及び不当表示防止法）を遵守し、健全なサービス運営を行っております。</p>
                  <p>本ページでは、当サービスにおける景品類の提供に関する重要事項をご説明いたします。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">ガチャシステムの分類</h2>
                <div className="text-gray-700">
                  <p>当サービスのガチャシステムは、景品表示法における「懸賞」に該当いたします。</p>
                  <p>具体的には、以下の分類となります：</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li><strong>一般懸賞：</strong>購入者に対してランダムに景品（カード）を提供</li>
                    <li><strong>共同懸賞：</strong>特定期間のイベント等で実施される場合</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">景品類の最高額及び総額の制限</h2>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">一般懸賞の場合</h3>
                  <div className="text-blue-800 space-y-1">
                    <p>・懸賞に係る取引価額が5,000円未満：景品類の最高額 → 取引価額の20倍まで</p>
                    <p>・懸賞に係る取引価額が5,000円以上：景品類の最高額 → 10万円まで</p>
                    <p>・景品類の総額 → 懸賞に係る売上予定総額の2%まで</p>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <h3 className="font-semibold text-green-900 mb-2">共同懸賞の場合</h3>
                  <div className="text-green-800 space-y-1">
                    <p>・景品類の最高額 → 30万円まで</p>
                    <p>・景品類の総額 → 懸賞に係る売上予定総額の3%まで</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">当サービスにおける景品価額の設定</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ガチャ種類
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          取引価額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最高景品価額
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          法的上限
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ノーマルガチャ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          300円
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          5,000円
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          6,000円まで可能
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          プレミアムガチャ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          1,000円
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          15,000円
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          20,000円まで可能
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          スペシャルガチャ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          5,000円
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          80,000円
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          100,000円まで可能
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">確率の表示について</h2>
                <div className="text-gray-700">
                  <p>当サービスでは、景品表示法および消費者庁のガイドラインに従い、以下の情報を明確に表示しております：</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>各レアリティの排出確率</li>
                    <li>特定のカードの排出確率（該当する場合）</li>
                    <li>ガチャの実施期間</li>
                    <li>景品の総数（限定カードの場合）</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">コンプリートガチャ（コンプガチャ）について</h2>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-red-800">
                    <p className="font-semibold mb-2">重要な禁止事項</p>
                    <p>当サービスでは、景品表示法に基づき、以下の仕組みは一切実施しておりません：</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>特定の複数の景品を全て集めることを条件とする別の景品の提供</li>
                      <li>いわゆる「コンプリートガチャ」「コンプガチャ」</li>
                      <li>絵合わせ等の類似する仕組み</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">適正な表示の確保</h2>
                <div className="text-gray-700">
                  <p>当サービスでは、以下の取り組みにより適正な表示を確保しております：</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>景品類の価額表示の明確化</li>
                    <li>確率表示の正確性の確保</li>
                    <li>誇大広告の排除</li>
                    <li>定期的な法令遵守状況の確認</li>
                    <li>外部専門機関による監査の実施</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">青少年保護に関する取り組み</h2>
                <div className="text-gray-700">
                  <p>未成年者の保護および健全な利用環境の提供のため、以下の措置を講じております：</p>
                  <ul className="list-disc list-inside mt-4 space-y-2">
                    <li>年齢確認の実施</li>
                    <li>保護者同意の確認（18歳未満の場合）</li>
                    <li>月額利用限度額の設定機能</li>
                    <li>過度な利用に対する注意喚起</li>
                    <li>相談窓口の設置</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">監督機関・相談窓口</h2>
                <div className="text-gray-700">
                  <p><strong>消費者庁</strong></p>
                  <p>景品表示法に関するお問い合わせ</p>
                  <p>電話：03-3507-8800</p>
                  
                  <p className="mt-4"><strong>消費者ホットライン</strong></p>
                  <p>局番なし188（いやや）</p>
                  
                  <p className="mt-4"><strong>当サービスお問い合わせ</strong></p>
                  <p>メール：legal@aceoripa.com</p>
                  <p>電話：03-1234-5678</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">法令遵守の宣言</h2>
                <div className="text-gray-700">
                  <p>株式会社ACEorIPAは、景品表示法その他関連法令を遵守し、消費者の皆様に安心してご利用いただけるサービスの提供に努めております。</p>
                  <p>法令に違反する行為を発見された場合は、速やかにご連絡ください。適切に対応いたします。</p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
              <p>最終更新日：2024年6月20日</p>
              <p>制定日：2024年1月1日</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← トップページに戻る
          </a>
        </div>
      </div>
    </div>
  )
}