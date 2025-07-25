'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import UserManagement from '@/components/admin/UserManagement';
import OpinionManagement from '@/components/admin/OpinionManagement';
import CodeManagement from '@/components/admin/CodeManagement';
import ExpertManagement from '@/components/admin/ExpertManagement';
import ExpertFormModal from '@/components/admin/ExpertFormModal';
import { Expert } from '@/types/expert';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('experts');
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);

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
        <div className="sm:flex sm:items-end sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
            <p className="mt-1 text-sm text-gray-600">사용자 및 컨텐츠를 관리합니다.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  회원 관리
                </button>
                <button
                  onClick={() => setActiveTab('experts')}
                  className={`${
                    activeTab === 'experts'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  전문가 관리
                </button>
                <button
                  onClick={() => setActiveTab('opinions')}
                  className={`${
                    activeTab === 'opinions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Opinions 관리
                </button>
                <button
                  onClick={() => setActiveTab('codes')}
                  className={`${
                    activeTab === 'codes'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  공통코드 관리
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'experts' && (
            <ExpertManagement 
              onEditExpert={handleEditExpert}
              onCreateExpert={handleCreateExpert}
            />
          )}
          {activeTab === 'opinions' && <OpinionManagement />}
          {activeTab === 'codes' && <CodeManagement />}
        </div>
      </div>

      {/* 전문가 생성/수정 모달 */}
      {showExpertModal && (
        <ExpertFormModal
          expert={editingExpert}
          onClose={handleCloseExpertModal}
          onSuccess={() => {
            handleCloseExpertModal();
            // 페이지 새로고침 또는 상태 업데이트
            window.location.reload();
          }}
        />
      )}
    </main>
  );
} 