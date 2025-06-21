'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">基本方針</h2>
                <div className="text-gray-700">
                  <p>株式会社ACEorIPA（以下「当社」）は、個人情報の重要性を認識し、個人情報の保護に関する法律（個人情報保護法）その他の関連法令等を遵守するとともに、以下のプライバシーポリシー（以下「本ポリシー」）に従って、個人情報を適切に取り扱います。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">個人情報の定義</h2>
                <div className="text-gray-700">
                  <p>本ポリシーにおいて「個人情報」とは、個人情報保護法第2条第1項に定義される個人情報を指します。具体的には、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含む）をいいます。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">収集する個人情報</h2>
                <div className="text-gray-700">
                  <p>当社は、以下の個人情報を収集いたします：</p>
                  
                  <h3 className="font-semibold mt-4 mb-2">1. お客様ご自身にご提供いただく情報</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>氏名、ニックネーム</li>
                    <li>メールアドレス</li>
                    <li>電話番号</li>
                    <li>住所</li>
                    <li>生年月日</li>
                    <li>性別</li>
                    <li>クレジットカード情報（決済代行会社経由で処理）</li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">2. サービス利用により自動的に収集される情報</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>IPアドレス</li>
                    <li>ブラウザの種類とバージョン</li>
                    <li>オペレーティングシステム</li>
                    <li>アクセス日時</li>
                    <li>利用状況（ページビュー、クリック等）</li>
                    <li>デバイス情報（端末識別子等）</li>
                    <li>ガチャ利用履歴</li>
                    <li>ゲーム内行動データ</li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">3. Cookie等の技術により収集される情報</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Cookie情報</li>
                    <li>Web beacon情報</li>
                    <li>ローカルストレージ情報</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">個人情報の利用目的</h2>
                <div className="text-gray-700">
                  <p>当社は、収集した個人情報を以下の目的で利用いたします：</p>
                  
                  <h3 className="font-semibold mt-4 mb-2">1. サービス提供のため</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>ユーザー認証・本人確認</li>
                    <li>サービスの提供・運営</li>
                    <li>ガチャシステムの提供</li>
                    <li>ユーザーサポート・問い合わせ対応</li>
                    <li>商品の配送</li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">2. サービス改善のため</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>サービス利用状況の分析</li>
                    <li>新機能の開発・改善</li>
                    <li>不具合の調査・修正</li>
                    <li>セキュリティの向上</li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">3. マーケティング・コミュニケーションのため</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>お知らせ・情報提供</li>
                    <li>キャンペーン・イベント情報の配信</li>
                    <li>アンケート調査の実施</li>
                    <li>プッシュ通知の配信</li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">4. 法的義務の履行のため</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>法令に基づく報告・届出</li>
                    <li>不正利用・詐欺の防止</li>
                    <li>利用規約違反の調査・対応</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">個人情報の第三者提供</h2>
                <div className="text-gray-700">
                  <p>当社は、以下の場合を除き、お客様の個人情報を第三者に提供いたしません：</p>
                  
                  <h3 className="font-semibold mt-4 mb-2">1. お客様の同意がある場合</h3>
                  
                  <h3 className="font-semibold mt-4 mb-2">2. 法令に基づく場合</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>法律、法令、条例等に基づく要請</li>
                    <li>裁判所の命令</li>
                    <li>警察等の捜査機関からの要請</li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">3. 業務委託の場合</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>決済処理業者（Square Inc.等）</li>
                    <li>配送業者</li>
                    <li>データ解析業者</li>
                    <li>カスタマーサポート業者</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">※委託先には適切な管理監督を行います</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">個人情報の保管・セキュリティ</h2>
                <div className="text-gray-700">
                  <p>当社は、個人情報の安全管理のために以下の措置を講じております：</p>
                  
                  <ul className="list-disc list-inside space-y-1">
                    <li>SSL/TLS暗号化通信の使用</li>
                    <li>ファイアウォールによるネットワーク保護</li>
                    <li>アクセス権限の厳格な管理</li>
                    <li>定期的なセキュリティ監査</li>
                    <li>従業員への教育・研修</li>
                    <li>不正アクセス監視システム</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">個人情報の保存期間</h2>
                <div className="text-gray-700">
                  <p>当社は、個人情報を以下の期間保存いたします：</p>
                  
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>アカウント情報：</strong>退会から3年間</li>
                    <li><strong>取引記録：</strong>取引完了から7年間（税法等の要請による）</li>
                    <li><strong>アクセスログ：</strong>3ヶ月間</li>
                    <li><strong>問い合わせ記録：</strong>2年間</li>
                  </ul>
                  
                  <p className="mt-4">保存期間経過後は、速やかに削除または匿名化処理を行います。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">お客様の権利</h2>
                <div className="text-gray-700">
                  <p>お客様は、ご自身の個人情報について以下の権利を有します：</p>
                  
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>開示請求権：</strong>個人情報の利用状況の開示を求める権利</li>
                    <li><strong>訂正・追加・削除請求権：</strong>個人情報の訂正等を求める権利</li>
                    <li><strong>利用停止請求権：</strong>個人情報の利用停止を求める権利</li>
                    <li><strong>消去請求権：</strong>個人情報の消去を求める権利</li>
                  </ul>
                  
                  <p className="mt-4">これらの権利を行使される場合は、以下の連絡先までお問い合わせください。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie等の使用について</h2>
                <div className="text-gray-700">
                  <p>当社では、サービスの利便性向上のため、Cookie等の技術を使用しております：</p>
                  
                  <h3 className="font-semibold mt-4 mb-2">使用目的</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>ログイン状態の維持</li>
                    <li>ユーザー設定の保存</li>
                    <li>サイト利用状況の分析</li>
                    <li>広告の最適化</li>
                  </ul>

                  <h3 className="font-semibold mt-4 mb-2">第三者Cookie</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Google Analytics</li>
                    <li>Google AdSense</li>
                    <li>Facebook Pixel</li>
                    <li>Twitter Analytics</li>
                  </ul>
                  
                  <p className="mt-4">Cookieの使用を希望されない場合は、ブラウザの設定により無効にすることができます。ただし、一部機能がご利用いただけない場合があります。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">未成年者の個人情報について</h2>
                <div className="text-gray-700">
                  <p>18歳未満の方が当サービスをご利用いただく場合は、保護者の同意が必要です。</p>
                  <p>また、13歳未満の方の個人情報については、特に慎重に取り扱い、保護者の方への定期的な報告を行います。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">プライバシーポリシーの変更</h2>
                <div className="text-gray-700">
                  <p>当社は、法令の改正やサービス内容の変更等に伴い、本ポリシーを変更することがあります。</p>
                  <p>重要な変更については、ウェブサイト上での掲示やメール通知により、事前にお知らせいたします。</p>
                  <p>変更後のプライバシーポリシーは、掲載された時点から効力を生じるものとします。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせ窓口</h2>
                <div className="text-gray-700">
                  <p>個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：</p>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p><strong>株式会社ACEorIPA 個人情報保護担当</strong></p>
                    <p><strong>メールアドレス：</strong>privacy@aceoripa.com</p>
                    <p><strong>電話番号：</strong>03-1234-5678</p>
                    <p><strong>受付時間：</strong>平日 10:00-18:00（土日祝日を除く）</p>
                    <p><strong>住所：</strong>〒100-0001 東京都千代田区丸の内1-1-1</p>
                  </div>
                  
                  <p className="mt-4">※お問い合わせの際は、ご本人確認のため必要な情報をお聞きする場合があります。</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">認定個人情報保護団体</h2>
                <div className="text-gray-700">
                  <p>当社の個人情報の取り扱いに関して苦情がある場合は、以下の認定個人情報保護団体にもご相談いただけます：</p>
                  
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p><strong>一般財団法人日本情報経済社会推進協会（JIPDEC）</strong></p>
                    <p><strong>個人情報保護苦情相談室</strong></p>
                    <p><strong>電話番号：</strong>03-5860-7565</p>
                    <p><strong>メール：</strong>privacy@jipdec.or.jp</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-500">
              <p>制定日：2024年1月1日</p>
              <p>最終更新日：2024年6月20日</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}