'use client';

import { Question } from '@/types/qna';
import Link from 'next/link';
import { FiMessageSquare, FiEye, FiTag, FiSearch } from 'react-icons/fi';

interface QuestionListProps {
  questions: Question[];
  viewMode?: 'table' | 'card';
  showSearchResults?: boolean;
  searchTerm?: string;
}

export default function QuestionList({ 
  questions, 
  viewMode = 'table',
  showSearchResults = false,
  searchTerm = ''
}: QuestionListProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getUsernameFromEmail = (email: string) => {
    return email.split('@')[0];
  };

  if (viewMode === 'card') {
    return (
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Link
                  href={`/qna/${question.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-violet-600"
                >
                  {question.title}
                </Link>
                <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {question.content}
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FiMessageSquare className="w-4 h-4" />
                    <span>{question.answerCount} 답변</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiEye className="w-4 h-4" />
                    <span>{question.viewCount} 조회</span>
                  </div>
                </div>
              </div>
              <div className="ml-6 flex flex-col items-end">
                <div className="text-sm text-gray-500">
                  {getUsernameFromEmail(question.authorEmail)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(question.createdAt)}
                </div>
                <div className="mt-2 flex gap-2">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-50 text-violet-600 text-xs"
                    >
                      <FiTag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table view (기본값)
  return (
    <div>
      {/* 검색 결과 표시 */}
      {showSearchResults && searchTerm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">"{searchTerm}"</span> 검색 결과: <span className="font-medium">{questions.length}개</span>
          </p>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">카테고리</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">제목</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">작성자</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">작성일</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">답변</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">조회</th>
              <th scope="col" className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {questions.length > 0 ? (
              questions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  {/* 카테고리: 1단계만 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">{question.category1}</span>
                  </td>
                  {/* 제목: 1줄만, 말줄임 */}
                  <td className="px-6 py-4 max-w-xs truncate">
                    <Link href={`/qna/${question.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer block truncate">
                      {question.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getUsernameFromEmail(question.authorEmail)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(question.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <FiMessageSquare className="w-4 h-4" />
                      <span>{question.answerCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FiEye className="w-4 h-4" />
                      <span>{question.viewCount}</span>
                    </div>
                  </td>
                  {/* 상태: 작성중, 승인, 거절, 공개, 비공개 중 1개만 노출 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      // mock 데이터 기준: status: 'OPEN' | 'CLOSED', isPublic: boolean
                      if (question.status === 'OPEN') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">진행중</span>;
                      if (question.status === 'CLOSED') return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">완료</span>;
                      if (question.isPublic) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">공개</span>;
                      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">비공개</span>;
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-24 text-center text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 질문이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 