'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiPlus, FiSearch, FiMessageSquare, FiCalendar, FiUser, FiUsers, FiX, FiSend, FiLock, FiChevronDown, FiSettings, FiTrash2, FiFileText } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dateUtils';
import { getApiUrl } from '@/config/api';

interface DialogueRoom {
  id: number;
  title: string;
  question: string;
  authorEmail: string;
  createdAt: string;
  isPublic: boolean;
  status: 'OPEN' | 'CLOSED';
  participantCount: number;
  messageCount: number;
}

interface DialogueMessage {
  id: number;
  content: string;
  authorEmail: string;
  authorName: string;
  createdAt: string;
  isExpert: boolean;
}

interface DialogueParticipant {
  email: string;
  name: string;
  role: 'ADMIN' | 'EXPERT' | 'USER';
  joinedAt: string;
}

export default function DialoguePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<DialogueRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filteredRooms, setFilteredRooms] = useState<DialogueRoom[]>([]);
  
  // 팝업 상태
  const [selectedRoom, setSelectedRoom] = useState<DialogueRoom | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [participants, setParticipants] = useState<DialogueParticipant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPublicDropdownOpen, setIsPublicDropdownOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedParticipantForSummary, setSelectedParticipantForSummary] = useState<string | null>(null);
  const [isParticipantDropdownOpen, setIsParticipantDropdownOpen] = useState(false);
  
  // 모달 위치 및 크기 상태
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [modalSize, setModalSize] = useState({ width: 1152, height: 640 }); // max-w-6xl = 1152px, h-[80vh] ≈ 640px
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, positionX: 0, positionY: 0 });
  
  // 메시지 영역 스크롤을 위한 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 메시지 삭제 함수
  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/dialogue/messages/${messageId}`), {
        method: 'DELETE',
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (response.ok) {
        // 메시지 목록에서 삭제된 메시지 제거
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        alert('메시지가 성공적으로 삭제되었습니다.');
      } else {
        throw new Error('메시지 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      alert('메시지 삭제에 실패했습니다.');
    }
  };

  // 메시지 삭제 권한 체크 함수
  const canDeleteMessage = (message: DialogueMessage) => {
    // 관리자는 모든 메시지 삭제 가능
    if (user?.role === 'ADMIN') {
      return true;
    }
    
    // 자신이 작성한 메시지가 아니면 삭제 불가
    if (message.authorEmail !== user?.email) {
      return false;
    }
    
    // 자신이 작성한 메시지 중에서 가장 최신 메시지인지 확인
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // 가장 최신 메시지가 자신이 작성한 메시지인 경우에만 삭제 가능
    return sortedMessages.length > 0 && sortedMessages[0].id === message.id;
  };

  // 대화방 참여자 체크 함수
  const isParticipant = () => {
    if (!user || !selectedRoom) {
      console.log('참여자 체크 실패: user 또는 selectedRoom이 없음');
      return false;
    }
    
    // 관리자는 모든 대화방에 참여자로 간주
    if (user.role === 'ADMIN') {
      console.log('관리자 권한으로 참여자 인정');
      return true;
    }
    
    // 대화방 작성자는 항상 참여자로 간주
    if (user.email === selectedRoom.authorEmail) {
      console.log('대화방 작성자로 참여자 인정');
      return true;
    }
    
    // 전문가인 경우 참여자로 간주 (임시 해결책)
    if (user.role === 'EXPERT') {
      console.log('전문가로 참여자 인정');
      return true;
    }
    
    // 참여자 목록이 비어있는 경우 (403 오류로 인해 로드되지 않았을 수 있음)
    if (participants.length === 0) {
      console.log('참여자 목록이 비어있음 - 403 오류로 인해 로드되지 않았을 수 있음');
      
      // 참여자 목록을 가져올 수 없는 경우, 대화방 작성자나 전문가가 아닌 경우에도
      // 일단 메시지 전송을 허용하고 서버에서 권한을 체크하도록 함
      console.log('참여자 목록 없음 - 서버에서 권한 체크하도록 허용');
      return true;
    }
    
    // 참여자 목록에서 현재 사용자 찾기
    const isInParticipants = participants.some(participant => participant.email === user.email);
    
    // 디버깅을 위한 로그
    console.log('참여자 체크 상세:', {
      userEmail: user.email,
      userRole: user.role,
      selectedRoomAuthor: selectedRoom.authorEmail,
      participantsCount: participants.length,
      participants: participants.map(p => ({ email: p.email, name: p.name })),
      isInParticipants,
      isAuthor: user.email === selectedRoom.authorEmail,
      isAdmin: (user.role as string) === 'ADMIN',
      isExpert: (user.role as string) === 'EXPERT'
    });
    
    return isInParticipants;
  };

  // 대화방 목록 불러오기
  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('user: ', user);
      console.log('authLoading: ', authLoading);
      console.log('isAuthenticated: ', isAuthenticated);

      // 인증 로딩 중이면 대기
      if (authLoading) {
        console.log('인증 로딩 중, 대기...');
        setLoading(false);
        return;
      }

      // 사용자 정보 검증
      if (!user?.email) {
        console.warn('사용자 이메일이 없습니다.');
        setRooms([]);
        setFilteredRooms([]);
        setLoading(false);
        return;
      }

      console.log('대화방 목록 요청:', { userEmail: user.email, userRole: user.role });

      const response = await fetch(getApiUrl('/api/dialogue/rooms'), {
        headers: {
          'User-Email': user.email,
          'User-Role': user.role || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('대화방 목록 응답:', data);
        
        // API 응답 구조 확인 및 처리
        let roomsData = [];
        if (Array.isArray(data)) {
          // 직접 배열로 응답하는 경우
          roomsData = data;
        } else if (data && Array.isArray(data.rooms)) {
          // { rooms: [...] } 형태로 응답하는 경우
          roomsData = data.rooms;
        } else if (data && Array.isArray(data.data)) {
          // { data: [...] } 형태로 응답하는 경우
          roomsData = data.data;
        }
        
        console.log('처리된 대화방 데이터:', roomsData);
        console.log('대화방 개수:', roomsData.length);
        
        // 각 대화방의 참여자 수 확인
        roomsData.forEach((room: any, index: number) => {
          console.log(`대화방 ${index} (${room.title}):`, {
            id: room.id,
            title: room.title,
            participantCount: room.participantCount,
            messageCount: room.messageCount
          });
        });
        
        setRooms(roomsData);
        setFilteredRooms(roomsData);
      } else {
        const errorData = await response.json();
        console.error('서버 오류 응답:', errorData);
        throw new Error(errorData.message || `서버 오류 (${response.status}): 대화방 목록을 불러올 수 없습니다.`);
      }
    } catch (error) {
      console.error('대화방 목록 불러오기 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setRooms([]);
      setFilteredRooms([]);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`대화방 목록을 불러오는데 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 메시지 새로고침 함수
  const refreshMessages = async () => {
    if (!selectedRoom || !user) return;
    
    try {
      const messagesResponse = await fetch(getApiUrl(`/api/dialogue/rooms/${selectedRoom.id}/messages`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (messagesResponse.ok) {
        const responseText = await messagesResponse.text();
        let messagesData;
        try {
          messagesData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('메시지 새로고침 JSON 파싱 오류:', parseError);
          return;
        }
        
        let messagesArray = [];
        if (Array.isArray(messagesData)) {
          messagesArray = messagesData;
        } else if (messagesData && Array.isArray(messagesData.messages)) {
          messagesArray = messagesData.messages;
        }
        
        // 메시지가 변경된 경우에만 업데이트
        setMessages(prevMessages => {
          if (prevMessages.length !== messagesArray.length) {
            console.log('메시지 새로고침: 메시지 수 변경됨', prevMessages.length, '->', messagesArray.length);
            return messagesArray;
          }
          return prevMessages;
        });
      }
    } catch (error) {
      console.error('메시지 새로고침 실패:', error);
    }
  };

  // 페이지 로드 시 데이터 불러오기 (인증 로딩 완료 후)
  useEffect(() => {
    if (!authLoading) {
      fetchRooms();
    }
  }, [authLoading]);

  // 선택된 대화방이 있을 때 주기적으로 메시지 새로고침
  useEffect(() => {
    if (!selectedRoom || !user) return;
    
    // 즉시 한 번 실행
    refreshMessages();
    
    // 5초마다 새로고침
    const interval = setInterval(refreshMessages, 5000);
    
    return () => clearInterval(interval);
  }, [selectedRoom, user]);

  // 메시지가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 페이지 포커스 시 데이터 새로고침 (대화방 생성 후 돌아올 때)
  useEffect(() => {
    const handleFocus = () => {
      console.log('페이지 포커스 감지, 데이터 새로고침');
      fetchRooms();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // URL 파라미터 변경 감지하여 데이터 새로고침
  useEffect(() => {
    if (!authLoading && searchParams.get('refresh') === 'true') {
      // 새로고침 파라미터가 있으면 데이터 다시 불러오기
      console.log('새로고침 파라미터 감지, 데이터 다시 불러오기');
      fetchRooms();
      // URL에서 refresh 파라미터 제거
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, authLoading]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isStatusDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.status-dropdown')) {
          setIsStatusDropdownOpen(false);
        }
      }
      if (isPublicDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.public-dropdown')) {
          setIsPublicDropdownOpen(false);
        }
      }
      if (isParticipantDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.participant-dropdown')) {
          setIsParticipantDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen, isPublicDropdownOpen, isParticipantDropdownOpen]);

  // 모달 열릴 때 중앙 위치로 초기화
  useEffect(() => {
    if (isPopupOpen) {
      const centerX = (window.innerWidth - modalSize.width) / 2;
      const centerY = (window.innerHeight - modalSize.height) / 2;
      setModalPosition({ x: Math.max(0, centerX), y: Math.max(0, centerY) });
    }
  }, [isPopupOpen, modalSize.width, modalSize.height]);

  // 드래그 및 리사이즈 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return;
    
    const handleDragMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // 화면 경계 체크
      const maxX = window.innerWidth - modalSize.width;
      const maxY = window.innerHeight - modalSize.height;
      
      setModalPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleDragStop = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragStop);
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragStop);
    };
  }, [isDragging, dragStart, modalSize.width, modalSize.height]);

  useEffect(() => {
    if (!isResizing) return;
    
    const handleResizeMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      const minWidth = 600;
      const minHeight = 400;
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight;
      
      const newSize = { ...modalSize };
      const newPosition = { ...modalPosition };
      
      // 가로 리사이즈
      if (resizeDirection === 'right' || resizeDirection === 'top-right' || resizeDirection === 'bottom-right') {
        // 우측에서 리사이즈: 너비만 증가
        newSize.width = Math.max(minWidth, Math.min(resizeStart.width + deltaX, maxWidth - resizeStart.positionX));
      } else if (resizeDirection === 'left' || resizeDirection === 'top-left' || resizeDirection === 'bottom-left') {
        // 좌측에서 리사이즈: 너비와 위치 모두 변경
        const newWidth = Math.max(minWidth, Math.min(resizeStart.width - deltaX, maxWidth - resizeStart.positionX));
        const widthDelta = resizeStart.width - newWidth;
        newSize.width = newWidth;
        newPosition.x = Math.max(0, Math.min(resizeStart.positionX + widthDelta, maxWidth - newWidth));
      }
      
      // 세로 리사이즈
      if (resizeDirection === 'bottom' || resizeDirection === 'bottom-left' || resizeDirection === 'bottom-right') {
        // 하단에서 리사이즈: 높이만 증가
        newSize.height = Math.max(minHeight, Math.min(resizeStart.height + deltaY, maxHeight - resizeStart.positionY));
      } else if (resizeDirection === 'top' || resizeDirection === 'top-left' || resizeDirection === 'top-right') {
        // 상단에서 리사이즈: 높이와 위치 모두 변경
        const newHeight = Math.max(minHeight, Math.min(resizeStart.height - deltaY, maxHeight - resizeStart.positionY));
        const heightDelta = resizeStart.height - newHeight;
        newSize.height = newHeight;
        newPosition.y = Math.max(0, Math.min(resizeStart.positionY + heightDelta, maxHeight - newHeight));
      }
      
      setModalSize(newSize);
      setModalPosition(newPosition);
    };

    const handleResizeStop = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // 포인터 이벤트 복원
      document.body.style.pointerEvents = '';
      if (modalRef.current) {
        (modalRef.current as HTMLElement).style.pointerEvents = '';
      }
      // 리사이즈 종료를 약간 지연시켜 이벤트 전파를 완전히 막음
      setTimeout(() => {
        setIsResizing(false);
      }, 50);
    };

    document.addEventListener('mousemove', handleResizeMove, { passive: false, capture: true });
    document.addEventListener('mouseup', handleResizeStop, { passive: false, capture: true });
    return () => {
      document.removeEventListener('mousemove', handleResizeMove, { capture: true } as any);
      document.removeEventListener('mouseup', handleResizeStop, { capture: true } as any);
    };
  }, [isResizing, resizeStart, resizeDirection, modalPosition.x, modalPosition.y]);

  // 인증 로딩 중
  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">사용자 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 로그인 체크
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
              <p className="text-gray-600 mb-6">대화방을 조회하려면 로그인해주세요.</p>
              <div className="flex justify-center">
                <button
                  onClick={() => window.location.href = '/login'}
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

  // 검색 및 필터링은 검색 버튼 클릭 시에만 실행됨

  const handleSearch = () => {
    performSearch(filterStatus, searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    // 자동 검색 제거 - 검색 버튼이나 엔터키로만 검색
  };

  // 실제 검색 로직을 별도 함수로 분리
  const performSearch = (status: string, term: string) => {
    // rooms가 배열인지 확인
    if (!Array.isArray(rooms)) {
      setFilteredRooms([]);
      return;
    }

    let filtered = rooms;

    // 상태 필터 적용
    if (status) {
      filtered = filtered.filter(room => room.status === status);
    }

    // 검색어 필터 적용
    if (term.trim()) {
      const searchLower = term.toLowerCase();
      filtered = filtered.filter(room => 
        room.title.toLowerCase().includes(searchLower) ||
        room.question.toLowerCase().includes(searchLower) ||
        room.authorEmail.toLowerCase().includes(searchLower)
      );
    }

    setFilteredRooms(filtered);
  };

  // 대화방 팝업 열기
  const handleOpenDialogue = async (room: DialogueRoom) => {
    if (!isAuthenticated) {
      alert('대화내용 조회 및 대화방 참여는 로그인이 필요합니다.');
      return;
    }
    
    setSelectedRoom(room);
    setIsPopupOpen(true);
    
    try {
      // 대화방 상세 정보 조회 (권한 체크 포함)
      const roomResponse = await fetch(getApiUrl(`/api/dialogue/rooms/${room.id}`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (!roomResponse.ok) {
        if (roomResponse.status === 403) {
          const errorData = await roomResponse.json();
          alert(errorData.error || '비공개 대화방은 관리자와 참여자만 볼 수 있습니다.');
          setSelectedRoom(null);
          setIsPopupOpen(false);
          return;
        } else {
          throw new Error('대화방 조회에 실패했습니다.');
        }
      }

      // 메시지 목록 불러오기
      const messagesResponse = await fetch(getApiUrl(`/api/dialogue/rooms/${room.id}/messages`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (messagesResponse.ok) {
        try {
          const responseText = await messagesResponse.text();
          console.log('메시지 목록 원본 응답:', responseText);
          
          // JSON 파싱 시도
          let messagesData;
          try {
            messagesData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('메시지 JSON 파싱 오류:', parseError);
            console.log('잘못된 메시지 JSON 응답:', responseText);
            setMessages([]);
            return;
          }
          
          // API 응답 구조 확인 및 메시지 배열 추출
          let messagesArray = [];
          if (Array.isArray(messagesData)) {
            messagesArray = messagesData;
          } else if (messagesData && Array.isArray(messagesData.messages)) {
            messagesArray = messagesData.messages;
          } else {
            console.log('예상하지 못한 메시지 응답 구조:', messagesData);
            messagesArray = [];
          }
          console.log('처리된 메시지 목록:', messagesArray);
          
          // 각 메시지의 createdAt 확인 및 수정
          const processedMessages = messagesArray.map((msg, index) => {
            console.log(`메시지 ${index} createdAt:`, msg.createdAt, '타입:', typeof msg.createdAt);
            
            if (!msg.createdAt) {
              console.log(`메시지 ${index} createdAt이 없어서 현재 시간으로 설정`);
              msg.createdAt = new Date().toISOString();
            }
            
            return msg;
          });
          
          console.log('처리된 메시지 목록 (createdAt 수정 후):', processedMessages);
          setMessages(processedMessages);
        } catch (error) {
          console.error('메시지 목록 처리 중 오류:', error);
          setMessages([]);
        }
      } else {
        console.error('메시지 목록 불러오기 실패');
        setMessages([]);
      }

      // 참여자 목록 불러오기
      console.log(`참여자 목록 요청: /api/dialogue/rooms/${room.id}/participants`);
      console.log('사용자 정보:', {
        email: user?.email,
        role: user?.role,
        isAuthenticated: isAuthenticated
      });
      console.log('선택된 대화방 정보:', {
        id: room.id,
        authorEmail: room.authorEmail,
        isPublic: room.isPublic
      });
      
      const participantsResponse = await fetch(getApiUrl(`/api/dialogue/rooms/${room.id}/participants`), {
        headers: {
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });
      
      console.log('참여자 목록 응답 상태:', {
        ok: participantsResponse.ok,
        status: participantsResponse.status,
        statusText: participantsResponse.statusText
      });

      if (participantsResponse.ok) {
        try {
          const responseText = await participantsResponse.text();
          console.log('참여자 목록 원본 응답:', responseText);
          
          // JSON 파싱 시도
          let participantsData;
          try {
            participantsData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            console.log('잘못된 JSON 응답:', responseText);
            setParticipants([]);
            return;
          }
          
          console.log('참여자 목록 API 응답:', participantsData);
          
          // API 응답 구조 확인 및 처리
          let participantsArray = [];
          if (Array.isArray(participantsData)) {
            // 직접 배열로 응답하는 경우
            participantsArray = participantsData;
          } else if (participantsData && Array.isArray(participantsData.participants)) {
            // { participants: [...] } 형태로 응답하는 경우
            participantsArray = participantsData.participants;
          } else if (participantsData && Array.isArray(participantsData.data)) {
            // { data: [...] } 형태로 응답하는 경우
            participantsArray = participantsData.data;
          }
          
          console.log('처리된 참여자 목록:', participantsArray);
          console.log('참여자 수:', participantsArray.length);
          
          setParticipants(participantsArray);
        } catch (error) {
          console.error('참여자 목록 처리 중 오류:', error);
          setParticipants([]);
        }
      } else {
        let errorData = null;
        try {
          errorData = await participantsResponse.json();
        } catch (e) {
          console.log('오류 응답을 JSON으로 파싱할 수 없음');
        }
        
        console.error('참여자 목록 불러오기 실패:', {
          status: participantsResponse.status,
          statusText: participantsResponse.statusText,
          error: errorData,
          url: getApiUrl(`/api/dialogue/rooms/${room.id}/participants`),
          headers: {
            'User-Email': user?.email || '',
            'User-Role': user?.role || '',
          }
        });
        
        // 403 오류인 경우 빈 배열로 설정하고 계속 진행
        if (participantsResponse.status === 403) {
          console.log('403 Forbidden - 권한 없음, 빈 참여자 목록으로 설정');
          setParticipants([]);
        } else {
          setParticipants([]);
        }
      }
    } catch (error) {
      console.error('대화방 데이터 불러오기 실패:', error);
      console.error('오류 상세:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      // JSON 파싱 오류인 경우 특별 처리
      if (error instanceof SyntaxError && (error as Error).message.includes('JSON')) {
        console.log('JSON 파싱 오류로 인한 실패 - 빈 데이터로 설정');
        setMessages([]);
        setParticipants([]);
      } else {
        alert('대화방 데이터를 불러오는데 실패했습니다.');
      }
    }
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;
    
    console.log('메시지 전송 시도 - 참여자 체크:', {
      userEmail: user?.email,
      userRole: user?.role,
      selectedRoomId: selectedRoom.id,
      selectedRoomAuthor: selectedRoom.authorEmail,
      participantsCount: participants.length,
      isParticipantResult: isParticipant()
    });
    
    // 참여자가 아닌 경우 메시지 전송 불가
    if (!isParticipant()) {
      console.log('참여자가 아님 - 메시지 전송 차단');
      alert('대화방 참여자만 메시지를 등록할 수 있습니다.');
      return;
    }
    
    console.log('참여자 확인됨 - 메시지 전송 진행');
    
    setSendingMessage(true);
    
    try {
      const requestUrl = getApiUrl(`/api/dialogue/rooms/${selectedRoom.id}/messages?authorEmail=${encodeURIComponent(user?.email || '')}`);
      console.log('메시지 전송 요청:', {
        url: requestUrl,
        userEmail: user?.email,
        userRole: user?.role,
        messageContent: newMessage
      });
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
        body: JSON.stringify({
        content: newMessage,
        }),
      });

      console.log('메시지 전송 응답:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('메시지 전송 성공 - 응답 데이터:', responseData);
        
        // 서버 응답에서 실제 메시지 데이터 추출
        let newMsg;
        if (responseData.messageData) {
          // messageData가 있는 경우 사용
          newMsg = responseData.messageData;
        } else if (responseData.allMessages && responseData.allMessages.length > 0) {
          // allMessages 배열에서 마지막 메시지 사용
          newMsg = responseData.allMessages[responseData.allMessages.length - 1];
        } else {
          // 직접 메시지 객체인 경우
          newMsg = responseData;
        }
        
        console.log('추출된 새 메시지:', newMsg);
        console.log('새 메시지 createdAt:', newMsg.createdAt);
        console.log('새 메시지 createdAt 타입:', typeof newMsg.createdAt);
        
        // createdAt이 없는 경우 현재 시간으로 설정
        if (!newMsg.createdAt) {
          newMsg.createdAt = new Date().toISOString();
          console.log('createdAt이 없어서 현재 시간으로 설정:', newMsg.createdAt);
        }
        
        // 메시지 즉시 추가
        setMessages(prev => {
          const updatedMessages = [...prev, newMsg];
          console.log('메시지 추가됨:', newMsg);
          console.log('전체 메시지 수:', updatedMessages.length);
          return updatedMessages;
        });
      setNewMessage('');
      } else {
        // 403 오류인 경우 특별 처리
        if (response.status === 403) {
          console.error('403 Forbidden - 메시지 전송 권한 없음');
          alert('이 대화방에서 메시지를 전송할 권한이 없습니다.');
        } else {
          let errorData = null;
          try {
            errorData = await response.json();
          } catch (e) {
            console.log('오류 응답을 JSON으로 파싱할 수 없음');
          }
          
          console.error('메시지 전송 실패:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          throw new Error(`메시지 전송에 실패했습니다. (${response.status})`);
        }
      }
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('권한이 없습니다')) {
      alert('메시지 전송에 실패했습니다.');
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // 팝업 닫기
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedRoom(null);
    setMessages([]);
    setParticipants([]);
    setNewMessage('');
    setIsStatusDropdownOpen(false);
    setIsPublicDropdownOpen(false);
  };

  // 상태 변경
  const handleStatusChange = async (newStatus: 'OPEN' | 'CLOSED') => {
    if (!selectedRoom) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/dialogue/rooms/${selectedRoom.id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `status=${newStatus}`,
      });

      if (response.ok) {
        const data = await response.json();
        
        // 선택된 방의 상태 업데이트
        setSelectedRoom(prev => prev ? { ...prev, status: newStatus } : null);
        
        // 목록의 해당 방 상태도 업데이트
        setRooms(prev => prev.map(room => 
          room.id === selectedRoom.id ? { ...room, status: newStatus } : room
        ));
        setFilteredRooms(prev => prev.map(room => 
          room.id === selectedRoom.id ? { ...room, status: newStatus } : room
        ));
        
        setIsStatusDropdownOpen(false);
        alert('상태가 성공적으로 변경되었습니다.');
      } else {
        throw new Error('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // 공개 여부 변경
  const handlePublicChange = async (isPublic: boolean) => {
    if (!selectedRoom) return;
    
    try {
      const response = await fetch(getApiUrl(`/api/dialogue/rooms/${selectedRoom.id}/public`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `isPublic=${isPublic}`,
      });

      if (response.ok) {
        const data = await response.json();
        
        // 선택된 방의 공개 여부 업데이트
        setSelectedRoom(prev => prev ? { ...prev, isPublic } : null);
        
        // 목록의 해당 방 공개 여부도 업데이트
        setRooms(prev => prev.map(room => 
          room.id === selectedRoom.id ? { ...room, isPublic } : room
        ));
        setFilteredRooms(prev => prev.map(room => 
          room.id === selectedRoom.id ? { ...room, isPublic } : room
        ));
        
        setIsPublicDropdownOpen(false);
        alert('공개 여부가 성공적으로 변경되었습니다.');
      } else {
        throw new Error('공개 여부 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('공개 여부 변경 실패:', error);
      alert('공개 여부 변경에 실패했습니다.');
    }
  };

  // 대화방 삭제
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    
    // 삭제 실행 알림
    alert(`"${selectedRoom.title}" 대화방을 삭제합니다.`);
    
    if (!confirm(`정말로 "${selectedRoom.title}" 대화방을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/dialogue/rooms/${selectedRoom.id}`), {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('대화방이 성공적으로 삭제되었습니다.');
        handleClosePopup();
        // 목록에서도 제거
        setRooms(prev => prev.filter(room => room.id !== selectedRoom.id));
        setFilteredRooms(prev => prev.filter(room => room.id !== selectedRoom.id));
      } else {
        throw new Error('대화방 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('대화방 삭제 실패:', error);
      alert('대화방 삭제에 실패했습니다.');
    }
  };

  // 드래그 핸들러
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, .status-dropdown, .public-dropdown')) {
      return; // 버튼이나 입력 필드 클릭 시 드래그 방지
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y
    });
  };

  // 리사이즈 핸들러
  const handleResizeStart = (e: React.MouseEvent, direction: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height,
      positionX: modalPosition.x,
      positionY: modalPosition.y
    });
    // 리사이즈 시작 시 배경 클릭 방지
    document.body.style.pointerEvents = 'none';
    if (modalRef.current) {
      (modalRef.current as HTMLElement).style.pointerEvents = 'auto';
    }
  };

  // 모달 닫기 핸들러 - 리사이즈 중일 때는 닫지 않음
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    // 리사이즈나 드래그 중일 때는 모달을 닫지 않음
    if (isResizing || isDragging) {
      return;
    }
    // 리사이즈 핸들 영역 클릭 시에도 모달을 닫지 않음
    const target = e.target as HTMLElement;
    if (target.closest('.resize-handle')) {
      return;
    }
    handleClosePopup();
  };

  // 대화방 내용 요약 생성
  const handleGenerateSummary = async () => {
    if (!selectedRoom || messages.length === 0) {
      alert('요약할 메시지가 없습니다.');
      return;
    }

    if (!selectedParticipantForSummary) {
      alert('요약할 참여자를 선택해주세요.');
      return;
    }

    setIsGeneratingSummary(true);
    setSummary('');

    try {
      const response = await fetch(getApiUrl(`/api/dialogue/rooms/${selectedRoom.id}/summary?participantEmail=${encodeURIComponent(selectedParticipantForSummary)}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Email': user?.email || '',
          'User-Role': user?.role || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary || '요약을 생성할 수 없습니다.');
        setIsSummaryModalOpen(true);
      } else {
        const errorData = await response.json().catch(() => ({ message: '요약 생성에 실패했습니다.' }));
        alert(errorData.message || '요약 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('요약 생성 실패:', error);
      alert('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return '진행중';
      case 'CLOSED': return '종료';
      default: return '진행중';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">대화방 목록을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-28">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-rose-800 to-rose-600 text-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f6,#1d4ed8)] opacity-30">
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M0 32V.5H32" fill="none" stroke="rgba(255,255,255,0.1)"></path>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)"></rect>
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-rose-500 to-transparent"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <FiMessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">대화/토론방</h1>
            </div>
            <p className="text-lg text-blue-50 max-w-[1150px] text-right">
              기술경영, 연구 기획 및 관리와 관련된 다양한 주제에 대해<br/>
              해당 분야의 경험과 지식을 갖춘 MOT 전문가와 대화할 수 있는 열린 대화방입니다.
            </p>
          </div>
        </div>

        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* 검색 및 필터 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-4">
                {/* 상태 선택 (width 30% 줄임) */}
                <div className="w-1/5">
                  <select
                    value={filterStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">모든 상태</option>
                    <option value="OPEN">진행중</option>
                    <option value="CLOSED">종료</option>
                  </select>
                </div>
                
                {/* 검색 입력과 버튼을 중앙정렬 */}
                <div className="flex-1 flex justify-center items-center gap-4">
                  <div className="relative w-2/5">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="대화방 검색..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    검색
                  </button>
                </div>
                
                {/* 대화방 생성 버튼 (오른쪽 정렬) */}
                <div className="w-1/5 flex justify-end">
                  {isAuthenticated && (
                    <Link
                      href="/dialogue/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      대화방 생성
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* 대화방 목록 */}
            <div className="space-y-6">
              {!Array.isArray(filteredRooms) || filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-gray-500 mb-6">다른 검색어나 필터를 시도해보세요.</p>
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                            {getStatusText(room.status)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            room.isPublic 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {room.isPublic ? '공개' : '비공개'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleOpenDialogue(room)}
                          className="block w-full text-left"
                        >
                          <h3 
                            className="text-lg font-semibold transition-colors mb-2 text-gray-900 hover:text-blue-600"
                            title={!room.isPublic ? '비공개 대화방은 관리자와 참여자만 볼 수 있습니다.' : ''}
                          >
                            {room.title}
                          </h3>
                        </button>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {room.question}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <FiUser className="w-4 h-4 mr-1" />
                              <span>{room.authorEmail}</span>
                            </div>
                            <div className="flex items-center">
                              <FiCalendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(room.createdAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <FiUsers className="w-4 h-4 mr-1" />
                              <span>{room.participantCount}명 참여</span>
                            </div>
                            <div className="flex items-center">
                              <FiMessageSquare className="w-4 h-4 mr-1" />
                              <span>{room.messageCount}개 메시지</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 대화방 팝업 */}
      {isPopupOpen && selectedRoom && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50" 
          onClick={handleModalBackdropClick}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl flex flex-col absolute"
            style={{
              left: `${modalPosition.x}px`,
              top: `${modalPosition.y}px`,
              width: `${modalSize.width}px`,
              height: `${modalSize.height}px`,
              cursor: isDragging ? 'move' : 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 팝업 헤더 - 드래그 핸들 */}
            <div
              className="flex items-center justify-between p-6 border-b border-gray-200 cursor-move select-none"
              onMouseDown={handleDragStart}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiMessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedRoom.title}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoom.status)}`}>
                      {getStatusText(selectedRoom.status)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedRoom.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRoom.isPublic ? '공개' : '비공개'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClosePopup}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 대화방 내용 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 메시지 영역 */}
              <div className="flex-1 flex flex-col">
                {/* 주제/질문 */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">주제/질문</h3>
                    <div className="flex items-center gap-2">
                      {/* 참여자 선택 드롭다운 */}
                      <div className="relative participant-dropdown">
                        <button
                          type="button"
                          onClick={() => setIsParticipantDropdownOpen(!isParticipantDropdownOpen)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          <span className="text-gray-700">
                            {selectedParticipantForSummary 
                              ? participants.find(p => p.email === selectedParticipantForSummary)?.name || '참여자 선택'
                              : '참여자 선택'}
                          </span>
                          <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isParticipantDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isParticipantDropdownOpen && (
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {participants.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-gray-500">참여자가 없습니다</div>
                            ) : (
                              participants.map((participant) => (
                                <button
                                  key={participant.email}
                                  type="button"
                                  onClick={() => {
                                    setSelectedParticipantForSummary(participant.email);
                                    setIsParticipantDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                    selectedParticipantForSummary === participant.email ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      participant.role === 'ADMIN' 
                                        ? 'bg-red-100 text-red-600'
                                        : participant.role === 'EXPERT'
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-blue-100 text-blue-600'
                                    }`}>
                                      {participant.role === 'ADMIN' ? '관리자' : participant.role === 'EXPERT' ? '전문가' : '회원'}
                                    </span>
                                    <span>{participant.name}</span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary || messages.length === 0 || !selectedParticipantForSummary}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={selectedParticipantForSummary ? "선택된 참여자의 대화 요약" : "참여자를 선택해주세요"}
                      >
                        <FiFileText className="w-4 h-4" />
                        {isGeneratingSummary ? '요약 중...' : '요약 보기'}
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-900">{selectedRoom.question}</p>
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <span>작성자: {selectedRoom.authorEmail}</span>
                    <span>생성일: {formatDate(selectedRoom.createdAt)}</span>
                  </div>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.authorEmail === user?.email ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${message.authorEmail === user?.email ? 'order-2' : 'order-1'}`}>
                        <div className={`rounded-lg px-4 py-2 ${
                          message.authorEmail === user?.email
                            ? 'bg-blue-600 text-white'
                            : message.isExpert
                            ? 'bg-green-100 text-green-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                              {message.authorName}
                              {message.isExpert && <span className="ml-1 text-green-600">(전문가)</span>}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs opacity-75">
                                {message.createdAt ? formatDate(message.createdAt) : '날짜 없음'}
                              </span>
                              {/* 삭제 버튼 - 관리자이거나 최신 메시지 작성자인 경우에만 표시 */}
                              {canDeleteMessage(message) && (
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                                  title="메시지 삭제"
                                >
                                  <FiTrash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* 스크롤 자동 이동을 위한 빈 div */}
                  <div ref={messagesEndRef} />
                </div>

                {/* 메시지 입력 - 참여자만 표시 */}
                {isParticipant() && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            전송중
                          </div>
                        ) : (
                          <FiSend className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 참여자가 아닌 경우 안내 메시지 */}
                {!isParticipant() && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="text-center text-gray-500">
                      <div className="flex items-center justify-center mb-2">
                        <FiLock className="w-5 h-5 mr-2" />
                        <span className="font-medium">대화방 참여자만 메시지를 등록할 수 있습니다</span>
                      </div>
                      <p className="text-sm">이 대화방에 참여하려면 관리자에게 문의하세요.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 참여자 목록 */}
              <div className="w-[230px] border-l border-gray-200 bg-gray-50 flex flex-col overflow-visible">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">참여자 ({participants.length}명)</h3>
                </div>
                <div className="p-4 space-y-3 flex-1 max-h-[50%] overflow-y-auto">
                  {participants.map((participant) => (
                    <div key={participant.email} className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded-full flex items-center justify-center text-xs font-medium ${
                        participant.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-600'
                          : participant.role === 'EXPERT'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {participant.role === 'ADMIN' ? '관리자' : participant.role === 'EXPERT' ? '전문가' : '회원'}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          participant.role === 'ADMIN' 
                            ? 'text-red-700'
                            : participant.role === 'EXPERT'
                            ? 'text-green-700'
                            : 'text-gray-900'
                        }`}>
                          {participant.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 관리자용 상태 변경 영역 */}
                {user?.role === 'ADMIN' && (
                  <div className="p-4 border-t border-gray-200 bg-white overflow-visible">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">대화방 관리</h4>
                        <button
                          onClick={() => {
                            if (selectedRoom) {
                              window.location.href = `/dialogue/create?roomId=${selectedRoom.id}`;
                            }
                          }}
                          className="inline-flex items-center px-3 py-2 border border-emerald-300 shadow-sm text-sm leading-4 font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                          title="대화방 수정"
                        >
                          <FiSettings className="w-4 h-4 mr-1" />
                          대화방 수정
                        </button>
                      </div>
                      
                      {/* 상태 관리 */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 min-w-[60px]">상태</span>
                        <div className="relative status-dropdown flex-1">
                          <button
                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border transition-colors ${
                              selectedRoom.status === 'OPEN' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                selectedRoom.status === 'OPEN' ? 'bg-green-500' : 'bg-gray-500'
                              }`}></div>
                              <span>{getStatusText(selectedRoom.status)}</span>
                            </div>
                            <FiChevronDown className={`w-4 h-4 transition-transform ${
                              isStatusDropdownOpen ? 'rotate-180' : ''
                            }`} />
                          </button>
                          
                          {isStatusDropdownOpen && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-full min-w-[120px]">
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusChange('OPEN')}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center ${
                                    selectedRoom.status === 'OPEN' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    selectedRoom.status === 'OPEN' ? 'bg-green-500' : 'bg-gray-300'
                                  }`}></div>
                                  <span>진행중</span>
                                  {selectedRoom.status === 'OPEN' && (
                                    <FiSettings className="w-4 h-4 ml-auto text-green-600" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleStatusChange('CLOSED')}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center ${
                                    selectedRoom.status === 'CLOSED' ? 'bg-gray-50 text-gray-700' : 'text-gray-700'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    selectedRoom.status === 'CLOSED' ? 'bg-gray-500' : 'bg-gray-300'
                                  }`}></div>
                                  <span>종료</span>
                                  {selectedRoom.status === 'CLOSED' && (
                                    <FiSettings className="w-4 h-4 ml-auto text-gray-600" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 공개 여부 관리 */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 min-w-[60px]">공개여부</span>
                        <div className="relative public-dropdown flex-1">
                          <button
                            onClick={() => setIsPublicDropdownOpen(!isPublicDropdownOpen)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border transition-colors ${
                              selectedRoom.isPublic 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                selectedRoom.isPublic ? 'bg-green-500' : 'bg-gray-500'
                              }`}></div>
                              <span>{selectedRoom.isPublic ? '공개' : '비공개'}</span>
                            </div>
                            <FiChevronDown className={`w-4 h-4 transition-transform ${
                              isPublicDropdownOpen ? 'rotate-180' : ''
                            }`} />
                          </button>
                          
                          {isPublicDropdownOpen && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-full min-w-[150px]">
                              <div className="py-1">
                                <button
                                  onClick={() => handlePublicChange(true)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center ${
                                    selectedRoom.isPublic ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    selectedRoom.isPublic ? 'bg-green-500' : 'bg-gray-300'
                                  }`}></div>
                                  <span>공개</span>
                                  {selectedRoom.isPublic && (
                                    <FiSettings className="w-4 h-4 ml-auto text-green-600" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handlePublicChange(false)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center ${
                                    !selectedRoom.isPublic ? 'bg-gray-50 text-gray-700' : 'text-gray-700'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full mr-2 ${
                                    !selectedRoom.isPublic ? 'bg-gray-500' : 'bg-gray-300'
                                  }`}></div>
                                  <span>비공개</span>
                                  {!selectedRoom.isPublic && (
                                    <FiSettings className="w-4 h-4 ml-auto text-gray-600" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 현재 설정 요약 */}
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          현재 설정: <span className="font-medium">{getStatusText(selectedRoom.status)}</span> / 
                          <span className="font-medium ml-1">{selectedRoom.isPublic ? '공개' : '비공개'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 리사이즈 핸들들 */}
            {/* 상단 가장자리 - 세로만 조절 */}
            <div
              className="resize-handle absolute top-0 left-0 w-full h-2 cursor-ns-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'top')}
            />
            
            {/* 하단 가장자리 - 세로만 조절 */}
            <div
              className="resize-handle absolute bottom-0 left-0 w-full h-2 cursor-ns-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
            />
            
            {/* 좌측 가장자리 - 가로만 조절 */}
            <div
              className="resize-handle absolute top-0 left-0 w-2 h-full cursor-ew-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            />
            
            {/* 우측 가장자리 - 가로만 조절 */}
            <div
              className="resize-handle absolute top-0 right-0 w-2 h-full cursor-ew-resize z-10"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
            
            {/* 좌측 상단 모서리 - 가로, 세로 모두 조절 */}
            <div
              className="resize-handle absolute top-0 left-0 w-8 h-8 cursor-nwse-resize z-10 flex items-start justify-start"
              onMouseDown={(e) => handleResizeStart(e, 'top-left')}
            >
              <div className="w-0 h-0 border-r-[16px] border-r-transparent border-t-[16px] border-t-blue-500" />
            </div>
            
            {/* 우측 상단 모서리 - 가로, 세로 모두 조절 */}
            <div
              className="resize-handle absolute top-0 right-0 w-8 h-8 cursor-nesw-resize z-10 flex items-start justify-end"
              onMouseDown={(e) => handleResizeStart(e, 'top-right')}
            >
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-t-[16px] border-t-blue-500" />
            </div>
            
            {/* 좌측 하단 모서리 - 가로, 세로 모두 조절 */}
            <div
              className="resize-handle absolute bottom-0 left-0 w-8 h-8 cursor-nesw-resize z-10 flex items-end justify-start"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
            >
              <div className="w-0 h-0 border-r-[16px] border-r-transparent border-b-[16px] border-b-blue-500" />
            </div>
            
            {/* 우측 하단 모서리 - 가로, 세로 모두 조절 */}
            <div
              className="resize-handle absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-10 flex items-end justify-end"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
            >
              <div className="w-0 h-0 border-l-[16px] border-l-transparent border-b-[16px] border-b-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* 요약 모달 */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">대화방 요약</h2>
                  <p className="text-sm text-gray-500 mt-1">{selectedRoom?.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 요약 내용 */}
            <div className="flex-1 overflow-y-auto p-6">
              {summary ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>요약을 생성하는 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
