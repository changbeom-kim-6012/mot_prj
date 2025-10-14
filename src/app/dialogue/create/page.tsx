'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiEye, FiEyeOff, FiUsers, FiUserPlus, FiUserCheck, FiSearch, FiX, FiMail } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/config/api';

interface CreateDialogueRoomForm {
  title: string;
  question: string;
  isPublic: boolean;
  selectedMembers: string[];
}

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function CreateDialoguePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<CreateDialogueRoomForm>({
    title: '',
    question: '',
    isPublic: true,
    selectedMembers: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateDialogueRoomForm>>({});
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // 선택된 회원 정보 가져오기
  const selectedMemberDetails = members.filter(member => 
    formData.selectedMembers.includes(member.id)
  );
  
  console.log('선택된 회원 ID들:', formData.selectedMembers);
  console.log('선택된 회원 상세 정보:', selectedMemberDetails);

  // 회원 목록 불러오기
  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await fetch(getApiUrl('/api/users'), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('회원 목록 API 응답:', data);
        
        // API 응답이 배열인지 확인하고, 아니면 빈 배열로 설정
        const membersData = Array.isArray(data) ? data : [];
        
        // Member 형식으로 변환
        const formattedMembers = membersData.map((user: any) => ({
          id: user.id.toString(),
          name: user.name || user.email.split('@')[0],
          email: user.email,
          avatar: '/experts/member1.jpg' // 기본 아바타 사용
        }));
        
        setMembers(formattedMembers);
        console.log('변환된 회원 목록:', formattedMembers);
      } else {
        console.error('회원 목록 불러오기 실패');
        setMembers([]);
      }
    } catch (error) {
      console.error('회원 목록 불러오기 오류:', error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // 페이지 로드 시 회원 목록 불러오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 전송할 데이터 준비 및 검증
      const requestData = {
        title: formData.title.trim(),
        question: formData.question.trim(),
        isPublic: formData.isPublic,
        authorEmail: user?.email || '',
        participantEmails: selectedMemberDetails.map(member => member.email),
      };

      // 필수 필드 재검증
      if (!requestData.authorEmail) {
        throw new Error('작성자 이메일이 없습니다.');
      }

      console.log('대화방 생성 요청 데이터:', requestData);

      const response = await fetch(getApiUrl('/api/dialogue/rooms'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('대화방 생성 성공:', data);
        alert('대화방이 성공적으로 생성되었습니다.');
        // 대화방 목록 페이지로 이동하면서 새로고침 파라미터 추가
        router.push('/dialogue?refresh=true');
      } else {
        const errorData = await response.json();
        console.error('서버 오류 응답:', errorData);
        throw new Error(errorData.message || `서버 오류 (${response.status}): 대화방 생성에 실패했습니다.`);
      }
    } catch (error) {
      console.error('대화방 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`대화방 생성에 실패했습니다: ${errorMessage}`);
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

  const handleRemoveMember = (memberId: string) => {
    handleInputChange('selectedMembers', formData.selectedMembers.filter(id => id !== memberId));
  };

  const handleAddMemberByEmail = async () => {
    const email = emailInput.trim().toLowerCase();
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 이미 선택된 회원인지 확인
    const existingMember = members.find(member => 
      member.email.toLowerCase() === email && formData.selectedMembers.includes(member.id)
    );
    
    if (existingMember) {
      setEmailError('이미 추가된 회원입니다.');
      return;
    }

    try {
      // 백엔드 API로 회원 검증
      const response = await fetch(getApiUrl(`/api/users/email/${email}`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('API 응답 데이터:', userData);
        
        // 회원 정보를 더미 데이터 형식으로 변환
        const member = {
          id: userData.id.toString(),
          name: userData.name || userData.email.split('@')[0], // 이름이 없으면 이메일 앞부분 사용
          email: userData.email,
          avatar: '/experts/member1.jpg' // 기본 아바타 사용
        };
        
        console.log('변환된 회원 정보:', member);
        
        // 동적으로 회원 목록에 추가
        setMembers(prev => [...prev, member]);
        
        handleInputChange('selectedMembers', [...formData.selectedMembers, member.id]);
        setEmailInput('');
        setEmailError('');
      } else {
        setEmailError('해당 이메일의 회원을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('회원 검증 중 오류:', error);
      setEmailError('회원 검증 중 오류가 발생했습니다.');
    }
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddMemberByEmail();
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
                 <h1 className="text-2xl font-bold text-gray-900">대화방 생성</h1>
               </div>
               <button
                 onClick={() => router.back()}
                 className="text-blue-600 hover:text-blue-700 font-medium"
               >
                 ← 목록으로 돌아가기
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
                    placeholder="대화방 제목을 입력하세요 (5자 이상)"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.title.length}/100자
                  </p>
                </div>

                {/* 참여자 선택 섹션 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    참여자 선택
                  </label>
                  
                  {/* 선택된 회원 표시 */}
                  {selectedMemberDetails.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <FiUsers className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          선택된 참여자 ({selectedMemberDetails.length}명)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMemberDetails.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{member.name}</span>
                            <span className="text-xs text-gray-500">({member.email})</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 기존 회원 목록 */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <FiUsers className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">기존 회원에서 선택</span>
                    </div>
                    {loadingMembers ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">회원 목록을 불러오는 중...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {members.map((member) => (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              if (formData.selectedMembers.includes(member.id)) {
                                handleRemoveMember(member.id);
                              } else {
                                handleInputChange('selectedMembers', [...formData.selectedMembers, member.id]);
                              }
                            }}
                            className={`flex items-center space-x-2 p-2 rounded-md border text-sm transition-colors ${
                              formData.selectedMembers.includes(member.id)
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-700">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <span className="truncate">{member.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 이메일 입력 */}
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">회원 이메일로 참여자 추가</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => {
                            setEmailInput(e.target.value);
                            if (emailError) setEmailError('');
                          }}
                          onKeyPress={handleEmailKeyPress}
                          placeholder="회원 이메일을 입력하세요"
                          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            emailError ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
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
                        <span className="text-gray-500"> - 모든 사용자가 대화방을 볼 수 있습니다</span>
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
                        <span className="text-gray-500"> - 관리자와 전문가만 대화방을 볼 수 있습니다</span>
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
                           <li>생성된 대화방은 수정할 수 없으니 신중하게 작성해주세요.</li>
                         </ul>
                       </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex justify-end space-x-4 pt-6">
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
                        생성 중...
                      </div>
                    ) : (
                      '대화방 생성'
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
