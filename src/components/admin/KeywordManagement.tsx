'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCheck, FiXCircle, FiList } from 'react-icons/fi';
import { getApiUrl } from '@/config/api';
import { useAuth } from '@/context/AuthContext';

interface Keyword {
  id: number;
  menuType: string;
  keyword: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const MENU_TYPES = ['Library', 'Learning', 'Research', 'Q&A'];

export default function KeywordManagement() {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [selectedMenuType, setSelectedMenuType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    keywords: '', // 쉼표로 구분된 키워드들
    menuTypes: ['Library'] as string[], // 선택된 메뉴 타입들 (다중 선택)
    description: '',
    isActive: true
  });

  // 키워드 목록 조회
  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl('/api/keywords');
      console.log('키워드 목록 조회 API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 에러 응답:', errorText);
        throw new Error(`키워드 목록 조회 실패: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('조회된 키워드 개수:', data.length);
      setKeywords(data);
    } catch (error) {
      console.error('키워드 목록 조회 실패 상세:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : '키워드 목록을 불러오는데 실패했습니다.';
      alert(`키워드 목록을 불러오는데 실패했습니다.\n\n원인: ${errorMessage}\n\n확인사항:\n1. 백엔드 서버가 실행 중인지 확인\n2. DB에 keywords 테이블이 생성되었는지 확인\n3. 브라우저 콘솔에서 상세 에러 확인`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  // 필터링된 키워드 목록
  const filteredKeywords = keywords.filter(keyword => {
    const matchesMenu = selectedMenuType === 'all' || keyword.menuType === selectedMenuType;
    const matchesSearch = searchTerm === '' || 
      keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (keyword.description && keyword.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMenu && matchesSearch;
  });

  // 메뉴별로 키워드 그룹화
  const keywordsByMenu = MENU_TYPES.reduce((acc, menuType) => {
    acc[menuType] = keywords
      .filter(k => k.menuType === menuType)
      .map(k => k.keyword)
      .sort();
    return acc;
  }, {} as Record<string, string[]>);

  // 모달 열기 (신규)
  const openCreateModal = () => {
    setFormData({
      keywords: '',
      menuTypes: ['Library'],
      description: '',
      isActive: true
    });
    setEditingKeyword(null);
    setIsModalOpen(true);
  };

  // 모달 열기 (수정)
  const openEditModal = (keyword: Keyword) => {
    setFormData({
      keywords: keyword.keyword, // 수정 시에는 단일 키워드
      menuTypes: [keyword.menuType], // 수정 시에는 단일 메뉴 타입
      description: keyword.description || '',
      isActive: keyword.isActive
    });
    setEditingKeyword(keyword);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingKeyword(null);
    setFormData({
      keywords: '',
      menuTypes: ['Library'],
      description: '',
      isActive: true
    });
  };

  // 메뉴 타입 체크박스 토글
  const handleMenuTypeToggle = (menuType: string) => {
    if (formData.menuTypes.includes(menuType)) {
      // 이미 선택된 경우 제거 (단, 최소 1개는 유지)
      if (formData.menuTypes.length > 1) {
        setFormData({
          ...formData,
          menuTypes: formData.menuTypes.filter(m => m !== menuType)
        });
      }
    } else {
      // 선택되지 않은 경우 추가
      setFormData({
        ...formData,
        menuTypes: [...formData.menuTypes, menuType]
      });
    }
  };

  // 키워드 저장 (생성/수정)
  const handleSave = async () => {
    if (!formData.keywords.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }

    if (formData.menuTypes.length === 0) {
      alert('메뉴 타입을 최소 1개 이상 선택해주세요.');
      return;
    }

    try {
      // 수정 모드인 경우: 단일 키워드 수정 (단일 메뉴 타입만)
      if (editingKeyword) {
        const url = getApiUrl(`/api/keywords/${editingKeyword.id}`);
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'User-Email': user?.email || ''
          },
          body: JSON.stringify({
            menuType: formData.menuTypes[0], // 수정 시에는 첫 번째 선택된 메뉴 타입 사용
            keyword: formData.keywords.trim(),
            description: formData.description,
            isActive: formData.isActive
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || '수정에 실패했습니다.');
        }

        alert('키워드가 수정되었습니다.');
        closeModal();
        fetchKeywords();
        return;
      }

      // 신규 등록 모드: 쉼표로 구분된 키워드들을 각 메뉴 타입별로 등록
      const keywordList = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywordList.length === 0) {
        alert('유효한 키워드를 입력해주세요.');
        return;
      }

      const url = getApiUrl('/api/keywords');
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      // 각 키워드와 각 메뉴 타입의 조합으로 등록
      for (const keyword of keywordList) {
        for (const menuType of formData.menuTypes) {
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Email': user?.email || ''
              },
              body: JSON.stringify({
                menuType: menuType,
                keyword: keyword,
                description: formData.description,
                isActive: formData.isActive
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              failCount++;
              errors.push(`${menuType} - ${keyword}: ${errorText}`);
            } else {
              successCount++;
            }
          } catch (error: any) {
            failCount++;
            errors.push(`${menuType} - ${keyword}: ${error.message || '등록 실패'}`);
          }
        }
      }

      if (failCount === 0) {
        alert(`${successCount}개의 키워드가 등록되었습니다.`);
      } else if (successCount > 0) {
        alert(`${successCount}개의 키워드가 등록되었고, ${failCount}개의 키워드 등록에 실패했습니다.\n\n실패한 키워드:\n${errors.join('\n')}`);
      } else {
        alert(`모든 키워드 등록에 실패했습니다.\n\n에러:\n${errors.join('\n')}`);
        return;
      }

      closeModal();
      fetchKeywords();
    } catch (error: any) {
      console.error('키워드 저장 실패:', error);
      alert(error.message || '키워드 저장에 실패했습니다.');
    }
  };

  // 키워드 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/keywords/${id}`), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.');
      }

      alert('키워드가 삭제되었습니다.');
      fetchKeywords();
    } catch (error) {
      console.error('키워드 삭제 실패:', error);
      alert('키워드 삭제에 실패했습니다.');
    }
  };

  // 키워드 활성화/비활성화
  const handleToggleActive = async (keyword: Keyword) => {
    try {
      const endpoint = keyword.isActive ? 'deactivate' : 'activate';
      const response = await fetch(getApiUrl(`/api/keywords/${keyword.id}/${endpoint}`), {
        method: 'PUT',
        headers: {
          'User-Email': user?.email || ''
        }
      });

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다.');
      }

      alert(keyword.isActive ? '키워드가 비활성화되었습니다.' : '키워드가 활성화되었습니다.');
      fetchKeywords();
    } catch (error: any) {
      console.error('키워드 상태 변경 실패:', error);
      alert(error.message || '키워드 상태 변경에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">키워드 관리</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsViewAllModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiList className="w-4 h-4 mr-2" />
              키워드 전체보기
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              키워드 등록
            </button>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          {/* 메뉴 타입 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">메뉴:</label>
            <select
              value={selectedMenuType}
              onChange={(e) => setSelectedMenuType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              {MENU_TYPES.map(menu => (
                <option key={menu} value={menu}>{menu}</option>
              ))}
            </select>
          </div>

          {/* 검색 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="키워드 검색..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* 결과 개수 */}
          <div className="text-sm text-gray-600">
            총 {filteredKeywords.length}개
          </div>
        </div>
      </div>

      {/* 키워드 목록 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                메뉴
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                키워드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredKeywords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || selectedMenuType !== 'all' 
                    ? '검색 결과가 없습니다.' 
                    : '등록된 키워드가 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredKeywords.map((keyword) => (
                <tr key={keyword.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {keyword.menuType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md truncate">
                      {keyword.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(keyword)}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        keyword.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {keyword.isActive ? (
                        <>
                          <FiCheck className="w-3 h-3 mr-1" />
                          활성
                        </>
                      ) : (
                        <>
                          <FiXCircle className="w-3 h-3 mr-1" />
                          비활성
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(keyword.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(keyword)}
                        className="text-blue-600 hover:text-blue-900"
                        title="수정"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(keyword.id)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 등록/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingKeyword ? '키워드 수정' : '키워드 등록'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-6 space-y-4">
              {/* 키워드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드 <span className="text-red-500">*</span>
                  {!editingKeyword && (
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (쉼표로 구분하여 여러 개 입력 가능)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder={editingKeyword ? "키워드를 입력하세요" : "키워드1, 키워드2, 키워드3"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {!editingKeyword && formData.keywords && (
                  <div className="mt-2 text-xs text-gray-500">
                    입력된 키워드: {formData.keywords.split(',').map(k => k.trim()).filter(k => k).length}개
                  </div>
                )}
              </div>

              {/* 메뉴 타입 (다중 선택) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메뉴 타입 <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (복수 선택 가능)
                  </span>
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="flex gap-2">
                    {MENU_TYPES.map(menu => {
                      const isChecked = formData.menuTypes.includes(menu);
                      return (
                        <label
                          key={menu}
                          className={`flex items-center justify-center flex-1 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleMenuTypeToggle(menu)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={isChecked && formData.menuTypes.length === 1}
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {menu}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="키워드에 대한 설명을 입력하세요 (선택사항)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* 활성화 여부 */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">활성화</span>
                </label>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingKeyword ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 키워드 전체보기 모달 */}
      {isViewAllModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-gray-900">키워드 전체보기</h3>
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {MENU_TYPES.map(menuType => {
                  const menuKeywords = keywordsByMenu[menuType] || [];
                  return (
                    <div key={menuType} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                        {menuType}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({menuKeywords.length}개)
                        </span>
                      </h4>
                      {menuKeywords.length === 0 ? (
                        <div className="text-sm text-gray-400 italic py-4">
                          등록된 키워드가 없습니다.
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {menuKeywords.map((keyword, index) => (
                            <span
                              key={`${menuType}-${keyword}-${index}`}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-900"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end">
              <button
                onClick={() => setIsViewAllModalOpen(false)}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

