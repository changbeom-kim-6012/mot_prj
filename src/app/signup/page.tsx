'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role] = useState('USER'); // 기본값을 일반사용자로 고정
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [isModalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('http://mot.erns.co.kr:8082/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || '회원가입에 실패했습니다.');
        } catch (parseError) {
          throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
        }
      }

      // 회원가입 성공
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      router.push('/login');

    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const PrivacyPolicyContent = () => (
    <div className="space-y-4 text-sm text-gray-600">
      <p><strong>최종 수정일:</strong> 2025년 6월 20일</p>
      <section>
        <h3 className="font-semibold text-gray-800">1. 총칙</h3>
        <p>MOT Club (이하 '회사')는 귀하의 개인정보를 매우 중요하게 생각하며, '정보통신망 이용촉진 및 정보보호'에 관한 법률을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 귀하께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.</p>
      </section>
      <section>
        <h3 className="font-semibold text-gray-800">2. 수집하는 개인정보의 항목</h3>
        <p>회사는 회원가입, 상담, 서비스 신청 등등을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
        <ul className="list-disc list-inside mt-1">
          <li>수집항목: 이메일, 비밀번호</li>
          <li>개인정보 수집방법: 홈페이지(회원가입)</li>
        </ul>
      </section>
      <section>
        <h3 className="font-semibold text-gray-800">3. 개인정보의 수집 및 이용목적</h3>
        <p>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</p>
        <ul className="list-disc list-inside mt-1">
          <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
          <li>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인</li>
        </ul>
      </section>
      <p>더 자세한 내용은 고객센터로 문의해주시기 바랍니다.</p>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-32 px-4 sm:px-6 lg:px-8" style={{ marginTop: '60px' }}>
          <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-lg shadow-md">
            <div>
                              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                MOT Club 가입
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  로그인
                </Link>
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">

                <div>
                  <label htmlFor="name" className="sr-only">
                    이름
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                    className="block w-full p-3 border-gray-300 bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="이름"
                  />
                </div>

                <div>
                  <label htmlFor="email-address" className="sr-only">
                    이메일 주소
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="block w-full p-3 border-gray-300 bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="이메일 주소"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    비밀번호
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="block w-full p-3 border-gray-300 bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="비밀번호"
                    style={{ imeMode: 'inactive' }}
                  />
                </div>
                <div>
                  <label htmlFor="password-confirm" className="sr-only">
                    비밀번호 확인
                  </label>
                  <input
                    id="password-confirm"
                    name="password-confirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="block w-full p-3 border-gray-300 bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="비밀번호 확인"
                    style={{ imeMode: 'inactive' }}
                  />
                  {passwordConfirm ? (
                    password === passwordConfirm ? (
                      <p className="mt-2 text-xs text-green-600">비밀번호가 일치합니다.</p>
                    ) : (
                      <p className="mt-2 text-xs text-red-600">비밀번호가 일치하지 않습니다.</p>
                    )
                  ) : null}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center">
                <input
                  id="privacy-policy"
                  name="privacy-policy"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="privacy-policy" className="ml-2 block text-sm text-gray-900">
                  <button type="button" onClick={() => setModalOpen(true)} className="font-medium text-blue-600 hover:text-blue-500 underline">
                    개인정보보호 정책
                  </button>
                  에 동의합니다.
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? '가입 처리 중...' : '가입하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)}
        title="개인정보보호 정책"
      >
        <PrivacyPolicyContent />
      </PrivacyPolicyModal>
    </>
  );
} 