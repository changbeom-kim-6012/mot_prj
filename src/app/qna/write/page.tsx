'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiSend, FiPaperclip, FiX } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { CodeSelectWithEtc } from '@/components/common/CodeSelectWithEtc';
import { motion } from 'framer-motion';

interface User {
  id: number;
  email: string;
  name: string;
}

export default function QnaWritePage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category1, setCategory1] = useState('');
  const [category1Etc, setCategory1Etc] = useState('');
  const [category1Id, setCategory1Id] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [contactInfo, setContactInfo] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);

  // 카테고리 목록 불러오기
  useEffect(() => {
    fetch('/api/codes/menu/qna/details')
      .then(res => res.json())
      .then(data => {
        console.log('Category API data:', data);
        if (Array.isArray(data)) {
          const categoryList = data.map((c: any) => ({ id: c.id, name: c.codeName }));
          setCategories(categoryList);
          
          // 기본 카테고리 설정
          if (categoryList.length > 0 && !category1) {
            const defaultCategory = categoryList[0];
            setCategory1(defaultCategory.name);
            setCategory1Id(defaultCategory.id);
            console.log('기본 카테고리 설정:', defaultCategory);
          }
        }
      })
      .catch(() => setCategories([]));
  }, []);

  // 사용자 로그인 시 이메일을 기본값으로 설정
  useEffect(() => {
    if (user && user.email && !contactInfo) {
      setContactInfo(user.email);
    }
  }, [user, contactInfo]);

  // 로그인 체크
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/qna/write');
    }
  }, [loading, isAuthenticated, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    setCategory1(categoryName);
    
    // 카테고리 이름으로 ID 찾기
    const category = categories.find(cat => cat.name === categoryName);
    const categoryId = category ? category.id : null;
    setCategory1Id(categoryId);
    
    console.log('선택된 카테고리:', categoryName);
    console.log('찾은 카테고리 ID:', categoryId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('질문을 등록하려면 로그인이 필요합니다.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // 디버깅을 위한 로그 추가
    console.log('전송할 isPublic 값:', isPublic);
    console.log('전송할 isPublic 타입:', typeof isPublic);
    console.log('전송할 카테고리 ID:', category1Id);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category1', category1);
      if (category1Id) {
        formData.append('category1Id', category1Id.toString());
      }
      formData.append('authorEmail', user.email);
      formData.append('isPublic', isPublic.toString());
      formData.append('contactInfo', contactInfo);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // FormData 내용 확인
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch('/api/questions', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('질문이 성공적으로 등록되었습니다.');
        router.push('/qna');
      } else {
        const errorText = await response.text();
        console.error('질문 등록 실패:', errorText);
        setError('질문 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error('질문 등록 중 오류:', err);
      setError('질문 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 인증 상태 확인 중이거나 리디렉션 중일 때 로딩 화면 표시
  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">인증 상태를 확인하는 중...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FiSend className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">질문 작성하기</h1>
            </div>
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/qna')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </motion.button>
          </div>
          <p className="text-gray-600">
            기술경영(MOT)과 관련된 궁금한 점을 질문하고 전문가의 답변을 받아보세요.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="space-y-6">
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p className="font-bold">오류가 발생했습니다</p>
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="질문의 핵심 내용을 제목으로 작성해주세요."
              />
            </div>

            <div>
              <label htmlFor="category1" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <select
                    value={category1}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">선택하세요</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {category1 === '기타' && (
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={category1Etc}
                      onChange={(e) => setCategory1Etc(e.target.value)}
                      placeholder="기타 카테고리를 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="질문의 상세 내용을 입력해주세요. 배경, 궁금한 점, 원하는 답변의 방향 등을 구체적으로 작성해주시면 더 좋은 답변을 받을 수 있습니다."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                공개 설정
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="true"
                    checked={isPublic === true}
                    onChange={() => setIsPublic(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <span className="font-medium">공개</span>
                    <span className="text-gray-500"> - 모든 사용자가 질문과 답변을 볼 수 있습니다.</span>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="false"
                    checked={isPublic === false}
                    onChange={() => setIsPublic(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <span className="font-medium">비공개</span>
                    <span className="text-gray-500"> - 작성자와 관리자만 질문과 답변을 볼 수 있습니다.</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                답변받을 연락처
              </label>
              <input
                type="text"
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이메일 또는 전화번호를 입력하세요. (선택)"
              />
            </div>

            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                첨부파일
              </label>
              <div className="mt-1">
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  <FiPaperclip className="mr-2 h-4 w-4" />
                  파일 선택
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                </label>
              </div>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FiPaperclip className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/qna')}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? '등록 중...' : '질문 등록하기'}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </main>
  );
} 