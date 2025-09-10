'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiUser, FiLogOut, FiKey, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [showPwModal, setShowPwModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navigation = [
    { name: 'Library', href: '/library' },
    { name: 'Learning', href: '/learning' },
    { name: 'Q&A', href: '/qna' },
    { name: 'Dialogue', href: '/dialogue' },
    { name: 'Agora', href: '/opinions' },
    // { name: 'Community', href: '/news' }, // Community 메뉴 숨김
    { name: 'Expert', href: '/expert' },
  ];

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      {/* 상단 유틸리티 메뉴 */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end h-8">
            <div className="flex items-center space-x-6 text-xs text-gray-600">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-3 h-3" />
                    <span>{user.name}</span>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="hover:text-gray-900 transition-colors">
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={() => setShowPwModal(true)}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <FiKey className="w-3 h-3" />
                    <span>비번 재설정</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <FiLogOut className="w-3 h-3" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-gray-900 transition-colors">
                    로그인
                  </Link>
                  <Link href="/signup" className="hover:text-gray-900 transition-colors">
                    회원가입
                  </Link>
                </>
              )}

              <Link href="/en" className="hover:text-gray-900 transition-colors">
                ENGLISH
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 네비게이션 바 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* 로고 영역 */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900">MOT Club</span>
            </Link>
          </div>

          {/* 데스크톱 메인 메뉴 */}
          <div className="hidden md:flex items-center space-x-12">
            {navigation.map((item, index) => {
              // Expert 메뉴는 로그인된 상태에서만 접근 가능
              if (item.name === 'Expert') {
                return isAuthenticated ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-900 hover:text-blue-600 px-4 py-2 text-lg font-medium transition-colors duration-200 relative"
                  >
                    {item.name}
                    {index < navigation.length - 1 && (
                      <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-300">·</span>
                    )}
                  </Link>
                ) : (
                  <div key={item.name} className="relative group">
                    <span className="text-gray-400 px-4 py-2 text-lg font-medium cursor-not-allowed relative">
                      {item.name}
                      {index < navigation.length - 1 && (
                        <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-300">·</span>
                      )}
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      로그인이 필요합니다
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-900 hover:text-blue-600 px-4 py-2 text-lg font-medium transition-colors duration-200 relative"
                >
                  {item.name}
                  {index < navigation.length - 1 && (
                    <span className="absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-300">·</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* 우측 아이콘 영역 */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <FiSearch className="w-5 h-5" />
            </button>
            
            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => {
              // Expert 메뉴는 로그인된 상태에서만 접근 가능
              if (item.name === 'Expert') {
                return isAuthenticated ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <div key={item.name} className="relative group">
                    <span className="text-gray-400 block px-3 py-2 rounded-md text-base font-medium cursor-not-allowed">
                      {item.name}
                    </span>
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      로그인이 필요합니다
                      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 비밀번호 재설정 팝업 */}
      {showPwModal && user && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[360px] max-w-full">
            <h2 className="text-xl font-bold mb-4">비밀번호 재설정</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement).value;
                const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;
                if (!currentPassword || !newPassword || !confirmPassword) {
                  alert('모든 항목을 입력하세요.');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  alert('새 비밀번호가 일치하지 않습니다.');
                  return;
                }
                if (newPassword.length < 8) {
                  alert('비밀번호는 8자 이상이어야 합니다.');
                  return;
                }
                try {
                  const res = await fetch(`http://mot.erns.co.kr/api/users/${user.id}/password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword, newPassword }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.message || '비밀번호 변경에 실패했습니다.');
                  alert('비밀번호가 성공적으로 변경되었습니다.');
                  setShowPwModal(false);
                } catch (err: any) {
                  alert(err.message);
                }
              }}
              className="space-y-4"
            >
              <div className="mb-2">
                <label className="block mb-1 font-medium">이메일</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700">{user.email}</div>
              </div>
              <div>
                <label className="block mb-1 font-medium">새 비밀번호</label>
                <input type="password" name="newPassword" className="w-full border rounded px-3 py-2" required />
                <div className="mt-1 text-xs text-gray-500">비밀번호는 8자 이상, 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.</div>
              </div>
              <div>
                <label className="block mb-1 font-medium">새 비밀번호 확인</label>
                <input type="password" name="confirmPassword" className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">저장</button>
                <button type="button" onClick={() => setShowPwModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">취소</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
