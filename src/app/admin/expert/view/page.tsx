import React from 'react';
import Link from 'next/link';

export default function ExpertDetailView() {
  // 임시 데이터 (테이블 구조에 맞게 수정)
  const expert = {
    id: 1,
    name: '홍길동',
    email: 'honggildong@example.com',
    phone: '010-1234-5678',
    organization: '한국기술경영연구원',
    position: '수석연구원',
    education: '서울대 박사',
    career: '삼성전자 10년, 서울대 교수 5년',
    field: 'AI/머신러닝',
    status: 'ACTIVE',
    createdAt: '2024-05-01',
    lastLogin: '2024-05-10'
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">전문가 정보 조회</h1>
          <Link href="/admin" className="text-blue-600 hover:underline text-sm">목록으로</Link>
        </div>
        <div className="space-y-4">
          <div>
            <span className="block text-gray-500 text-sm">이름</span>
            <span className="block text-lg font-medium text-gray-900">{expert.name}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">이메일</span>
            <span className="block text-lg text-gray-900">{expert.email}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">연락처</span>
            <span className="block text-lg text-gray-900">{expert.phone}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">소속기관</span>
            <span className="block text-lg text-gray-900">{expert.organization}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">직책/직급</span>
            <span className="block text-lg text-gray-900">{expert.position}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">학력</span>
            <span className="block text-lg text-gray-900">{expert.education}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">경력</span>
            <span className="block text-lg text-gray-900 whitespace-pre-line">{expert.career}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">전문 분야</span>
            <span className="block text-lg text-gray-900">{expert.field}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">상태</span>
            <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">{expert.status === 'ACTIVE' ? '활성' : '비활성'}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">가입일</span>
            <span className="block text-lg text-gray-900">{expert.createdAt}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">최근 로그인</span>
            <span className="block text-lg text-gray-900">{expert.lastLogin}</span>
          </div>
        </div>
      </div>
    </main>
  );
} 