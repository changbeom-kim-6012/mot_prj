import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function QnAWritePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/qna" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <FiArrowLeft className="mr-2" />
          목록으로 돌아가기
        </Link>

        {/* Write Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Q&A 작성</h1>
            
            <form className="space-y-6">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">구분</label>
                <div className="flex gap-4">
                  <select
                    id="mainCategory"
                    className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">대분류 선택</option>
                    <option value="theory">이론/방법론</option>
                    <option value="system">R&D 시스템</option>
                  </select>
                  <select
                    id="subCategory"
                    className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="">소분류 선택</option>
                    <option value="strategy">기술전략</option>
                    <option value="research">연구관리</option>
                    <option value="resource">자원관리</option>
                    <option value="business">기술사업화</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  id="title"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="제목을 입력하세요"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  id="content"
                  rows={12}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="내용을 입력하세요"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공개 설정</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="public"
                      name="visibility"
                      value="public"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="public" className="ml-2 text-sm text-gray-700">공개</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="private"
                      name="visibility"
                      value="private"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="private" className="ml-2 text-sm text-gray-700">비공개</label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/qna"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 