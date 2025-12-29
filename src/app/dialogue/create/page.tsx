'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiArrowLeft, FiSave, FiEye, FiEyeOff, FiUsers, FiUserPlus, FiUserCheck, FiSearch, FiX, FiMail, FiTrash2 } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/config/api';

interface CreateDialogueRoomForm {
  title: string;
  question: string;
  isPublic: boolean;
  selectedExperts: string[]; // 회원 대신 전문가 ID 배열
}

interface Expert {
  id: string;
  name: string;
  email: string;
  organization?: string;
  field?: string;
}

function CreateDialoguePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const roomId = searchParams.get('roomId');
  const isEditMode = !!roomId;
  
  const [formData, setFormData] = useState<CreateDialogueRoomForm>({
    title: '',
    question: '',
    isPublic: true,
    selectedExperts: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateDialogueRoomForm>>({});
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [experts, setExperts] = useState<Expert[]>([]);
  const [emailAddedUsers, setEmailAddedUsers] = useState<Expert[]>([]); // 이메일로 추가된 사용자 (전문가 리스트에 표시 안 함)
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [hoveredExpertId, setHoveredExpertId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // 선택된 참여자 정보 가져오기 (전문가 + 이메일로 추가된 사용자)
  const selectedExpertDetails = [
    ...experts.filter(expert => formData.selectedExperts.includes(expert.id)),
    ...emailAddedUsers.filter(user => formData.selectedExperts.includes(user.id))
  ];
  
  console.log('선택된 전문가 ID들:', formData.selectedExperts);
  console.log('선택된 전문가 상세 정보:', selectedExpertDetails);

  // 전문가 목록 불러오기
  const fetchExperts = async () => {
    try {
      setLoadingExperts(true);
      const response = await fetch(getApiUrl('/api/experts/active'), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('전문가 목록 API 응답:', data);
        
        // API 응답이 배열인지 확인하고, 아니면 빈 배열로 설정
        const expertsData = Array.isArray(data) ? data : [];
        
        // Expert 형식으로 변환
        const formattedExperts = expertsData.map((expert: any) => ({
          id: expert.id.toString(),
          name: expert.name || expert.email?.split('@')[0] || '전문가',
          email: expert.email,
          organization: expert.organization || '',
          field: expert.field || ''
        }));
        
        setExperts(formattedExperts);
        console.log('변환된 전문가 목록:', formattedExperts);
      } else {
        console.error('전문가 목록 불러오기 실패');
        setExperts([]);
      }
    } catch (error) {
      console.error('전문가 목록 불러오기 오류:', error);
      setExperts([]);
    } finally {
      setLoadingExperts(false);
    }
  };

  // 대화방 정보 불러오기 (수정 모드일 때)
  const fetchRoomData = async () => {
    if (!roomId || !isAuthenticated) return;
    
    try {
      setLoadingRoom(true);
      const response = await fetch(getApiUrl(`/api/dialogue/rooms/${roomId}`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const room = data.room;
        
        // 대화방 정보로 폼 채우기
        setFormData({
          title: room.title || '',
          question: room.question || '',
          isPublic: room.isPublic !== undefined ? room.isPublic : true,
          selectedExperts: []
        });
        
        // 참여자 정보 가져오기 (전문가만)
        if (data.participants && Array.isArray(data.participants)) {
          // EXPERT 역할인 참여자만 필터링
          const expertParticipants = data.participants
            .filter((p: any) => p.role === 'EXPERT' && p.email !== room.authorEmail);
          
          // 전문가 목록에서 참여자 ID 찾기
          const expertIds = experts
            .filter(expert => expertParticipants.some((p: any) => p.email === expert.email))
            .map(expert => expert.id);
          
          setFormData(prev => ({
            ...prev,
            selectedExperts: expertIds
          }));
        }
      } else {
        console.error('대화방 정보 불러오기 실패');
        alert('대화방 정보를 불러올 수 없습니다.');
        router.push('/dialogue');
      }
    } catch (error) {
      console.error('대화방 정보 불러오기 오류:', error);
      alert('대화방 정보를 불러오는 중 오류가 발생했습니다.');
      router.push('/dialogue');
    } finally {
      setLoadingRoom(false);
    }
  };

  // 페이지 로드 시 전문가 목록 불러오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchExperts();
    }
  }, [isAuthenticated]);

  // 수정 모드일 때 대화방 정보 불러오기
  useEffect(() => {
    if (isEditMode && isAuthenticated && experts.length > 0) {
      fetchRoomData();
    }
  }, [isEditMode, isAuthenticated, experts.length]);

  // 로그인 체크
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiEyeOff className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
              <p className="text-gray-600 mb-6">대화방을 생성하려면 로그인해주세요.</p>
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const validateForm = () => {
    const newErrors: Partial<CreateDialogueRoomForm> = {};

    // 제목 검증
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = '제목은 5자 이상 입력해주세요.';
    }

    // 질문 내용 검증
    if (!formData.question.trim()) {
      newErrors.question = '질문 내용을 입력해주세요.';
    } else if (formData.question.trim().length < 10) {
      newErrors.question = '질문 내용은 10자 이상 입력해주세요.';
    }

    // 사용자 이메일 검증
    if (!user?.email) {
      alert('사용자 정보가 없습니다. 다시 로그인해주세요.');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 대화방 삭제 핸들러
  const handleDelete = async () => {
    if (!roomId) {
      return;
    }

    // 삭제 확인
    const confirmMessage = `정말로 이 대화방을 삭제하시겠습니까?\n삭제된 대화방은 복구할 수 없습니다.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl(`/api/dialogue/rooms/${roomId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('대화방 삭제 성공:', data);
        alert('대화방이 성공적으로 삭제되었습니다.');
        router.push('/dialogue');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('서버 오류 응답:', errorData);
        
        let displayMessage = errorData.error || `서버 오류 (${response.status})`;
        if (response.status === 403) {
          displayMessage = '대화방 삭제는 관리자만 가능합니다.';
        }
        throw new Error(displayMessage);
      }
    } catch (error) {
      console.error('대화방 삭제 실패:', error);
      let errorMessage = '알 수 없는 오류';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      alert(`대화방 삭제에 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 작성자도 참여자에 포함
      const allParticipantEmails = [
        user?.email || '', // 작성자 이메일 추가
        ...selectedExpertDetails.map(expert => expert.email) // 선택된 전문가 이메일 추가
      ].filter((email, index, array) => array.indexOf(email) === index) // 중복 제거
       .filter(email => email && email.trim() !== ''); // 빈 이메일 제거
      
      // 참여자 이메일 사전 검증 (존재하지 않는 사용자 확인)
      const invalidEmails: string[] = [];
      for (const email of allParticipantEmails) {
        if (email && email !== user?.email) { // 작성자는 제외
          try {
            const verifyResponse = await fetch(getApiUrl(`/api/users/email/${email}`), {
              headers: {
                'User-Email': user?.email || '',
                'User-Role': user?.role || '',
              },
            });
            
            if (!verifyResponse.ok) {
              invalidEmails.push(email);
            }
          } catch (error) {
            console.error(`사용자 검증 실패: ${email}`, error);
            invalidEmails.push(email);
          }
        }
      }
      
      if (invalidEmails.length > 0) {
        throw new Error(`다음 사용자를 찾을 수 없습니다: ${invalidEmails.join(', ')}`);
      }
      
      const requestData = {
        title: formData.title.trim(),
        question: formData.question.trim(),
        isPublic: formData.isPublic,
        authorEmail: user?.email || '',
        participantEmails: allParticipantEmails,
      };

      // 필수 필드 재검증
      if (!requestData.authorEmail) {
        throw new Error('작성자 이메일이 없습니다.');
      }

      console.log('작성자 이메일:', user?.email);
      console.log('선택된 전문가 이메일:', selectedExpertDetails.map(expert => expert.email));
      console.log('최종 참여자 이메일 목록:', allParticipantEmails);
      console.log('대화방 생성/수정 요청 데이터:', requestData);

      // 수정 모드인 경우 PUT 요청, 생성 모드인 경우 POST 요청
      const url = isEditMode 
        ? getApiUrl(`/api/dialogue/rooms/${roomId}`)
        : getApiUrl('/api/dialogue/rooms');
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`대화방 ${isEditMode ? '수정' : '생성'} 성공:`, data);
        console.log(`대화방 ID:`, data.room?.id || data.id);
        console.log('전송된 참여자 목록:', allParticipantEmails);
        alert(`대화방이 성공적으로 ${isEditMode ? '수정' : '생성'}되었습니다.`);
        // 대화방 목록 페이지로 이동하면서 새로고침 파라미터 추가
        router.push('/dialogue?refresh=true');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('서버 오류 응답:', errorData);
        
        // 에러 메시지 추출 (error 필드 또는 message 필드 사용)
        const errorMessage = errorData.error || errorData.message || `서버 오류 (${response.status})`;
        
        // 중복 메시지 방지: 이미 "대화방 생성에 실패했습니다"가 포함되어 있으면 그대로 사용
        if (errorMessage.includes('대화방') && errorMessage.includes('실패')) {
          alert(errorMessage);
        } else {
          alert(`대화방 ${isEditMode ? '수정' : '생성'}에 실패했습니다: ${errorMessage}`);
        }
        return;
      }
    } catch (error) {
      console.error(`대화방 ${isEditMode ? '수정' : '생성'} 실패:`, error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      // 네트워크 오류 등 기타 오류의 경우
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
        alert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      } else if (!errorMessage.includes('대화방') || !errorMessage.includes('실패')) {
        alert(`대화방 ${isEditMode ? '수정' : '생성'}에 실패했습니다: ${errorMessage}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateDialogueRoomForm, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleRemoveExpert = (expertId: string) => {
    handleInputChange('selectedExperts', formData.selectedExperts.filter(id => id !== expertId));
    // 이메일로 추가된 사용자 목록에서도 제거
    setEmailAddedUsers(prev => prev.filter(user => user.id !== expertId));
  };

  const handleAddMemberByEmail = async () => {
    const email = emailInput.trim().toLowerCase();
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 이미 선택된 전문가인지 확인
    const existingExpert = experts.find(expert => 
      expert.email.toLowerCase() === email && formData.selectedExperts.includes(expert.id)
    );
    
    if (existingExpert) {
      setEmailError('이미 추가된 전문가입니다.');
      return;
    }

    try {
      // 백엔드 API로 사용자 검증 (회원 또는 전문가)
      const response = await fetch(getApiUrl(`/api/users/email/${email}`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('API 응답 데이터:', userData);
        
        // 이메일을 기준으로 전문가 목록에서 찾기 (ID가 아닌 이메일로 매칭)
        const existingExpert = experts.find(e => e.email.toLowerCase() === email);
        
        if (existingExpert) {
          // 이미 전문가 목록에 있으면 해당 전문가의 ID를 선택 목록에 추가 (중복 체크)
          if (!formData.selectedExperts.includes(existingExpert.id)) {
            console.log('전문가 목록에서 찾음:', existingExpert);
            handleInputChange('selectedExperts', [...formData.selectedExperts, existingExpert.id]);
          }
        } else {
          // 전문가 목록에 없으면 이메일로 추가된 사용자 목록에서 찾기
          const existingEmailUser = emailAddedUsers.find(u => u.email.toLowerCase() === email);
          
          if (existingEmailUser) {
            // 이미 이메일로 추가된 사용자 목록에 있으면 해당 ID를 선택 목록에 추가
            if (!formData.selectedExperts.includes(existingEmailUser.id)) {
              console.log('이메일로 추가된 사용자 목록에서 찾음:', existingEmailUser);
              handleInputChange('selectedExperts', [...formData.selectedExperts, existingEmailUser.id]);
            }
          } else {
            // 둘 다 없으면 새로 추가 (고유 ID 생성: email-{이메일} 형식으로 중복 방지)
            const user = {
              id: `email-${userData.email}`,
              name: userData.name || userData.email.split('@')[0],
              email: userData.email,
              organization: userData.organization || '',
              field: userData.field || ''
            };
            
            console.log('새 사용자 추가:', user);
            setEmailAddedUsers(prev => [...prev, user]);
            handleInputChange('selectedExperts', [...formData.selectedExperts, user.id]);
          }
        }
        
        setEmailInput('');
        setEmailError('');
        setSearchResults([]);
        setShowSearchResults(false);
      } else {
        setEmailError('해당 이메일의 사용자를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('사용자 검증 중 오류:', error);
      setEmailError('사용자 검증 중 오류가 발생했습니다.');
    }
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 검색 결과가 표시되어 있을 때는 Enter 키로 자동 선택하지 않음
      // 사용자가 명시적으로 검색 결과를 클릭해야만 선택됨
      if (!showSearchResults) {
        handleAddMemberByEmail();
      }
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
    }
  };

  // 회원 검색 함수
  const searchUsers = async (query: string) => {
    // 영문 2글자 이상만 검색
    if (query.length < 2 || !/^[a-zA-Z]/.test(query)) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(getApiUrl(`/api/users/search?query=${encodeURIComponent(query)}`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (response.ok) {
        const users = await response.json();
        // 이미 선택된 사용자 제외 (전문가 + 이메일로 추가된 사용자 모두 확인)
        const allSelectedUsers = [...experts, ...emailAddedUsers];
        const filteredUsers = users.filter((userData: any) => {
          // 현재 선택된 사용자 목록에서 이메일로 비교
          const selectedUserEmails = allSelectedUsers
            .filter(user => formData.selectedExperts.includes(user.id))
            .map(user => user.email.toLowerCase());
          
          return !selectedUserEmails.includes(userData.email.toLowerCase());
        });
        setSearchResults(filteredUsers);
        setShowSearchResults(filteredUsers.length > 0);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('회원 검색 중 오류:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 결과 선택 핸들러
  const handleSelectSearchResult = async (userData: any) => {
    const userEmail = userData.email.toLowerCase();
    
    // 이미 선택된 사용자인지 확인 (이메일 기준으로 정확히 비교)
    const allSelectedUsers = [...experts, ...emailAddedUsers];
    const isAlreadySelected = allSelectedUsers.some(
      user => user.email.toLowerCase() === userEmail && formData.selectedExperts.includes(user.id)
    );
    
    if (isAlreadySelected) {
      // 이미 선택된 사용자면 추가하지 않음
      setEmailInput('');
      setEmailError('');
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // 이메일을 기준으로 전문가 목록에서 찾기 (ID가 아닌 이메일로 매칭)
    const existingExpert = experts.find(e => e.email.toLowerCase() === userEmail);
    
    if (existingExpert) {
      // 이미 전문가 목록에 있으면 해당 전문가의 ID를 선택 목록에 추가 (중복 체크)
      if (!formData.selectedExperts.includes(existingExpert.id)) {
        console.log('전문가 목록에서 찾음:', existingExpert);
        handleInputChange('selectedExperts', [...formData.selectedExperts, existingExpert.id]);
      }
    } else {
      // 전문가 목록에 없으면 이메일로 추가된 사용자 목록에서 찾기
      const existingEmailUser = emailAddedUsers.find(u => u.email.toLowerCase() === userEmail);
      
      if (existingEmailUser) {
        // 이미 이메일로 추가된 사용자 목록에 있으면 해당 ID를 선택 목록에 추가
        if (!formData.selectedExperts.includes(existingEmailUser.id)) {
          console.log('이메일로 추가된 사용자 목록에서 찾음:', existingEmailUser);
          handleInputChange('selectedExperts', [...formData.selectedExperts, existingEmailUser.id]);
        }
      } else {
        // 둘 다 없으면 새로 추가 (고유 ID 생성: email-{이메일} 형식으로 중복 방지)
        const newUser = {
          id: `email-${userData.email}`,
          name: userData.name || userData.email.split('@')[0],
          email: userData.email,
          organization: userData.organization || '',
          field: userData.field || ''
        };
        
        console.log('새 사용자 추가:', newUser);
        setEmailAddedUsers(prev => [...prev, newUser]);
        handleInputChange('selectedExperts', [...formData.selectedExperts, newUser.id]);
      }
    }

    setEmailInput('');
    setEmailError('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // 이메일 입력 변경 핸들러
  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);
    
    if (emailError) {
      setEmailError('');
    }

    // 영문 2글자 이상 입력 시 검색
    if (value.length >= 2 && /^[a-zA-Z]/.test(value)) {
      searchUsers(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
                    <div className="pt-28">
         <div className="py-8">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
             {/* 페이지 제목 및 돌아가기 버튼 */}
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                   <FiSave className="w-5 h-5 text-blue-600" />
                 </div>
                 <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? '대화방 수정' : '대화방 생성'}</h1>
               </div>
               <button
                 onClick={() => router.back()}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <FiX className="w-6 h-6" />
               </button>
             </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 입력 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    대화방 제목 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="대화방 제목을 입력하세요 (5자 이상 100자 이하)"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* 참여자 선택 섹션 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    참여자 선택
                  </label>
                  
                  {/* 전문가 목록 */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 h-6">
                      <FiUsers className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-600 leading-6">전문가에서 선택</span>
                      {/* 전문분야 표시 영역 - 라벨 옆에 인라인으로 표시 */}
                      <span className={`ml-3 px-3 h-6 flex items-center bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700 transition-opacity duration-200 ${
                        hoveredExpertId && experts.find(e => e.id === hoveredExpertId)?.field ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}>
                        {hoveredExpertId && (() => {
                          const hoveredExpert = experts.find(e => e.id === hoveredExpertId);
                          return hoveredExpert?.field || '';
                        })()}
                      </span>
                    </div>
                    
                    {loadingExperts ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">전문가 목록을 불러오는 중...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                        {experts.map((expert) => (
                          <button
                            key={expert.id}
                            type="button"
                            onClick={() => {
                              if (formData.selectedExperts.includes(expert.id)) {
                                handleRemoveExpert(expert.id);
                              } else {
                                handleInputChange('selectedExperts', [...formData.selectedExperts, expert.id]);
                              }
                            }}
                            onMouseEnter={() => setHoveredExpertId(expert.id)}
                            onMouseLeave={() => setHoveredExpertId(null)}
                            className={`w-full flex items-center justify-center p-2 rounded-md border text-sm transition-colors ${
                              formData.selectedExperts.includes(expert.id)
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="truncate">{expert.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 이메일 입력 */}
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">회원 참여자 추가</span>
                    </div>
                    <div className="flex space-x-2 relative">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={emailInput}
                          onChange={handleEmailInputChange}
                          onKeyDown={handleEmailKeyPress}
                          onBlur={() => {
                            // 약간의 지연을 두어 클릭 이벤트가 먼저 처리되도록
                            setTimeout(() => setShowSearchResults(false), 200);
                          }}
                          onFocus={() => {
                            if (searchResults.length > 0) {
                              setShowSearchResults(true);
                            }
                          }}
                          placeholder="이메일을 입력하세요 (영문 2글자 이상 자동완성)"
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            emailError ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {/* 검색 결과 드롭다운 */}
                        {showSearchResults && searchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {isSearching ? (
                              <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                검색 중...
                              </div>
                            ) : (
                              searchResults.map((userData) => (
                                <button
                                  key={userData.id}
                                  type="button"
                                  onClick={() => handleSelectSearchResult(userData)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium text-gray-900">{userData.name}</div>
                                  <div className="text-xs text-gray-500">{userData.email}</div>
                                  {userData.organization && (
                                    <div className="text-xs text-gray-400">{userData.organization}</div>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        {emailError && (
                          <p className="mt-1 text-sm text-red-600">{emailError}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddMemberByEmail}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        추가
                      </button>
                    </div>
                    
                    {/* 선택된 참여자 목록 */}
                    {selectedExpertDetails.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center mb-3">
                          <FiUserCheck className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-gray-700">
                            대화방 참여자 ({selectedExpertDetails.length}명)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedExpertDetails.map((expert) => (
                            <div
                              key={expert.id}
                              className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                            >
                              <span className="text-sm text-gray-700">{expert.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpert(expert.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  
                </div>

                                                  {/* 주제/질문 입력 */}
                 <div>
                   <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                     주제/질문 *
                   </label>
                   <textarea
                     id="question"
                     value={formData.question}
                     onChange={(e) => handleInputChange('question', e.target.value)}
                     rows={8}
                     className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                       errors.question ? 'border-red-300' : 'border-gray-300'
                     }`}
                     placeholder="주제/질문을 상세히 작성해주세요 (10자 이상)"
                     maxLength={2000}
                   />
                  {errors.question && (
                    <p className="mt-1 text-sm text-red-600">{errors.question}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.question.length}/2000자
                  </p>
                </div>

                {/* 공개 여부 설정 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    공개 설정
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        value="true"
                        checked={formData.isPublic === true}
                        onChange={(e) => handleInputChange('isPublic', e.target.value === 'true')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        <span className="font-medium">공개</span>
                        <span className="text-gray-500"> - 회원 누구나 대화방을 볼 수 있습니다</span>
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublic"
                        value="false"
                        checked={formData.isPublic === false}
                        onChange={(e) => handleInputChange('isPublic', e.target.value === 'true')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        <span className="font-medium">비공개</span>
                        <span className="text-gray-500"> - 관리자와 참여자만 대화방을 볼 수 있습니다</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* 안내 메시지 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiEye className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        대화방 생성 안내
                      </h3>
                                             <div className="mt-2 text-sm text-blue-700">
                         <ul className="list-disc list-inside space-y-1">
                           <li>전문가와 선택한 참여자가 함께하는 대화방이 생성됩니다.</li>
                           <li>대화방 상태는 기본적으로 '진행중'으로 설정됩니다.</li>
                           <li>생성된 대화방은 관리자에게 수정권한이 있습니다.</li>
                         </ul>
                       </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex justify-between items-center pt-6">
                  {/* 관리자 권한이고 수정 모드일 때 삭제 버튼 표시 */}
                  {isEditMode && user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-6 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>대화방 삭제</span>
                    </button>
                  )}
                  <div className="flex justify-end space-x-4 ml-auto">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditMode ? '수정 중...' : '생성 중...'}
                        </div>
                      ) : (
                        isEditMode ? '대화방 수정' : '대화방 생성'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

export default function CreateDialoguePage() {
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
      <CreateDialoguePageContent />
    </Suspense>
  );
}
