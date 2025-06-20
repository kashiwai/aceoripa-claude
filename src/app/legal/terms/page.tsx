'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">販売業者</h2>
                <div className="space-y-2 text-gray-700">
                  <p><strong>会社名：</strong>株式会社ACEorIPA</p>
                  <p><strong>代表者：</strong>代表取締役 山田太郎</p>
                  <p><strong>所在地：</strong>〒100-0001 東京都千代田区丸の内1-1-1</p>
                  <p><strong>電話番号：</strong>03-1234-5678</p>
                  <p><strong>メールアドレス：</strong>info@aceoripa.com</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">販売価格</h2>
                <div className="text-gray-700">
                  <p>各商品ページに表示される価格（税込み）</p>
                  <p>ガチャポイント：1ポイント = 1円</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">商品代金以外の料金</h2>
                <div className="text-gray-700">
                  <p>・決済手数料：商品代金の3.6%</p>
                  <p>・送料：全国一律500円（税込）</p>
                  <p>・10,000円以上のお買い上げで送料無料</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">支払方法</h2>
                <div className="text-gray-700">
                  <p>・クレジットカード（VISA、MasterCard、JCB、American Express、Diners Club）</p>
                  <p>・デビットカード</p>
                  <p>・電子マネー（Apple Pay、Google Pay）</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">商品の引渡し時期</h2>
                <div className="text-gray-700">
                  <p>・デジタルカード：購入・ガチャ実行後即座にアカウントに追加</p>
                  <p>・実物カード：ご注文確認後、3-7営業日以内に発送</p>
                  <p>・在庫状況により遅れる場合があります</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">返品・交換について</h2>
                <div className="text-gray-700">
                  <p><strong>デジタルコンテンツ：</strong></p>
                  <p>・ガチャで獲得したデジタルカードの返品・交換は原則として承っておりません</p>
                  <p>・システム不具合による問題がある場合を除きます</p>
                  
                  <p className="mt-4"><strong>実物商品：</strong></p>
                  <p>・商品到着後7日以内にご連絡いただければ、返品・交換を承ります</p>
                  <p>・お客様都合による返品の場合、返送料はお客様負担となります</p>
                  <p>・商品に不具合がある場合は、当社負担で交換いたします</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">ガチャの確率表示</h2>
                <div className="text-gray-700">
                  <p>各ガチャの排出確率は商品ページに明記しております：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>SSR（最高レア）：3%</li>
                    <li>SR（高レア）：12%</li>
                    <li>R（レア）：25%</li>
                    <li>N（ノーマル）：60%</li>
                  </ul>
                  <p className="mt-2">※確率は変更される場合があります。最新の確率は商品ページをご確認ください。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">青少年保護について</h2>
                <div className="text-gray-700">
                  <p>・18歳未満の方のご利用には保護者の同意が必要です</p>
                  <p>・過度な課金を防ぐため、月額利用限度額の設定をお願いしております</p>
                  <p>・ギャンブル依存症に関する相談窓口をご案内しております</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">個人情報の取扱い</h2>
                <div className="text-gray-700">
                  <p>お客様の個人情報は、当社のプライバシーポリシーに基づき適切に管理いたします。</p>
                  <p>詳細は<a href="/legal/privacy" className="text-blue-600 hover:text-blue-800 underline">プライバシーポリシー</a>をご確認ください。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせ</h2>
                <div className="text-gray-700">
                  <p><strong>メールアドレス：</strong>support@aceoripa.com</p>
                  <p><strong>電話番号：</strong>03-1234-5678</p>
                  <p><strong>受付時間：</strong>平日 10:00-18:00（土日祝日を除く）</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">その他</h2>
                <div className="text-gray-700">
                  <p>・本サービスの利用には、別途定める利用規約が適用されます</p>
                  <p>・法令の変更等により、本表記の内容を変更する場合があります</p>
                  <p>・変更時は事前にウェブサイト上でお知らせいたします</p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
              <p>最終更新日：2024年6月20日</p>
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