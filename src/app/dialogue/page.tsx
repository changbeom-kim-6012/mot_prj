'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiMessageSquare, FiCalendar, FiUser, FiUsers, FiX, FiSend, FiLock, FiChevronDown, FiSettings, FiTrash2 } from 'react-icons/fi';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/dateUtils';

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
  const { user, isAuthenticated } = useAuth();
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

  // 메시지 삭제 함수
  const handleDeleteMessage = async (messageId: number) => {
    if (!confirm('정말로 이 메시지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`http://121.140.143.9:8082/api/dialogue/messages/${messageId}`, {
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
    if (!user || !selectedRoom) return false;
    
    // 관리자는 모든 대화방에 참여자로 간주
    if (user.role === 'ADMIN') return true;
    
    // 참여자 목록에서 현재 사용자 찾기
    const isInParticipants = participants.some(participant => participant.email === user.email);
    
    // 디버깅을 위한 로그
    console.log('참여자 체크:', {
      userEmail: user.email,
      participants: participants.map(p => p.email),
      isInParticipants
    });
    
    return isInParticipants;
  };

  // 더미 데이터
  const dummyRooms: DialogueRoom[] = [
    {
      id: 1,
      title: "R&D 프로젝트 관리 방법론에 대한 질문",
      question: "현재 진행 중인 R&D 프로젝트의 효율적인 관리 방법과 리스크 관리 전략에 대해 전문가들의 의견을 듣고 싶습니다.",
      authorEmail: "user1@example.com",
      createdAt: "2024-01-15T10:30:00Z",
      isPublic: true,
      status: 'OPEN',
      participantCount: 8,
      messageCount: 15
    },
    {
      id: 2,
      title: "기술사업화 전략 수립 가이드",
      question: "연구개발 결과물의 성공적인 기술사업화를 위한 전략적 접근 방법과 사례 분석을 공유해주세요.",
      authorEmail: "user2@example.com",
      createdAt: "2024-01-14T14:20:00Z",
      isPublic: false,
      status: 'OPEN',
      participantCount: 5,
      messageCount: 12
    },
    {
      id: 3,
      title: "MOT 교육과정 설계 방안",
      question: "기업 내 MOT(Management of Technology) 교육과정의 효과적인 설계와 운영 방안에 대해 논의해보겠습니다.",
      authorEmail: "user3@example.com",
      createdAt: "2024-01-13T09:15:00Z",
      isPublic: true,
      status: 'CLOSED',
      participantCount: 12,
      messageCount: 28
    },
    {
      id: 4,
      title: "혁신기술 투자 의사결정 프레임워크",
      question: "신기술 투자 시 활용할 수 있는 의사결정 프레임워크와 평가 지표에 대한 전문가들의 경험을 공유해주세요.",
      authorEmail: "user4@example.com",
      createdAt: "2024-01-12T16:45:00Z",
      isPublic: true,
      status: 'OPEN',
      participantCount: 6,
      messageCount: 9
    },
    {
      id: 5,
      title: "기업 기술전략 수립 프로세스",
      question: "기업의 기술전략 수립 시 고려해야 할 핵심 요소들과 프로세스 개선 방안에 대해 토론해보겠습니다.",
      authorEmail: "user5@example.com",
      createdAt: "2024-01-11T11:30:00Z",
      isPublic: false,
      status: 'CLOSED',
      participantCount: 10,
      messageCount: 22
    }
  ];

  // 페이지 로드 시 더미 데이터 설정
  useEffect(() => {
    // 로딩 시뮬레이션
    setTimeout(() => {
      setRooms(dummyRooms);
      setFilteredRooms(dummyRooms);
      setLoading(false);
    }, 1000);
  }, []);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusDropdownOpen, isPublicDropdownOpen]);

  // 검색 및 필터링은 검색 버튼 클릭 시에만 실행됨

  const handleSearch = () => {
    performSearch(filterStatus, searchTerm);
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
    // 상태 필터 변경 시 즉시 검색 실행
    performSearch(status, searchTerm);
  };

  // 실제 검색 로직을 별도 함수로 분리
  const performSearch = (status: string, term: string) => {
    let filtered = dummyRooms;

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
  const handleOpenDialogue = (room: DialogueRoom) => {
    if (!isAuthenticated) {
      alert('대화내용 조회 및 대화방 참여는 로그인이 필요합니다.');
      return;
    }
    
    // 비공개 대화방인 경우 참여자만 조회 가능
    if (!room.isPublic) {
      return; // 클릭해도 아무 동작하지 않음
    }
    
    setSelectedRoom(room);
    setIsPopupOpen(true);
    
    // 더미 메시지 데이터 로드
    const dummyMessages: DialogueMessage[] = [
      {
        id: 1,
        content: "안녕하세요! R&D 프로젝트 관리에 대해 궁금한 점이 있어서 질문드립니다.",
        authorEmail: "user1@example.com",
        authorName: "질문자",
        createdAt: "2024-01-15T10:30:00Z",
        isExpert: false
      },
      {
        id: 2,
        content: "안녕하세요! 좋은 질문이네요. R&D 프로젝트 관리에서 가장 중요한 것은 체계적인 계획 수립입니다.",
        authorEmail: "expert1@example.com",
        authorName: "김전문가",
        createdAt: "2024-01-15T10:35:00Z",
        isExpert: true
      },
      {
        id: 3,
        content: "저도 동의합니다. 특히 리스크 관리 측면에서 프로젝트 초기 단계에서 예상되는 문제점들을 미리 파악하는 것이 중요해요.",
        authorEmail: "expert2@example.com",
        authorName: "이박사",
        createdAt: "2024-01-15T10:40:00Z",
        isExpert: true
      },
      {
        id: 4,
        content: "구체적으로 어떤 리스크 관리 도구를 사용하시나요?",
        authorEmail: "user1@example.com",
        authorName: "질문자",
        createdAt: "2024-01-15T10:45:00Z",
        isExpert: false
      },
      {
        id: 5,
        content: "저희 회사에서는 FMEA(Failure Mode and Effects Analysis)를 주로 사용합니다. 이 방법론에 대해 설명드릴까요?",
        authorEmail: "expert1@example.com",
        authorName: "김전문가",
        createdAt: "2024-01-15T10:50:00Z",
        isExpert: true
      }
    ];
    
    const dummyParticipants: DialogueParticipant[] = [
      {
        email: "expert1@example.com",
        name: "김전문가",
        role: "EXPERT",
        joinedAt: "2024-01-15T10:30:00Z"
      },
      {
        email: "expert2@example.com",
        name: "이박사",
        role: "EXPERT",
        joinedAt: "2024-01-15T10:30:00Z"
      },
      {
        email: "user1@example.com",
        name: "질문자",
        role: "USER",
        joinedAt: "2024-01-15T10:30:00Z"
      }
    ];

    // 테스트를 위해 현재 사용자가 참여자가 아닌 경우를 시뮬레이션
    // 실제 환경에서는 백엔드에서 참여자 목록을 가져와야 함
    // 현재 사용자가 참여자 목록에 있으면 제거 (테스트용)
    const filteredParticipants = dummyParticipants.filter(p => p.email !== user?.email);

    // 참여자 체크를 위해 현재 사용자가 참여자 목록에 있는지 확인
    // 실제 환경에서는 백엔드에서 참여자 목록을 가져와야 함
    console.log('더미 참여자 목록:', dummyParticipants.map(p => p.email));
    console.log('필터링된 참여자 목록:', filteredParticipants.map(p => p.email));
    console.log('현재 사용자:', user?.email);
    
    setMessages(dummyMessages);
    setParticipants(filteredParticipants);
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;
    
    // 참여자가 아닌 경우 메시지 전송 불가
    if (!isParticipant()) {
      alert('대화방 참여자만 메시지를 등록할 수 있습니다.');
      return;
    }
    
    setSendingMessage(true);
    
    try {
      // 더미 메시지 전송 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMsg: DialogueMessage = {
        id: messages.length + 1,
        content: newMessage,
        authorEmail: user?.email || 'unknown@example.com',
        authorName: user?.name || '사용자',
        createdAt: new Date().toISOString(),
        isExpert: user?.role === 'EXPERT'
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      alert('메시지 전송에 실패했습니다.');
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
      const response = await fetch(`http://121.140.143.9:8082/api/dialogue/rooms/${selectedRoom.id}/status`, {
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
      const response = await fetch(`http://121.140.143.9:8082/api/dialogue/rooms/${selectedRoom.id}/public`, {
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
      const response = await fetch(`http://121.140.143.9:8082/api/dialogue/rooms/${selectedRoom.id}`, {
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
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-800 to-blue-900 text-white">
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <FiMessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Dialogue</h1>
            </div>
            <p className="text-lg text-blue-50 max-w-[1150px] text-right">
              질문과 대답을 대화식으로 하는 공간<br/>
              전문가들과 실시간으로 소통하고 답변을 받아보세요.
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
              {filteredRooms.length === 0 ? (
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
                            className={`text-lg font-semibold transition-colors mb-2 ${
                              !room.isPublic 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-gray-900 hover:text-blue-600'
                            }`}
                            title={!room.isPublic ? '비공개 대화방으로 참여자만 입장이 가능합니다.' : ''}
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

            {/* 더미 데이터 안내 */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <FiMessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm">
                  현재 더미 데이터를 사용하여 표시되고 있습니다. 실제 서버 연동 시 실제 데이터로 교체됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 대화방 팝업 */}
      {isPopupOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
            {/* 팝업 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">주제/질문</h3>
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
                                {formatDate(message.createdAt)}
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
              <div className="w-96 border-l border-gray-200 bg-gray-50 flex flex-col overflow-visible">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">참여자 ({participants.length}명)</h3>
                </div>
                <div className="p-4 space-y-3 flex-1">
                  {participants.map((participant) => (
                    <div key={participant.email} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        participant.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-600'
                          : participant.role === 'EXPERT'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {participant.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                        <p className="text-xs text-gray-500">{participant.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        participant.role === 'ADMIN'
                          ? 'bg-red-100 text-red-800'
                          : participant.role === 'EXPERT'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {participant.role === 'ADMIN' ? '관리자' : participant.role === 'EXPERT' ? '전문가' : '사용자'}
                      </span>
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
                          onClick={handleDeleteRoom}
                          className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          title="대화방 삭제"
                        >
                          <FiTrash2 className="w-4 h-4 mr-1" />
                          대화방 삭제
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
          </div>
        </div>
      )}
    </main>
  );
}
