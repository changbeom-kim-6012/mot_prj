'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiCalendar, FiFileText, FiDownload, FiUpload, FiFile, FiX } from 'react-icons/fi';
import FileViewer from '@/components/common/FileViewer';
import { useAuth } from '@/context/AuthContext';

interface Notice {
  id: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  attachmentPath?: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface FileWithType {
  file: File;
  fileType: 'view-only' | 'downloadable';
}

export default function NoticeManagement() {
  const { user, isAuthenticated } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: '',
    attachment: null as File | null
  });
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);

  // 관리자 권한 확인
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      alert('관리자 권한이 필요합니다.');
      return;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      console.log('=== 공지사항 조회 시작 ===');
      
      const response = await fetch('http://mot.erns.co.kr/api/notices');
      
      console.log('공지사항 조회 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('공지사항 조회 성공:', data);
        setNotices(data);
      } else {
        let errorMessage = '공지사항 조회에 실패했습니다.';
        
        if (response.status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (response.status === 404) {
          errorMessage = '서버를 찾을 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.';
        } else if (response.status >= 500) {
          errorMessage = '서버 내부 오류가 발생했습니다.';
        }
        
        try {
          const errorData = await response.json();
          console.error('공지사항 조회 실패:', response.status, errorData);
          errorMessage += ` (상세: ${errorData.error || response.statusText})`;
        } catch {
          console.error('공지사항 조회 실패:', response.status, response.statusText);
          errorMessage += ` (상태: ${response.status})`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        alert('공지사항 조회에 실패했습니다: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      startDate: '',
      endDate: '',
      attachment: null
    });
    setFiles([]);
    setPendingFiles([]);
    setShowModal(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      startDate: notice.startDate.split('T')[0],
      endDate: notice.endDate.split('T')[0],
      attachment: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://mot.erns.co.kr/api/notices/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('공지사항이 삭제되었습니다.');
        fetchNotices();
      } else {
        alert('공지사항 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      alert('공지사항 삭제에 실패했습니다.');
    }
  };

  // 파일 처리 함수들
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setPendingFiles(selectedFiles);
      setShowTypeModal(true);
    }
  };

  const handleTypeSelection = (fileType: 'view-only' | 'downloadable') => {
    const newFiles: FileWithType[] = pendingFiles.map(file => ({
      file,
      fileType
    }));
    setFiles(newFiles);
    setPendingFiles([]);
    setShowTypeModal(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const toggleFileType = (index: number) => {
    setFiles(files.map((fileWithType, i) => 
      i === index 
        ? { ...fileWithType, fileType: fileWithType.fileType === 'view-only' ? 'downloadable' : 'view-only' }
        : fileWithType
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 디버깅: 사용자 정보 확인
    console.log('현재 사용자 정보:', user);
    console.log('사용자 역할:', user?.role);
    console.log('사용자 이메일:', user?.email);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('startDate', formData.startDate);
    formDataToSend.append('endDate', formData.endDate);
    
    // 공지기간으로 자동 활성화 판단 (현재 날짜가 공지기간 내에 있으면 활성)
    const today = new Date().toISOString().split('T')[0];
    const isActive = formData.startDate <= today && today <= formData.endDate;
    formDataToSend.append('isActive', isActive.toString());
    
    // 파일 첨부 (새로운 파일 시스템 사용)
    if (files.length > 0) {
      files.forEach((fileWithType, index) => {
        formDataToSend.append(`attachment`, fileWithType.file);
        formDataToSend.append(`attachmentType_${index}`, fileWithType.fileType);
      });
    }

    // 디버깅: FormData 내용 확인
    console.log('FormData 내용:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const url = editingNotice 
        ? `http://mot.erns.co.kr/api/notices/${editingNotice.id}`
        : 'http://mot.erns.co.kr/api/notices';
      
      const method = editingNotice ? 'PUT' : 'POST';

      console.log('API 요청 정보:', {
        url,
        method,
        userRole: user?.role || 'USER',
        userEmail: user?.email || ''
      });

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      console.log('응답 상태:', response.status);
      console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const responseData = await response.json();
        console.log('성공 응답:', responseData);
        alert(editingNotice ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');
        setShowModal(false);
        fetchNotices();
      } else {
        console.error('응답 상태:', response.status);
        console.error('응답 상태 텍스트:', response.statusText);
        
        let errorMessage = '공지사항 저장에 실패했습니다.';
        try {
          const errorData = await response.json();
          console.error('API 오류 응답:', errorData);
          errorMessage = `공지사항 저장에 실패했습니다: ${errorData.error || response.statusText}`;
        } catch (parseError) {
          console.error('응답 파싱 실패:', parseError);
          errorMessage = `공지사항 저장에 실패했습니다: ${response.status} ${response.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      alert('공지사항 저장에 실패했습니다.');
    }
  };

  const handleFileDownload = async (attachmentPath: string, attachmentName: string) => {
    try {
      const response = await fetch(`http://mot.erns.co.kr/api/notices/download/${attachmentPath}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachmentName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  const handleFileView = (attachmentPath: string, attachmentName: string) => {
    const fileUrl = `http://mot.erns.co.kr/api/notices/download/${attachmentPath}`;
    setSelectedFile({ url: fileUrl, name: attachmentName });
  };

  const handleCloseFileViewer = () => {
    setSelectedFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            공지사항 관리
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            사이트 공지사항을 관리합니다.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          공지사항 등록
        </button>
      </div>

      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  공지기간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  첨부파일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices.map((notice) => (
                <tr key={notice.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {notice.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(notice.startDate)} ~ {formatDate(notice.endDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {notice.attachmentName ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFileView(notice.attachmentPath!, notice.attachmentName!)}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          title="파일 보기"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          보기
                        </button>
                        <button
                          onClick={() => handleFileDownload(notice.attachmentPath!, notice.attachmentName!)}
                          className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                          title="파일 다운로드"
                        >
                          <FiDownload className="w-4 h-4 mr-1" />
                          다운로드
                        </button>
                        <span className="text-sm text-gray-500">
                          {notice.attachmentName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(notice.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(notice)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 공지사항 등록/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-2xl font-medium text-gray-900 mb-6">
                {editingNotice ? '공지사항 수정' : '공지사항 등록'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base bg-gray-50 px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base bg-gray-50 px-4 py-3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      공지 시작일
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base bg-gray-50 px-4 py-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      공지 종료일
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base bg-gray-50 px-4 py-3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    첨부파일 (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-base text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-gray-50 px-4 py-3"
                  />
                  
                  {/* 파일 목록 표시 */}
                  {files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">첨부된 파일</h4>
                      <div className="space-y-2">
                        {files.map((fileWithType, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <FiFile className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{fileWithType.file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(fileWithType.file.size)}</p>
                                <p className="text-xs text-blue-600">
                                  {fileWithType.fileType === 'view-only' ? '보기 전용' : '다운로드 가능'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => toggleFileType(index)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                {fileWithType.fileType === 'view-only' ? '다운로드 가능으로 변경' : '보기 전용으로 변경'}
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                              >
                                <FiX className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingNotice ? '수정' : '등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 파일 타입 선택 모달 */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <FiUpload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                파일 타입 선택
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  선택된 파일 {pendingFiles.length}개에 대한 타입을 선택해주세요.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => handleTypeSelection('downloadable')}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    다운로드 가능 (파일보기 + 다운로드)
                  </button>
                  <button
                    onClick={() => handleTypeSelection('view-only')}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiEye className="mr-2 h-4 w-4" />
                    보기만 가능 (다운로드 불가)
                  </button>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setPendingFiles([]);
                      setShowTypeModal(false);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 파일 뷰어 */}
      {selectedFile && (
        <FileViewer
          fileUrl={selectedFile.url}
          fileName={selectedFile.name}
          onClose={handleCloseFileViewer}
        />
      )}
    </div>
  );
}
