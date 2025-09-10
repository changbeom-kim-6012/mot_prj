'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { FiUpload, FiFile, FiX, FiArrowLeft, FiBookOpen, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { CodeSelectWithEtc } from '@/components/common/CodeSelectWithEtc';
import QuillEditor from '@/components/common/QuillEditor';

interface FileWithType {
  file: File;
  fileType: 'view-only' | 'downloadable';
}

interface ExistingAttachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: 'view-only' | 'downloadable';
}

interface Category {
  id: number;
  name: string;
}

export default function OpinionRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    abstractText: '',
    keywords: '',
    references: '',
    fullText: '',
    status: '임시저장',
    category: '',
  });
  const [categoryEtc, setCategoryEtc] = useState('');
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [fullTextContent, setFullTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        authorName: `${user.name} (${user.email})`
      }));
    }
  }, [user]);

  // 삭제 권한 업데이트
  useEffect(() => {
    const hasDeletePermission = Boolean(isEditMode && (
      user?.role === 'ADMIN' || 
      (user && formData.authorName.includes(user.email))
    ));
    setCanDelete(hasDeletePermission);
  }, [isEditMode, user, formData.authorName]);

  // Edit 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEditMode && editId) {
      const fetchArticle = async () => {
        try {
          const response = await axios.get(`http://mot.erns.co.kr:8082/api/opinions/${editId}`);
          const article = response.data;
          
          setFormData({
            title: article.title || '',
            authorName: article.authorName || '',
            abstractText: article.abstractText || '',
            keywords: article.keywords || '',
            references: article.references || '',
            fullText: article.fullText || '',
            status: article.status || '임시저장',
            category: article.category || '',
          });

          // 기존 첨부파일 불러오기
          try {
            const attachmentsResponse = await axios.get(`http://mot.erns.co.kr:8082/api/attachments?refTable=opinions&refId=${editId}`);
            const attachments = attachmentsResponse.data.map((att: any) => ({
              id: att.id,
              fileName: att.fileName,
              fileSize: att.fileSize,
              fileType: att.note?.includes('다운로드') ? 'downloadable' : 'view-only'
            }));
            setExistingAttachments(attachments);
          } catch (attachmentError) {
            console.error('첨부파일을 불러오는데 실패했습니다:', attachmentError);
            setExistingAttachments([]);
          }
        } catch (error) {
          console.error('기존 기고를 불러오는데 실패했습니다:', error);
          alert('기존 기고를 불러오는데 실패했습니다.');
          router.push('/opinions');
        }
      };
      
      fetchArticle();
    }
  }, [isEditMode, editId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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

  const removeExistingAttachment = async (attachmentId: number) => {
    try {
      await axios.delete(`http://mot.erns.co.kr:8082/api/attachments/${attachmentId}`);
      setExistingAttachments(prev => prev.filter(att => att.id !== attachmentId));
      alert('첨부파일이 삭제되었습니다.');
    } catch (error) {
      console.error('첨부파일 삭제에 실패했습니다:', error);
      alert('첨부파일 삭제에 실패했습니다.');
    }
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

  const toggleExistingAttachmentType = async (attachmentId: number, currentType: 'view-only' | 'downloadable') => {
    try {
      const newType = currentType === 'view-only' ? 'downloadable' : 'view-only';
      const note = newType === 'downloadable' ? 'Opinion 첨부파일 (다운로드 가능)' : 'Opinion 첨부파일 (보기만 가능)';
      
      await axios.put(`http://mot.erns.co.kr:8082/api/attachments/${attachmentId}`, {
        note: note
      });
      
      setExistingAttachments(prev => prev.map(att => 
        att.id === attachmentId 
          ? { ...att, fileType: newType }
          : att
      ));
    } catch (error) {
      console.error('첨부파일 타입 변경에 실패했습니다:', error);
      alert('첨부파일 타입 변경에 실패했습니다.');
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let opinionId;
      
      if (isEditMode && editId) {
        // Edit 모드: 기존 기고 수정
        const res = await axios.put(`http://mot.erns.co.kr:8082/api/opinions/${editId}`, {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '등록대기',
          category: formData.category,
        });
        opinionId = editId;
      } else {
        // 새 기고 등록
        const res = await axios.post('http://mot.erns.co.kr:8082/api/opinions', {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '등록대기',
          category: formData.category,
        });
        opinionId = res.data.id;
      }

      // 2. 첨부파일 업로드
      for (const fileInfo of files) {
        const form = new FormData();
        form.append('refTable', 'opinions');
        form.append('refId', opinionId);
        form.append('file', fileInfo.file);
        form.append('uploadedBy', user?.email || '');
        form.append('note', 'Opinion 첨부파일');
        
        await axios.post('http://mot.erns.co.kr:8082/api/attachments', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setIsSubmitting(false);
      alert(isEditMode ? '기고가 성공적으로 수정되었습니다. 관리자 검토 후 게시됩니다.' : '기고가 성공적으로 등록되었습니다. 관리자 검토 후 게시됩니다.');
      router.push('/opinions');
    } catch (err) {
      setIsSubmitting(false);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  const handleTemporarySave = async () => {
    setIsSaving(true);
    try {
      let opinionId;
      
      if (isEditMode && editId) {
        // Edit 모드: 기존 기고 임시저장
        const res = await axios.put(`http://mot.erns.co.kr:8082/api/opinions/${editId}`, {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '임시저장',
          category: formData.category,
        });
        opinionId = editId;
      } else {
        // 새 기고 임시저장
        const res = await axios.post('http://mot.erns.co.kr:8082/api/opinions', {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '임시저장',
          category: formData.category,
        });
        opinionId = res.data.id;
      }

      // 2. 첨부파일 업로드 (동일)
      for (const fileInfo of files) {
        const form = new FormData();
        form.append('refTable', 'opinions');
        form.append('refId', opinionId);
        form.append('file', fileInfo.file);
        form.append('uploadedBy', user?.email || '');
        form.append('note', 'Opinion 첨부파일');
        
        await axios.post('http://mot.erns.co.kr:8082/api/attachments', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setIsSaving(false);
      alert('임시저장이 완료되었습니다.');
    } catch (err) {
      setIsSaving(false);
      alert('임시저장 중 오류가 발생했습니다.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    if (!isEditMode || !editId) {
      alert('삭제할 기고가 없습니다.');
      return;
    }

    if (!confirm('정말로 이 기고를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      // 기고 삭제
      await axios.delete(`http://mot.erns.co.kr:8082/api/opinions/${editId}`);
      
      // 첨부파일도 함께 삭제 (서버에서 cascade로 처리되거나 별도 삭제)
      if (existingAttachments.length > 0) {
        for (const attachment of existingAttachments) {
          try {
            await axios.delete(`http://mot.erns.co.kr:8082/api/attachments/${attachment.id}`);
          } catch (error) {
            console.error('첨부파일 삭제 실패:', error);
          }
        }
      }

      alert('기고가 성공적으로 삭제되었습니다.');
      router.push('/opinions');
    } catch (error) {
      console.error('기고 삭제에 실패했습니다:', error);
      alert('기고 삭제에 실패했습니다.');
    }
  };

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
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <FiBookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Opinion 수정' : 'Opinion 등록'}</h1>
            </div>
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </motion.button>
          </div>
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
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="기고 제목을 입력하세요"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <CodeSelectWithEtc
                    menuName="Agora"
                    value={formData.category}
                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    etcValue={categoryEtc}
                    onEtcChange={setCategoryEtc}
                    placeholder="선택하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    hideEtcInput={true}
                  />
                </div>
                {formData.category === '기타' && (
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={categoryEtc}
                      onChange={(e) => setCategoryEtc(e.target.value)}
                      placeholder="기타 카테고리를 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Authors */}
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                (공동)저자 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="authorName"
                name="authorName"
                required
                value={formData.authorName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="저자명 (이메일), 공동저자명 (이메일)"
              />
            </div>

            {/* References */}
            <div>
              <label htmlFor="references" className="block text-sm font-medium text-gray-700 mb-2">
                참고문헌
              </label>
              <textarea
                id="references"
                name="references"
                rows={2}
                value={formData.references}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="참고문헌을 입력하세요 (여러 개인 경우 줄바꿈으로 구분)"
              />
            </div>

            {/* Abstract */}
            <div>
              <label htmlFor="abstractText" className="block text-sm font-medium text-gray-700 mb-2">
                초록 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="abstractText"
                name="abstractText"
                rows={4}
                required
                value={formData.abstractText}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="초록(요약)을 입력하세요"
              />
              {/* Full Text Button - 초록 하단에 오른쪽 정렬 */}
              <div className="flex justify-end mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">전문 (Full Text)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFullTextContent(formData.fullText);
                      setShowFullTextModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiFile className="mr-2 h-4 w-4" />
                    전문 작성
                  </button>
                </div>
              </div>
              {formData.fullText && (
                <div className="flex justify-end mt-2">
                  <p className="text-sm text-green-600">
                    전문 내용이 작성되었습니다. ({(formData.fullText.length / 1000).toFixed(1)}KB)
                  </p>
                </div>
              )}
            </div>

            {/* Keywords */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                키워드
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="키워드를 콤마(,)로 구분해 입력하세요"
              />
            </div>

            {/* File Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  문서 파일
                </label>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
                >
                  <FiUpload className="mr-2 h-4 w-4" />
                  파일 선택
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
                </label>
              </div>
            </div>

            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">기존 첨부파일</h3>
                <div className="space-y-2">
                  {existingAttachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <FiFile className="h-5 w-5 text-blue-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                          <p className="text-xs text-blue-600">
                            {attachment.fileType === 'view-only' ? '보기 전용' : '다운로드 가능'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => toggleExistingAttachmentType(attachment.id, attachment.fileType)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {attachment.fileType === 'view-only' ? '다운로드 가능으로 변경' : '보기 전용으로 변경'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExistingAttachment(attachment.id)}
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

            {/* New File List */}
            {files.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">새로 추가할 파일</h3>
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

            {/* File Type Selection Modal */}
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

            {/* Full Text Editor Modal */}
            {showFullTextModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">전문 작성</h3>
                      <p className="text-sm text-gray-600 mt-1">기고의 전문 내용을 작성해주세요.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setFullTextContent('');
                          setShowFullTextModal(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => {
                          setFormData(prev => ({ ...prev, fullText: stripHtml(fullTextContent) }));
                          setShowFullTextModal(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        저장
                      </button>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 p-6">
                    <div className="h-full">
                      <QuillEditor
                        value={fullTextContent}
                        onChange={setFullTextContent}
                        placeholder="기고의 전문 내용을 입력하세요. 긴 텍스트도 입력 가능합니다."
                        height={500}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              {/* 삭제 버튼 - 관리자나 작성자만 표시 */}
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  삭제
                </button>
              )}
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleTemporarySave}
                disabled={isSaving}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSaving ? '저장 중...' : '임시저장'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (isEditMode ? '수정 중...' : '등록 중...') : (isEditMode ? '기고 수정' : '기고 등록')}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </main>
  );
} 