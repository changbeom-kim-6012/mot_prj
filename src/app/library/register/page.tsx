'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiArrowLeft, FiUpload, FiPaperclip, FiX, FiEye, FiDownload } from 'react-icons/fi';
import { CodeSelectWithEtc } from '@/components/common/CodeSelectWithEtc';

interface LibraryItem {
  id: number;
  category: string;
  title: string;
  author: string;
  description: string;
  keywords: string;
  fileNames: string;
  filePaths: string;
  fileTypes?: string; // 파일 타입 정보 (view-only, downloadable)
  createdAt: string;
  updatedAt: string;
}

interface FileWithType {
  file: File;
  fileType: 'view-only' | 'downloadable';
}

export default function RegisterLibraryItemPage() {
  const [category, setCategory] = useState('');
  const [categoryEtc, setCategoryEtc] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [keywords, setKeywords] = useState('');
  const [existingFileName, setExistingFileName] = useState<string>('');
  const [existingFileNames, setExistingFileNames] = useState<string[]>([]);
  const [existingFilePaths, setExistingFilePaths] = useState<string[]>([]);
  const [existingFileTypes, setExistingFileTypes] = useState<string[]>([]);
  const [deletedFileNames, setDeletedFileNames] = useState<string[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 필수 입력 항목 refs
  const categoryRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const fileUploadRef = useRef<HTMLDivElement>(null);

  // URL 파라미터에서 editItem 정보를 가져오는 로직 추가
  useEffect(() => {
    // URL에서 id 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');
    
    if (editId) {
      // 수정 모드: 기존 데이터를 가져와서 폼 초기화
      fetchLibraryItem(parseInt(editId));
    }
  }, []);

  const fetchLibraryItem = async (id: number) => {
    try {
      const response = await fetch(`http://mot.erns.co.kr:8082/api/library/${id}`);
      if (response.ok) {
        const editItem: LibraryItem = await response.json();
        
        setTitle(editItem.title);
        setAuthor(editItem.author);
        setDescription(editItem.description);
        setKeywords(editItem.keywords);
        setFiles([]); // 파일은 새로 업로드해야 함
        
        // 카테고리 처리: 기타 카테고리인 경우 키워드 부분만 추출
        if (editItem.category.includes('기타')) {
          setCategory('기타');
          // "기타"가 포함된 카테고리에서 "기타" 부분을 제거하여 키워드 추출
          let keywordPart = '';
          if (editItem.category.startsWith('기타')) {
            // "기타"로 시작하는 경우
            keywordPart = editItem.category.replace(/^기타\s*-\s*/, '').trim();
          } else {
            // "기타"가 중간에 포함된 경우 (예: "키인한 기타")
            keywordPart = editItem.category.replace(/.*기타\s*/, '').trim();
          }
          setCategoryEtc(keywordPart);
        } else {
          // 일반 카테고리인 경우
          setCategory(editItem.category);
          setCategoryEtc('');
        }
        setExistingFileName(editItem.fileNames || '');
        
        // 기존 파일명들을 배열로 분리하여 저장
        if (editItem.fileNames) {
          setExistingFileNames(editItem.fileNames.split(',').map(name => name.trim()));
        } else {
          setExistingFileNames([]);
        }
        
        // 기존 파일 경로들을 배열로 분리하여 저장
        if (editItem.filePaths) {
          setExistingFilePaths(editItem.filePaths.split(',').map(path => path.trim()));
        } else {
          setExistingFilePaths([]);
        }
        
        // 기존 파일 타입들을 배열로 분리하여 저장
        if (editItem.fileTypes) {
          setExistingFileTypes(editItem.fileTypes.split(',').map(type => type.trim()));
        } else {
          setExistingFileTypes([]);
        }
        
        setDeletedFileNames([]);
      }
    } catch (error) {
      console.error('Failed to fetch library item:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setPendingFiles(newFiles);
      setShowTypeModal(true);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFileType = (index: number) => {
    setFiles(prev => prev.map((fileWithType, i) => 
      i === index 
        ? { 
            ...fileWithType, 
            fileType: fileWithType.fileType === 'view-only' ? 'downloadable' : 'view-only' 
          }
        : fileWithType
    ));
  };

  const handleTypeSelection = (fileType: 'view-only' | 'downloadable') => {
    const newFilesWithType = pendingFiles.map(file => ({
      file,
      fileType
    }));
    setFiles(prev => [...prev, ...newFilesWithType]);
    setPendingFiles([]);
    setShowTypeModal(false);
  };

  const handleCancelTypeSelection = () => {
    setPendingFiles([]);
    setShowTypeModal(false);
  };

  const removeExistingFile = (fileName: string) => {
    setDeletedFileNames(prev => [...prev, fileName]);
    setExistingFileNames(prev => prev.filter(name => name !== fileName));
  };

  const restoreExistingFile = (fileName: string) => {
    setDeletedFileNames(prev => prev.filter(name => name !== fileName));
    setExistingFileNames(prev => [...prev, fileName]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 입력 항목 체크
    const finalCategory = category === '기타' ? `기타 - ${categoryEtc}` : category;
    
    if (!finalCategory || finalCategory.trim() === '') {
      setError('자료출처를 선택해주세요.');
      categoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!title || title.trim() === '') {
      setError('제목을 입력해주세요.');
      titleRef.current?.focus();
      titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (files.length === 0 && !existingFileName) {
      setError('문서 파일을 등록해주세요.');
      fileUploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('category', finalCategory);
      formData.append('title', title);
      formData.append('author', author);
      formData.append('description', description);
      formData.append('keywords', keywords);
      // 파일이 있을 때만 파일 데이터 추가
      if (files.length > 0) {
        files.forEach((fileWithType, index) => {
          formData.append(`files`, fileWithType.file);
          formData.append(`fileTypes`, fileWithType.fileType);
        });
      }
      
      // 삭제할 파일명들 추가
      if (deletedFileNames.length > 0) {
        formData.append('deletedFileNames', deletedFileNames.join(','));
      }

      let response;
      // URL에서 id 파라미터 확인
      const urlParams = new URLSearchParams(window.location.search);
      const editId = urlParams.get('id');

      if (editId) {
        // 수정(UPDATE)
        response = await fetch(`http://mot.erns.co.kr:8082/api/library/${editId}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        // 신규 등록(CREATE)
        response = await fetch('http://mot.erns.co.kr:8082/api/library', {
        method: 'POST',
        body: formData,
      });
      }

      if (response.ok) {
        const result = await response.json();
        alert(editId ? '자료가 성공적으로 수정되었습니다.' : '자료가 성공적으로 등록되었습니다.');
        router.push('/library');
      } else {
        const errorData = await response.text();
        setError(editId ? '자료 수정에 실패했습니다. 다시 시도해주세요.' : '자료 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      setError('서버 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
                <div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-[0.5px] rounded-lg shadow p-4">
            
            <div ref={categoryRef}>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                자료출처 <span className="text-red-500">*</span>
              </label>
              <CodeSelectWithEtc
                menuName="Library"
                value={category}
                onChange={setCategory}
                etcValue={categoryEtc}
                onEtcChange={setCategoryEtc}
                placeholder="자료출처를 선택하세요"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                제목 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  ref={titleRef}
                  type="text"
                  name="title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="자료의 제목을 입력하세요"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  저자/강사
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="author"
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="저자 또는 출처를 입력하세요"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700">
                  등록일
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="registrationDate"
                    id="registrationDate"
                    value={new Date().toLocaleDateString('ko-KR')}
                    disabled
                    className="block w-full p-3 border-gray-300 bg-gray-200 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                자료개요
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="자료에 대한 간단한 개요를 입력하세요."
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                키워드
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="keywords"
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="쉼표(,)로 구분하여 키워드를 입력하세요"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                문서 파일
              </label>
              
              {/* 기존 파일 정보 표시 (수정 모드일 때만) */}
              {existingFileNames.length > 0 && (
                <div className="mt-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FiPaperclip className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm text-blue-700 font-medium">기존 파일</span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">개별 삭제 가능</span>
                  </div>
                  <div className="space-y-2">
                    {existingFileNames.map((fileName, index) => {
                      const filePath = existingFilePaths[index] || '';
                      const fileType = existingFileTypes[index] || 'downloadable';
                      const isViewOnly = fileType === 'view-only';
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{fileName}</span>
                            {isViewOnly && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                보기만
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const encodedPath = encodeURIComponent(filePath).replace(/[!'()*]/g, function(c) {
                                  return '%' + c.charCodeAt(0).toString(16);
                                });
                                const fileUrl = `http://mot.erns.co.kr:8082/api/library/view/${encodedPath}`;
                                window.open(fileUrl, '_blank');
                              }}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <FiEye className="mr-1 h-3 w-3" />
                              파일보기
                            </button>
                            {!isViewOnly && (
                              <button
                                onClick={() => {
                                  const encodedPath = encodeURIComponent(filePath).replace(/[!'()*]/g, function(c) {
                                    return '%' + c.charCodeAt(0).toString(16);
                                  });
                                  window.open(`http://mot.erns.co.kr:8082/api/library/download/${encodedPath}`, '_blank');
                                }}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                              >
                                <FiDownload className="mr-1 h-3 w-3" />
                                다운로드
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingFile(fileName)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* 삭제된 파일 복원 섹션 */}
              {deletedFileNames.length > 0 && (
                <div className="mt-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FiX className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-sm text-red-700 font-medium">삭제 예정 파일</span>
                    </div>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">저장 시 삭제됨</span>
                  </div>
                  <div className="space-y-2">
                    {deletedFileNames.map((fileName, index) => {
                      const originalIndex = existingFileNames.findIndex(name => name === fileName);
                      const filePath = originalIndex >= 0 ? existingFilePaths[originalIndex] || '' : '';
                      const fileType = originalIndex >= 0 ? existingFileTypes[originalIndex] || 'downloadable' : 'downloadable';
                      const isViewOnly = fileType === 'view-only';
                      
                      return (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 line-through">{fileName}</span>
                            {isViewOnly && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                보기만
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const encodedPath = encodeURIComponent(filePath).replace(/[!'()*]/g, function(c) {
                                  return '%' + c.charCodeAt(0).toString(16);
                                });
                                const fileUrl = `http://mot.erns.co.kr:8082/api/library/view/${encodedPath}`;
                                window.open(fileUrl, '_blank');
                              }}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            >
                              <FiEye className="mr-1 h-3 w-3" />
                              파일보기
                            </button>
                            {!isViewOnly && (
                              <button
                                onClick={() => {
                                  const encodedPath = encodeURIComponent(filePath).replace(/[!'()*]/g, function(c) {
                                    return '%' + c.charCodeAt(0).toString(16);
                                  });
                                  window.open(`http://mot.erns.co.kr:8082/api/library/download/${encodedPath}`, '_blank');
                                }}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                              >
                                <FiDownload className="mr-1 h-3 w-3" />
                                다운로드
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => restoreExistingFile(fileName)}
                              className="text-green-500 hover:text-green-700 text-sm"
                            >
                              복원
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="mt-1" ref={fileUploadRef}>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  <FiUpload className="mr-2 h-4 w-4" />
                  {existingFileName ? '새 파일 선택' : '파일 선택'}
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((fileWithType, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        <FiPaperclip className="h-5 w-5 text-gray-500 mr-2" />
                        <span>{fileWithType.file.name} ({(fileWithType.file.size / 1024).toFixed(2)} KB)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFileType(index)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            fileWithType.fileType === 'view-only'
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={fileWithType.fileType === 'view-only' ? '파일보기만 가능' : '다운로드 가능'}
                        >
                          {fileWithType.fileType === 'view-only' ? (
                            <>
                              <FiEye className="h-3 w-3" />
                              보기만
                            </>
                          ) : (
                            <>
                              <FiDownload className="h-3 w-3" />
                              다운로드
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                onClick={() => router.push('/library')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                >
                  <FiSave className="-ml-1 mr-2 h-5 w-5" />
                  {isSubmitting ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </form>
        </div>

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
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleCancelTypeSelection}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
} 