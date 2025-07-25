import React from 'react';
import Link from 'next/link';

export default function ExpertDetailView() {
  // 임시 데이터 (디자인 확인용)
  const expert = {
    id: 1,
    name: '홍길동',
    email: 'honggildong@example.com',
    phone: '010-1234-5678',
    field: 'AI/머신러닝',
    status: '활성',
    createdAt: '2024-05-01',
    description: 'AI 및 머신러닝 분야의 전문가입니다. 다양한 프로젝트 경험이 있습니다.'
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">전문가 정보 조회</h1>
          <Link href="/admin/expert" className="text-blue-600 hover:underline text-sm">목록으로</Link>
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
            <span className="block text-gray-500 text-sm">전문 분야</span>
            <span className="block text-lg text-gray-900">{expert.field}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">상태</span>
            <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">{expert.status}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">가입일</span>
            <span className="block text-lg text-gray-900">{expert.createdAt}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-sm">소개</span>
            <span className="block text-lg text-gray-900 whitespace-pre-line">{expert.description}</span>
          </div>
        </div>
      </div>
    </main>
  );
} 