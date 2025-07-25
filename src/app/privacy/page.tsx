import Navigation from '@/components/Navigation';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 sm:p-10 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">개인정보보호 정책</h1>
          
          <div className="space-y-6 text-gray-600">
            <p><strong>최종 수정일:</strong> 2025년 6월 20일</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">1. 총칙</h2>
              <p>MOT Club (이하 '회사')는 귀하의 개인정보를 매우 중요하게 생각하며, '정보통신망 이용촉진 및 정보보호'에 관한 법률을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 귀하께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">2. 수집하는 개인정보의 항목</h2>
              <p>회사는 회원가입, 상담, 서비스 신청 등등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
              <ul className="list-disc list-inside mt-2">
                <li>수집항목: 이름, 이메일, 비밀번호</li>
                <li>개인정보 수집방법: 홈페이지(회원가입)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">3. 개인정보의 수집 및 이용목적</h2>
              <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
              <ul className="list-disc list-inside mt-2">
                <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                <li>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인</li>
                <li>마케팅 및 광고에 활용: 신규 서비스(제품) 개발 및 특화, 이벤트 등 광고성 정보 전달</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">4. 개인정보의 보유 및 이용기간</h2>
              <p>원칙적으로, 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.</p>
            </section>

            <p>더 자세한 내용은 고객센터로 문의해주시기 바랍니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 