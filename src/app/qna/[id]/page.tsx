import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

type Props = {
  params: {
    id: string;
  };
};

export default function QnADetailPage({ params }: Props) {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/qna" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <FiArrowLeft className="mr-2" />
          목록으로 돌아가기
        </Link>

        {/* Question Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            {/* Question Header */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">MOT 시스템 구축 관련 문의드립니다.</h1>
                <span className="text-sm text-gray-500">2024-03-19</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">작성자: 홍길동</span>
                  <span className="text-sm text-gray-600">구분: 기술전략</span>
                  <span className="text-sm text-gray-600">공개</span>
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="prose max-w-none">
              <p>안녕하세요,</p>
              <p className="mt-4">
                MOT 시스템 구축과 관련하여 몇 가지 문의사항이 있어 글을 남깁니다.
                현재 저희 회사는 R&D 프로젝트 관리를 위한 시스템을 구축하려고 하는데,
                다음과 같은 부분들에 대해 조언을 구하고 싶습니다.
              </p>
              <ol className="list-decimal pl-4 mt-4">
                <li>프로젝트 관리 시스템의 핵심 기능은 어떤 것들이 있나요?</li>
                <li>시스템 구축 시 주의해야 할 점은 무엇인가요?</li>
                <li>일반적인 구축 기간과 비용은 어느 정도인가요?</li>
              </ol>
              <p className="mt-4">
                답변 부탁드립니다. 감사합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiMessageSquare className="mr-2" />
              답변 (2)
            </h2>

            {/* Comment List */}
            <div className="space-y-6">
              {/* Comment 1 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">김전문</span>
                    <span className="text-sm text-gray-500">2024-03-19 14:30</span>
                  </div>
                </div>
                <p className="text-gray-600">
                  프로젝트 관리 시스템의 핵심 기능으로는 일정관리, 자원관리, 예산관리, 
                  위험관리 등이 있습니다. 특히 R&D 프로젝트의 특성상 연구 성과물 관리와 
                  지식재산권 관리 기능도 중요합니다.
                </p>
              </div>

              {/* Comment 2 */}
              <div className="pb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">이컨설턴트</span>
                    <span className="text-sm text-gray-500">2024-03-19 15:45</span>
                  </div>
                </div>
                <p className="text-gray-600">
                  구축 기간은 보통 3-6개월 정도 소요되며, 비용은 시스템의 규모와 
                  요구사항에 따라 크게 달라질 수 있습니다. 
                </p>
              </div>
            </div>

            {/* Comment Form */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">답변 작성</h3>
              <div className="space-y-4">
                <textarea
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="답변을 작성해주세요..."
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    답변 등록
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 