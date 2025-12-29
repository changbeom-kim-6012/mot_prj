'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import React from 'react';
import axios from 'axios';
import { getApiUrl } from '@/config/api';

// Updated type definitions to support hierarchy
type CommonCode = {
  id: number;
  menuName: string;
  codeName: string;
  codeValue: string;
  description?: string;
  sortOrder?: number;
  parentId?: number | null;
  children?: CommonCode[];
};

const MENU_OPTIONS = ['Library', 'Learning', 'Q&A', 'Research'];

export default function CodeManagement() {
  const [codes, setCodes] = useState<CommonCode[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<Partial<CommonCode> | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [modalMenu, setModalMenu] = useState(MENU_OPTIONS[0]);
  const [modalCategory, setModalCategory] = useState('');
  const [modalDesc, setModalDesc] = useState('');

  
  // 3단계 구조를 위한 상태 추가
  const [modalLevel, setModalLevel] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [modalParentId, setModalParentId] = useState<number | null>(null);
  const [modalParentName, setModalParentName] = useState<string>('');
  const [modalSortOrder, setModalSortOrder] = useState<number>(1);
  const [level2Codes, setLevel2Codes] = useState<CommonCode[]>([]);
  


  // 공통코드 목록 조회
  const fetchCodes = async () => {
    try {
      const res = await axios.get(getApiUrl('/api/codes'));
      const data = Array.isArray(res.data) ? res.data : [];
      
      // 백엔드에서 받은 계층 구조 데이터를 그대로 사용
      // findAllDto()는 이미 계층 구조로 반환됨
      setCodes(data);
    } catch (error) {
      console.error('공통코드 목록 조회 실패:', error);
      alert('공통코드 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const openModal = (level: 'level1' | 'level2' | 'level3' = 'level1', parentId?: number, parentName?: string) => {
    setModalLevel(level);
    
    // 2단계 코드 추가 시 부모 코드의 menuName을 자동으로 설정
    if (level === 'level2' && parentId) {
      const parentCode = codes.find(c => c.id === parentId);
      setModalMenu(parentCode?.menuName || MENU_OPTIONS[0]);
    } else {
      setModalMenu(MENU_OPTIONS[0]);
    }
    
    setModalCategory('');
    setModalDesc('');
    
    // 3단계 코드 추가 시 자동으로 최대 순서 + 1 계산
    if (level === 'level3' && parentId) {
      const existingChildren = codes.filter(c => c.parentId === parentId);
      const maxSortOrder = existingChildren.length > 0
        ? Math.max(...existingChildren.map(c => c.sortOrder || 0))
        : 0;
      setModalSortOrder(maxSortOrder + 1);
    } else {
      setModalSortOrder(1);
    }
    
    setModalParentId(parentId || null);
    setModalParentName(parentName || '');
    setIsModalOpen(true);
    
    // 2단계 코드 목록 업데이트 (3단계 추가 시 사용)
    if (level === 'level3') {
      const level2List = codes.filter(c => c.parentId && !codes.find(p => p.id === c.parentId)?.parentId);
      setLevel2Codes(level2List);
    }
  };



  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 계층 구조에서 코드를 찾는 헬퍼 함수
  const findCodeInHierarchy = (id: number | null | undefined, codeList: CommonCode[]): CommonCode | null => {
    if (!id) return null;
    for (const code of codeList) {
      if (code.id === id) return code;
      if (code.children) {
        const found = findCodeInHierarchy(id, code.children);
        if (found) return found;
      }
    }
    return null;
  };

  // 1단계 부모 코드를 찾는 헬퍼 함수
  const findLevel1Parent = (code: CommonCode | null, codeList: CommonCode[]): CommonCode | null => {
    if (!code) return null;
    if (!code.parentId) return code; // 1단계 코드 자체
    const parent = findCodeInHierarchy(code.parentId, codeList);
    if (!parent) return null;
    if (!parent.parentId) return parent; // 1단계 부모
    return findLevel1Parent(parent, codeList); // 재귀적으로 1단계까지 올라감
  };

  // 3단계 코드 추가
  const handleModalSave = async () => {
    if (!modalCategory.trim()) return;
    
    let parentId = null;
    let menuName = modalMenu;
    
    if (modalLevel === 'level2') {
      // 2단계: 1단계 코드의 하위
      parentId = modalParentId;
      // 부모 코드의 menuName을 사용 (1단계 부모)
      const parentCode = findCodeInHierarchy(modalParentId, codes);
      menuName = parentCode?.menuName || modalMenu;
    } else if (modalLevel === 'level3') {
      // 3단계: 2단계 코드의 하위
      parentId = modalParentId;
      // 2단계 부모 코드를 찾고, 그 1단계 부모의 menuName을 사용
      const level2Parent = findCodeInHierarchy(modalParentId, codes);
      if (level2Parent) {
        const level1Parent = findLevel1Parent(level2Parent, codes);
        menuName = level1Parent?.menuName || modalMenu;
      }
    }
    
    try {
      const requestUrl = getApiUrl('/api/codes');
      const requestData = {
        menuName: menuName,
        codeName: modalCategory,
        codeValue: modalCategory.toUpperCase(),
        description: modalDesc,
        // 3단계 코드는 사용자가 입력한 순서 전달 (null이면 백엔드에서 자동 계산)
        sortOrder: modalLevel === 'level3' ? modalSortOrder : null,
        parentId: parentId
      };
      
      console.log('=== 공통코드 저장 요청 ===');
      console.log('URL:', requestUrl);
      console.log('Data:', requestData);
      console.log('=======================');
      
      const response = await axios.post(requestUrl, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('공통코드 저장 성공:', response.data);
      setIsModalOpen(false);
      fetchCodes();
    } catch (error: any) {
      console.error('=== 공통코드 저장 실패 ===');
      console.error('Error:', error);
      console.error('Response:', error.response);
      console.error('Request URL:', error.config?.url);
      console.error('Request Data:', error.config?.data);
      console.error('========================');
      
      const errorMessage = error.response?.data?.message || error.message || '공통코드 저장에 실패했습니다.';
      alert(`공통코드 저장 실패: ${errorMessage}\n\n상세: ${error.response?.status} ${error.response?.statusText || ''}`);
    }
  };

  // 코드 수정
  const handleEdit = (code: CommonCode) => {
    setEditingCode(code);
    setModalMenu(code.menuName);
    setModalCategory(code.codeName);
    setModalDesc(code.description || '');
    setModalSortOrder(code.sortOrder || 1);
    
    // 코드의 단계를 판단하여 modalLevel 설정
    if (!code.parentId) {
      setModalLevel('level1');
    } else {
      // 계층 구조에서 부모 정보 찾기
      let foundParent = false;
      
      // 1단계 코드들에서 2단계 자식 찾기
      for (const level1Code of codes) {
        if (level1Code.children) {
          for (const level2Code of level1Code.children) {
            if (level2Code.id === code.parentId) {
              // 2단계 코드의 하위
              setModalLevel('level3');
              setModalParentId(level2Code.id);
              setModalParentName(level2Code.codeName);
              foundParent = true;
              break;
            }
            // 3단계 자식들 확인
            if (level2Code.children) {
              for (const level3Code of level2Code.children) {
                if (level3Code.id === code.id) {
                  // 3단계 코드
                  setModalLevel('level3');
                  setModalParentId(level2Code.id);
                  setModalParentName(level2Code.codeName);
                  foundParent = true;
                  break;
                }
              }
            }
            if (foundParent) break;
          }
        }
        if (foundParent) break;
      }
      
      // 1단계 코드의 직접 하위인 경우
      if (!foundParent) {
        const level1Parent = codes.find(c => c.id === code.parentId);
        if (level1Parent) {
          setModalLevel('level2');
          setModalParentId(level1Parent.id);
          setModalParentName(level1Parent.codeName);
        }
      }
    }
    
    setIsModalOpen(true);
  };

  const handleModalUpdate = async () => {
    if (!editingCode) return;
    
    let parentId = editingCode.parentId;
    let menuName = modalMenu;
    
    // 수정 시에도 상위 레벨 정보 유지
    if (modalLevel === 'level2') {
      parentId = modalParentId;
      const parentCode = findCodeInHierarchy(modalParentId, codes);
      menuName = parentCode?.menuName || modalMenu;
    } else if (modalLevel === 'level3') {
      parentId = modalParentId;
      const level2Parent = findCodeInHierarchy(modalParentId, codes);
      if (level2Parent) {
        const level1Parent = findLevel1Parent(level2Parent, codes);
        menuName = level1Parent?.menuName || modalMenu;
      }
    }
    
    // 3단계 코드인 경우에만 sortOrder를 포함하고, 그 외에는 기존 값 유지
    const updateData: any = {
      menuName: menuName,
      codeName: modalCategory,
      codeValue: modalCategory.toUpperCase(),
      description: modalDesc,
      parentId: parentId
    };
    
    if (modalLevel === 'level3') {
      updateData.sortOrder = modalSortOrder;
    } else {
      // 1단계, 2단계 코드의 경우 기존 sortOrder 유지 (null이 아닌 경우)
      if (editingCode.sortOrder !== undefined) {
        updateData.sortOrder = editingCode.sortOrder;
      }
    }
    
    try {
      await axios.put(getApiUrl(`/api/codes/${editingCode.id}`), updateData);
      setIsModalOpen(false);
      setEditingCode(null);
      fetchCodes();
    } catch (error: any) {
      console.error('공통코드 수정 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '공통코드 수정에 실패했습니다.';
      alert(`공통코드 수정 실패: ${errorMessage}`);
    }
  };

  // 코드 삭제
  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(getApiUrl(`/api/codes/${id}`));
      fetchCodes();
    } catch (error: any) {
      console.error('공통코드 삭제 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '공통코드 삭제에 실패했습니다.';
      alert(`공통코드 삭제 실패: ${errorMessage}`);
    }
  };


  
  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };
  
  const renderCodeRow = (code: CommonCode, isChild = false): React.ReactNode => {
    const isExpanded = expandedRows.has(code.id);

    return (
      <>
        <tr key={code.id} className={isChild ? "bg-gray-50" : "bg-white"}>
          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isChild ? 'pl-12' : 'text-gray-900'}`}>
            <div className="flex items-center">
              {code.children && code.children.length > 0 ? (
                <button onClick={() => toggleRow(code.id)} className="mr-2">
                  {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                </button>
              ) : (
                <span className="w-6 inline-block"></span>
              )}
              {code.codeName}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.menuName}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.codeValue}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.description}</td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
            <button onClick={() => handleEdit(code)} className="text-indigo-600 hover:text-indigo-900"><FiEdit2 /></button>
            <button onClick={() => handleDelete(code.id)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
          </td>
        </tr>
        {isExpanded && code.children && code.children.map(child => renderCodeRow(child, true))}
      </>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">공통코드 관리</h2>
        <button
          onClick={() => openModal('level1')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          1단계 코드 추가
        </button>
      </div>

      <div className="shadow border-b border-gray-200 sm:rounded-lg">
        {/* 고정 헤더 */}
        <div className="bg-gray-100 sticky top-0 z-10">
          <table className="min-w-full table-fixed">
            <thead>
              <tr>
                <th scope="col" className="w-1/7 px-6 py-3 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">1단계 (메뉴)</th>
                <th scope="col" className="w-1/7 px-6 py-3 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">2단계 (하위)</th>
                <th scope="col" className="w-1/7 px-6 py-3 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">3단계 (세부)</th>
                <th scope="col" className="w-16 px-6 py-3 text-center text-sm font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">순서</th>
                <th scope="col" className="w-1/4 px-6 py-3 text-left text-sm font-bold text-gray-600 uppercase tracking-wider">설명</th>
                <th scope="col" className="w-16 px-6 py-3 text-center text-sm font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">추가</th>
                <th scope="col" className="w-16 px-6 py-3 text-center text-sm font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">수정</th>
                <th scope="col" className="w-16 px-6 py-3 text-center text-sm font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">삭제</th>
              </tr>
            </thead>
          </table>
        </div>
        
        {/* 스크롤 가능한 바디 */}
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200">
            <tbody>
              {codes.filter(c => !c.parentId)
                .sort((a, b) => a.codeName.localeCompare(b.codeName))
                .map(level1Code => (
                <React.Fragment key={level1Code.id}>
                  {/* 1단계 행 */}
                  <tr className="bg-white border-b-2 border-gray-300">
                    <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      <div className="flex items-center">
                        <button onClick={() => toggleRow(level1Code.id)} className="mr-2">
                          {expandedRows.has(level1Code.id) ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                        {level1Code.codeName}
                      </div>
                    </td>
                    <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                    <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                    <td className="w-16 px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"></td>
                    <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">{level1Code.description}</td>
                    <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => openModal('level2', level1Code.id, level1Code.codeName)}
                        className="text-green-600 hover:text-green-900"
                        title="2단계 코드 추가"
                      >
                        <FiPlus />
                      </button>
                    </td>
                    <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => handleEdit(level1Code)} className="text-indigo-600 hover:text-indigo-900"><FiEdit2 /></button>
                    </td>
                    <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => handleDelete(level1Code.id)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
                    </td>
                  </tr>
                  
                  {/* 2단계 행들 */}
                  {expandedRows.has(level1Code.id) && level1Code.children && level1Code.children
                    .sort((a, b) => a.codeName.localeCompare(b.codeName))
                    .map(level2Code => (
                    <React.Fragment key={level2Code.id}>
                      <tr className="bg-gray-50">
                        <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                        <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          <div className="flex items-center pl-4">
                            <button onClick={() => toggleRow(level2Code.id)} className="mr-2">
                              {expandedRows.has(level2Code.id) ? <FiChevronDown /> : <FiChevronRight />}
                            </button>
                            {level2Code.codeName}
                          </div>
                        </td>
                        <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                        <td className="w-16 px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"></td>
                        <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">{level2Code.description}</td>
                        <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                          <button 
                            onClick={() => openModal('level3', level2Code.id, level2Code.codeName)}
                            className="text-purple-600 hover:text-purple-900"
                            title="3단계 코드 추가"
                          >
                            <FiPlus />
                          </button>
                        </td>
                        <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                          <button onClick={() => handleEdit(level2Code)} className="text-indigo-600 hover:text-indigo-900"><FiEdit2 /></button>
                        </td>
                        <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                          <button onClick={() => handleDelete(level2Code.id)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
                        </td>
                      </tr>
                      
                      {/* 3단계 행들 */}
                      {expandedRows.has(level2Code.id) && level2Code.children && level2Code.children
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                        .map(level3Code => (
                        <tr key={level3Code.id} className="bg-gray-100">
                          <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                          <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                          <td className="w-1/7 px-6 py-4 whitespace-nowrap text-sm text-gray-900 pl-8">{level3Code.codeName}</td>
                          <td className="w-16 px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center font-semibold">{level3Code.sortOrder || '-'}</td>
                          <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-500">{level3Code.description}</td>
                          <td className="w-16 px-6 py-4 whitespace-nowrap text-center"></td>
                          <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                            <button onClick={() => handleEdit(level3Code)} className="text-indigo-600 hover:text-indigo-900"><FiEdit2 /></button>
                          </td>
                          <td className="w-16 px-6 py-4 whitespace-nowrap text-center">
                            <button onClick={() => handleDelete(level3Code.id)} className="text-red-600 hover:text-red-900"><FiTrash2 /></button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">
              {modalLevel === 'level1' ? '1단계 코드 (메뉴 레벨)' : 
               modalLevel === 'level2' ? '2단계 코드 (하위 레벨)' : 
               '3단계 코드 (세부 레벨)'} {editingCode ? '수정' : '추가'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">메뉴 선택</label>
                {modalLevel === 'level2' && modalParentId ? (
                  // 2단계 코드 추가 시 부모 코드의 menuName을 읽기 전용으로 표시
                  <div className="w-full px-3 py-2 border rounded-md bg-gray-100">
                    {modalMenu}
                  </div>
                ) : (
                  <select 
                    value={modalMenu} 
                    onChange={e => setModalMenu(e.target.value)} 
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={modalLevel !== 'level1'}
                  >
                    {MENU_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
              </div>
              
              {modalLevel === 'level2' && (
                <div>
                  <label className="block text-sm font-medium mb-1">상위 메뉴</label>
                  <div className="w-full px-3 py-2 border rounded-md bg-gray-100">
                    {modalParentName}
                  </div>
                </div>
              )}
              
              {modalLevel === 'level3' && (
                <div>
                  <label className="block text-sm font-medium mb-1">상위 하위 코드</label>
                  <div className="w-full px-3 py-2 border rounded-md bg-gray-100">
                    {modalParentName}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {modalLevel === 'level1' ? '메뉴명' : 
                   modalLevel === 'level2' ? '하위 코드명' : 
                   '세부 코드명'}
                </label>
                <input 
                  type="text" 
                  value={modalCategory} 
                  onChange={e => setModalCategory(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={
                    modalLevel === 'level1' ? '예: Library, Q&A, Research' : 
                    modalLevel === 'level2' ? '예: 자료출처, 질문유형, 기고분야' : 
                    '예: 기술, 경영, 연구, 기타'
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">설명</label>
                <input 
                  type="text" 
                  value={modalDesc} 
                  onChange={e => setModalDesc(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="코드에 대한 설명을 입력하세요"
                />
              </div>
              
              {modalLevel === 'level3' && (
                <div>
                  <label className="block text-sm font-medium mb-1">순서</label>
                  <input 
                    type="number" 
                    value={modalSortOrder} 
                    onChange={e => setModalSortOrder(parseInt(e.target.value) || 1)} 
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="1"
                    min="1"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-md">취소</button>
              <button
                onClick={editingCode ? handleModalUpdate : handleModalSave}
                className={`px-4 py-2 text-white rounded-md ${
                  modalLevel === 'level1' ? 'bg-blue-600' : 
                  modalLevel === 'level2' ? 'bg-green-600' : 
                  'bg-purple-600'
                }`}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 