'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { FiUpload, FiFile, FiX, FiArrowLeft, FiBookOpen, FiDownload, FiEye, FiTrash2, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { CodeSelectWithEtc } from '@/components/common/CodeSelectWithEtc';
import QuillEditor from '@/components/common/QuillEditor';
import { getApiUrl, getRelativeApiUrl } from '@/config/api';
import KeywordSelectorModal from '@/components/common/KeywordSelectorModal';

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

function OpinionRegisterPageContent() {
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
    websiteLink: '',
  });
  const [categoryEtc, setCategoryEtc] = useState('');
  const [motStudyCategory, setMotStudyCategory] = useState<string>('');
  const [researchCategory, setResearchCategory] = useState<string>('');
  const [motStudyLevel3Categories, setMotStudyLevel3Categories] = useState<Category[]>([]);
  const [researchLevel3Categories, setResearchLevel3Categories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [fullTextContent, setFullTextContent] = useState('');
  const [showKeywordModal, setShowKeywordModal] = useState(false);
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

  // MOT Study와 Research분야의 3단계 카테고리 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch(getApiUrl('/api/codes?menuName=Research'));
        if (response.ok) {
          const allCodes = await response.json();
          console.log('=== Research 공통코드 전체 데이터 ===');
          console.log('전체 데이터 개수:', allCodes.length);
          console.log('데이터 구조:', allCodes);
          
          // Research 메뉴의 1단계 코드 찾기 (백엔드에서 이미 Research만 필터링되어 있음)
          const researchMaster = allCodes.find((code: any) => 
            code.menuName === 'Research' && !code.parentId
          );
          
          if (researchMaster) {
            console.log('=== Research 1단계 마스터 코드 ===');
            console.log('Research 마스터:', researchMaster);
            console.log('Research 마스터 children:', researchMaster.children);
            
            // 계층 구조에서 MOT Study 2단계 코드 찾기
            const motStudyLevel2 = researchMaster.children?.find((code: any) => 
              code.codeName === 'MOT Study'
            );
            
            // 계층 구조에서 Research분야 2단계 코드 찾기
            const researchLevel2 = researchMaster.children?.find((code: any) => 
              code.codeName === 'Research분야'
            );
            
            console.log('=== 2단계 카테고리 ===');
            console.log('MOT Study:', motStudyLevel2);
            console.log('Research분야:', researchLevel2);
            
            // MOT Study의 3단계 카테고리 불러오기
            // 조건: menu_name = 'Research' AND parent_id = MOT Study 2단계 코드의 ID
            if (motStudyLevel2 && motStudyLevel2.children) {
              const motStudyLevel3 = motStudyLevel2.children
                .filter((code: any) => code.menuName === 'Research')
                .sort((a: any, b: any) => {
                  const sortA = a.sortOrder != null ? a.sortOrder : 999;
                  const sortB = b.sortOrder != null ? b.sortOrder : 999;
                  return sortA - sortB;
                });
              console.log('=== MOT Study 3단계 카테고리 ===');
              console.log('필터 조건: menuName=Research, parentId=' + motStudyLevel2.id);
              console.log('개수:', motStudyLevel3.length);
              console.log('목록:', motStudyLevel3.map((c: any) => ({ name: c.codeName, sortOrder: c.sortOrder })));
              setMotStudyLevel3Categories(motStudyLevel3.map((c: any) => ({ id: c.id, name: c.codeName })));
            } else {
              console.warn('MOT Study 2단계 코드 또는 children을 찾을 수 없습니다.');
              setMotStudyLevel3Categories([]);
            }
            
            // Research분야의 3단계 카테고리 불러오기
            // 조건: menu_name = 'Research' AND parent_id = Research분야 2단계 코드의 ID
            if (researchLevel2 && researchLevel2.children) {
              const researchLevel3 = researchLevel2.children
                .filter((code: any) => code.menuName === 'Research')
                .sort((a: any, b: any) => {
                  const sortA = a.sortOrder != null ? a.sortOrder : 999;
                  const sortB = b.sortOrder != null ? b.sortOrder : 999;
                  return sortA - sortB;
                });
              console.log('=== Research분야 3단계 카테고리 ===');
              console.log('필터 조건: menuName=Research, parentId=' + researchLevel2.id);
              console.log('개수:', researchLevel3.length);
              console.log('목록:', researchLevel3.map((c: any) => ({ name: c.codeName, sortOrder: c.sortOrder })));
              setResearchLevel3Categories(researchLevel3.map((c: any) => ({ id: c.id, name: c.codeName })));
            } else {
              console.warn('Research분야 2단계 코드 또는 children을 찾을 수 없습니다.');
              setResearchLevel3Categories([]);
            }
          } else {
            console.warn('Research 1단계 마스터 코드를 찾을 수 없습니다.');
            setMotStudyLevel3Categories([]);
            setResearchLevel3Categories([]);
          }
        } else {
          console.error('API 응답 실패:', response.status, response.statusText);
          setMotStudyLevel3Categories([]);
          setResearchLevel3Categories([]);
        }
      } catch (error) {
        console.error('카테고리 조회 실패:', error);
        setMotStudyLevel3Categories([]);
        setResearchLevel3Categories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // 선택한 카테고리에 따라 formData.category 업데이트 (두 카테고리를 조합)
  useEffect(() => {
    let finalCategory = '';
    
    // MOT Study와 Research분야를 모두 선택할 수 있음
    if (motStudyCategory && researchCategory) {
      // 둘 다 선택된 경우: "MOT Study 카테고리 / Research분야 카테고리" 형식
      finalCategory = `${motStudyCategory} / ${researchCategory === '기타' && categoryEtc ? `기타 > ${categoryEtc}` : researchCategory}`;
    } else if (motStudyCategory) {
      // MOT Study만 선택된 경우
      finalCategory = motStudyCategory;
    } else if (researchCategory) {
      // Research분야만 선택된 경우
      finalCategory = researchCategory === '기타' && categoryEtc ? `기타 > ${categoryEtc}` : researchCategory;
    }
    
    setFormData(prev => ({ ...prev, category: finalCategory }));
    
    // Research분야에서 기타가 아닌 경우 기타 내용 초기화
    if (researchCategory !== '기타') {
      setCategoryEtc('');
    }
  }, [motStudyCategory, researchCategory, categoryEtc]);

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
          console.log('=== Opinion Edit API 호출 ===');
          console.log('Edit ID:', editId);
          
          // 운영 환경에서는 상대 경로 사용, 개발 환경에서는 절대 경로 사용
          const apiUrl = process.env.NODE_ENV === 'production' 
            ? getRelativeApiUrl(`/api/opinions/${editId}`)
            : getApiUrl(`/api/opinions/${editId}`);
          
          console.log('API URL:', apiUrl);
          const response = await axios.get(apiUrl);
          console.log('API 응답:', response.data);
          const article = response.data;
          
          // 새로운 필드가 있으면 사용, 없으면 기존 category 필드 파싱
          if (article.motStudyCategory) {
            setMotStudyCategory(article.motStudyCategory);
          }
          
          if (article.researchCategory) {
            // Research분야 카테고리 파싱 (기타 처리 포함)
            let researchCat = article.researchCategory;
            let etcValue = '';
            
            if (researchCat.includes(' > ')) {
              const parts = researchCat.split(' > ');
              researchCat = parts[0]; // "기타"
              etcValue = parts[1] || ''; // "기타내용"
            }
            
            setResearchCategory(researchCat);
            setCategoryEtc(etcValue);
          } else {
            // 기존 category 필드에서 파싱 (하위 호환성)
            const savedCategory = article.category || '';
            if (savedCategory) {
              // "MOT Study 카테고리 / Research분야 카테고리" 형식 파싱
              if (savedCategory.includes(' / ')) {
                const parts = savedCategory.split(' / ');
                const motPart = parts[0];
                const researchPart = parts[1];
                
                // MOT Study 파싱
                if (motPart) {
                  setMotStudyCategory(motPart);
                }
                
                // Research분야 파싱
                if (researchPart) {
                  let researchCat = researchPart;
                  let etcValue = '';
                  
                  if (researchPart.includes(' > ')) {
                    const etcParts = researchPart.split(' > ');
                    researchCat = etcParts[0];
                    etcValue = etcParts[1] || '';
                  }
                  
                  setResearchCategory(researchCat);
                  setCategoryEtc(etcValue);
                }
              } else {
                // 단일 카테고리인 경우 (기존 데이터)
                // MOT Study인지 Research분야인지 확인
                const findCategoryType = async () => {
                  try {
                    const allCodesResponse = await fetch(getApiUrl('/api/codes?menuName=Research'));
                    if (allCodesResponse.ok) {
                      const allCodes = await allCodesResponse.json();
                      let categoryName = savedCategory;
                      let etcValue = '';
                      
                      if (savedCategory.includes(' > ')) {
                        const parts = savedCategory.split(' > ');
                        categoryName = parts[0];
                        etcValue = parts[1] || '';
                      }
                      
                      const level3Code = allCodes.find((code: any) => code.codeName === categoryName);
                      if (level3Code && level3Code.parentId) {
                        const level2Code = allCodes.find((code: any) => code.id === level3Code.parentId);
                        if (level2Code) {
                          // 정확한 이름으로 확인
                          if (level2Code.codeName === 'MOT Study') {
                            setMotStudyCategory(categoryName);
                          } else if (level2Code.codeName === 'Research분야') {
                            setResearchCategory(categoryName);
                            setCategoryEtc(etcValue);
                          }
                        }
                      }
                    }
                  } catch (error) {
                    console.error('기존 카테고리 로드 실패:', error);
                  }
                };
                findCategoryType();
              }
            }
          }
          
          setFormData({
            title: article.title || '',
            authorName: article.authorName || '',
            abstractText: article.abstractText || '',
            keywords: article.keywords || '',
            references: article.references || '',
            fullText: article.fullText || '',
            status: article.status || '임시저장',
            category: article.category || '',
            websiteLink: article.websiteLink || '',
          });

          // 기존 첨부파일 불러오기
          try {
            const attApiUrl = process.env.NODE_ENV === 'production' 
              ? getRelativeApiUrl(`/api/attachments?refTable=opinions&refId=${editId}`)
              : getApiUrl(`/api/attachments?refTable=opinions&refId=${editId}`);
            
            const attachmentsResponse = await axios.get(attApiUrl);
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
        } catch (error: any) {
          console.error('기존 기고를 불러오는데 실패했습니다:', error);
          console.error('오류 상세:', error.response?.data || error.message);
          alert(`기존 기고를 불러오는데 실패했습니다. (${error.response?.status || '연결 오류'})`);
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
      const attDeleteApiUrl = process.env.NODE_ENV === 'production' 
        ? getRelativeApiUrl(`/api/attachments/${attachmentId}`)
        : getApiUrl(`/api/attachments/${attachmentId}`);
      
      await axios.delete(attDeleteApiUrl);
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
      
      const attUpdateApiUrl = process.env.NODE_ENV === 'production' 
        ? getRelativeApiUrl(`/api/attachments/${attachmentId}`)
        : getApiUrl(`/api/attachments/${attachmentId}`);
      
      await axios.put(attUpdateApiUrl, {
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
    
    // 카테고리 필수 선택 검증 (최소 하나는 선택해야 함)
    if (!motStudyCategory && !researchCategory) {
      alert('MOT Study 또는 Research분야 중 최소 하나는 선택해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let opinionId;
      
      if (isEditMode && editId) {
        // Edit 모드: 기존 기고 수정
        const updateApiUrl = process.env.NODE_ENV === 'production' 
          ? getRelativeApiUrl(`/api/opinions/${editId}`)
          : getApiUrl(`/api/opinions/${editId}`);
        
        // 카테고리 저장: MOT Study와 Research분야를 별도 필드로 저장
        // 기존 category 필드는 하위 호환성을 위해 유지 (조합된 값)
        const categoryToSave = formData.category;
        const researchCategoryToSave = researchCategory === '기타' && categoryEtc 
          ? `기타 > ${categoryEtc}` 
          : researchCategory;
        
        const res = await axios.put(updateApiUrl, {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '등록대기',
          category: categoryToSave,
          motStudyCategory: motStudyCategory || null,
          researchCategory: researchCategoryToSave || null,
          websiteLink: formData.websiteLink || null,
        }, {
          headers: {
            'User-Role': user?.role || '',
          },
        });
        opinionId = editId;
      } else {
        // 새 기고 등록
        const createApiUrl = process.env.NODE_ENV === 'production' 
          ? getRelativeApiUrl('/api/opinions')
          : getApiUrl('/api/opinions');
        
        // 카테고리 저장: MOT Study와 Research분야를 별도 필드로 저장
        // 기존 category 필드는 하위 호환성을 위해 유지 (조합된 값)
        const categoryToSave = formData.category;
        const researchCategoryToSave = researchCategory === '기타' && categoryEtc 
          ? `기타 > ${categoryEtc}` 
          : researchCategory;
        
        const res = await axios.post(createApiUrl, {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '등록대기',
          category: categoryToSave,
          motStudyCategory: motStudyCategory || null,
          researchCategory: researchCategoryToSave || null,
          websiteLink: formData.websiteLink || null,
        }, {
          headers: {
            'User-Role': user?.role || '',
          },
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
        
        const uploadApiUrl = process.env.NODE_ENV === 'production' 
          ? getRelativeApiUrl('/api/attachments')
          : getApiUrl('/api/attachments');
        
        await axios.post(uploadApiUrl, form, {
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
        const tempSaveApiUrl = process.env.NODE_ENV === 'production' 
          ? getRelativeApiUrl(`/api/opinions/${editId}`)
          : getApiUrl(`/api/opinions/${editId}`);
        
        // 카테고리 저장: MOT Study와 Research분야를 별도 필드로 저장
        const categoryToSave = formData.category;
        const researchCategoryToSave = researchCategory === '기타' && categoryEtc 
          ? `기타 > ${categoryEtc}` 
          : researchCategory;
        
        const res = await axios.put(tempSaveApiUrl, {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '임시저장',
          category: categoryToSave,
          motStudyCategory: motStudyCategory || null,
          researchCategory: researchCategoryToSave || null,
          websiteLink: formData.websiteLink || null,
        }, {
          headers: {
            'User-Role': user?.role || '',
          },
        });
        opinionId = editId;
      } else {
        // 새 기고 임시저장
        const tempCreateApiUrl = process.env.NODE_ENV === 'production' 
          ? getRelativeApiUrl('/api/opinions')
          : getApiUrl('/api/opinions');
        
        // 카테고리 저장: formData.category에 이미 조합된 값이 있음
        const categoryToSave = formData.category;
        
        const res = await axios.post(tempCreateApiUrl, {
          title: formData.title,
          authorName: formData.authorName,
          abstractText: formData.abstractText,
          keywords: formData.keywords,
          references: formData.references,
          fullText: formData.fullText,
          status: '임시저장',
          category: categoryToSave,
          websiteLink: formData.websiteLink || null,
        }, {
          headers: {
            'User-Role': user?.role || '',
          },
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
        
        const tempUploadApiUrl = process.env.NODE_ENV === 'production' 
          ? getRelativeApiUrl('/api/attachments')
          : getApiUrl('/api/attachments');
        
        await axios.post(tempUploadApiUrl, form, {
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
      const deleteApiUrl = process.env.NODE_ENV === 'production' 
        ? getRelativeApiUrl(`/api/opinions/${editId}`)
        : getApiUrl(`/api/opinions/${editId}`);
      
      await axios.delete(deleteApiUrl, {
        headers: {
          'User-Role': user?.role || '',
        },
      });
      
      // 첨부파일도 함께 삭제 (서버에서 cascade로 처리되거나 별도 삭제)
      if (existingAttachments.length > 0) {
        for (const attachment of existingAttachments) {
          try {
            const attDeleteApiUrl = process.env.NODE_ENV === 'production' 
              ? getRelativeApiUrl(`/api/attachments/${attachment.id}`)
              : getApiUrl(`/api/attachments/${attachment.id}`);
            
            await axios.delete(attDeleteApiUrl);
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
              <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Research 자료수정' : 'Research 자료등록'}</h1>
            </div>
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
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
                {/* MOT Study 3단계 카테고리 선택 */}
                <div className="flex-1">
                  <select
                    value={motStudyCategory}
                    onChange={(e) => {
                      setMotStudyCategory(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">자료 유형</option>
                    {motStudyLevel3Categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* Research분야 3단계 카테고리 선택 */}
                <div className={researchCategory === '기타' ? 'flex-1' : 'flex-1'}>
                  <select
                    value={researchCategory}
                    onChange={(e) => {
                      setResearchCategory(e.target.value);
                      // 기타가 아닌 경우 기타 내용 초기화
                      if (e.target.value !== '기타') {
                        setCategoryEtc('');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">MOT 카테고리</option>
                    {researchLevel3Categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                {/* 기타 키인 부분 (Research분야에서 기타 선택 시 표시) */}
                {researchCategory === '기타' && (
                  <div className="flex-1">
                    <input
                      type="text"
                      value={categoryEtc}
                      onChange={(e) => setCategoryEtc(e.target.value)}
                      placeholder="기타 키인 부분"
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
              <div className="flex gap-2">
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="키워드를 콤마(,)로 구분해 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowKeywordModal(true)}
                  className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiSearch className="w-4 h-4 mr-2" />
                  키워드 조회
                </button>
              </div>
            </div>

            {/* Website Link */}
            <div>
              <label htmlFor="websiteLink" className="block text-sm font-medium text-gray-700 mb-2">
                웹사이트 링크
              </label>
              <input
                type="url"
                id="websiteLink"
                name="websiteLink"
                value={formData.websiteLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="https://example.com"
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

        {/* 키워드 선택 모달 */}
        <KeywordSelectorModal
          isOpen={showKeywordModal}
          onClose={() => setShowKeywordModal(false)}
          menuType="Research"
          currentKeywords={formData.keywords}
          onSelectKeywords={(selectedKeywords) => setFormData(prev => ({ ...prev, keywords: selectedKeywords }))}
        />
      </div>
    </main>
  );
}

export default function OpinionRegisterPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </main>
    }>
      <OpinionRegisterPageContent />
    </Suspense>
  );
} 