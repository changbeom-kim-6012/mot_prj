'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import UserManagement from '@/components/admin/UserManagement';
import OpinionManagement from '@/components/admin/OpinionManagement';
import CodeManagement from '@/components/admin/CodeManagement';
import ExpertManagement from '@/components/admin/ExpertManagement';
import ExpertFormModal from '@/components/admin/ExpertFormModal';
import NoticeManagement from '@/components/admin/NoticeManagement';
import { Expert } from '@/types/expert';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, isAuthenticated, loading, isLoggingOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('experts');
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

  // 관리자 권한 확인 (로딩 완료 후에만 실행)
  useEffect(() => {
    if (loading) return; // 로딩 중이면 아무것도 하지 않음
    
    if (!isAuthenticated) {
      // 로그아웃 중이 아닌 경우에만 alert 표시
      if (!isLoggingOut) {
        alert('로그인이 필요합니다.');
      }
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'ADMIN') {
      alert('관리자 권한이 필요합니다.');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router, loading, isLoggingOut]);


  // 로딩 중이거나 관리자가 아닌 경우 로딩 표시
  if (loading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {loading ? '로딩 중...' : '권한을 확인하는 중...'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const handleCreateExpert = () => {
    setEditingExpert(null);
    setShowExpertModal(true);
  };

  const handleEditExpert = (expert: Expert) => {
    setEditingExpert(expert);
    setShowExpertModal(true);
  };

  const handleCloseExpertModal = () => {
    setShowExpertModal(false);
    setEditingExpert(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 페이지</h1>
          <p className="text-sm text-gray-600">사용자 및 컨텐츠를 관리합니다.</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                회원 관리
              </button>
              <button
                onClick={() => setActiveTab('experts')}
                className={`${
                  activeTab === 'experts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                전문가 관리
              </button>
              <button
                onClick={() => setActiveTab('opinions')}
                className={`${
                  activeTab === 'opinions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Opinions 관리
              </button>
              <button
                onClick={() => setActiveTab('codes')}
                className={`${
                  activeTab === 'codes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                공통코드 관리
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`${
                  activeTab === 'notices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                공지사항 관리
              </button>
            </nav>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'experts' && (
            <ExpertManagement 
              onEditExpert={handleEditExpert}
              onCreateExpert={handleCreateExpert}
              showExpertModal={showExpertModal}
            />
          )}
          {activeTab === 'opinions' && <OpinionManagement />}
          {activeTab === 'codes' && <CodeManagement />}
          {activeTab === 'notices' && <NoticeManagement />}
        </div>
      </div>

      {/* 전문가 생성/수정 모달 */}
      {showExpertModal && (
        <ExpertFormModal
          expert={editingExpert}
          onClose={handleCloseExpertModal}
        />
      )}
    </main>
  );
} 