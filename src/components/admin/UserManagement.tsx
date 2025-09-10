'use client';

import { useState, useEffect } from 'react';

// 날짜 포맷팅 함수 (yy.mm.dd 형식)
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const year = date.getFullYear().toString().slice(-2); // 마지막 2자리
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}.${month}.${day}`;
  } catch (error) {
    return '-';
  }
};

// 실제 User 모델에 activityLevel 추가
interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'EXPERT';
  activityLevel: number;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

// 추가: 일괄등록용 타입
interface BulkUser {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'EXPERT';
  activityLevel: number;
  remarks: string;
  password: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  // 수정 필드를 객체로 관리
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  // 추가: 신규 등록 행 상태
  const [addingUser, setAddingUser] = useState<Partial<User> | null>(null);
  // 추가: 일괄등록 팝업 상태
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkUsers, setBulkUsers] = useState<BulkUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://motclub.co.kr/api/users');
        if (!response.ok) {
          throw new Error('사용자 목록을 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        
        // 디버깅: 받은 데이터 구조 확인
        console.log('=== 사용자 데이터 디버깅 ===');
        console.log('전체 데이터:', data);
        if (Array.isArray(data) && data.length > 0) {
          console.log('첫 번째 사용자 데이터:', data[0]);
          console.log('첫 번째 사용자의 createdAt:', data[0].createdAt);
          console.log('첫 번째 사용자의 updatedAt:', data[0].updatedAt);
          console.log('createdAt 타입:', typeof data[0].createdAt);
          console.log('updatedAt 타입:', typeof data[0].updatedAt);
        }
        console.log('========================');
        
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setEditingUser({ ...user });
  };

  const handleCancelClick = () => {
    setEditingUserId(null);
    setEditingUser(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!editingUser) return;
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  };

  const handleSaveClick = async (userId: number) => {
    if (!editingUser) return;

    try {
      const response = await fetch(`http://motclub.co.kr/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      if (!response.ok) {
        throw new Error('사용자 정보 업데이트에 실패했습니다.');
      }
      
      const updatedUser = await response.json();
      
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      handleCancelClick();

    } catch (err: any) {
      setError(err.message);
    }
  };

  // 신규 등록 행 입력 핸들러
  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!addingUser) return;
    const { name, value } = e.target;
    let newUser = { ...addingUser, [name]: value };
    // 이메일 입력 시 password는 내부적으로만 사용, 상태에는 저장하지 않음
    setAddingUser(newUser);
  };

  // 신규 등록 저장/취소
  const handleAddSave = async () => {
    if (!addingUser?.name || !addingUser?.email || !addingUser?.role || !addingUser?.activityLevel) return;
    // 비밀번호는 항상 '12345'로 자동 설정
    const password = '12345';
    try {
      const response = await fetch('http://motclub.co.kr/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addingUser, password }),
      });
      if (!response.ok) throw new Error('회원 등록에 실패했습니다.');
      const newUser = await response.json();
      setUsers([newUser, ...users]);
      setAddingUser(null);
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleAddCancel = () => setAddingUser(null);

  // 일괄등록 팝업 관련
  const handleBulkAddRow = () => {
    setBulkUsers([...bulkUsers, { name: '', email: '', role: 'USER', activityLevel: 1, remarks: '', password: '' }]);
  };
  const handleBulkInputChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBulkUsers(bulkUsers.map((u, i) => {
      if (i !== idx) return u;
      let newUser = { ...u, [name]: value };
      if (name === 'email') {
        const atIdx = value.indexOf('@');
        if (atIdx > 0) newUser.password = value.slice(0, atIdx);
      }
      return newUser;
    }));
  };
  const handleBulkRemoveRow = (idx: number) => {
    setBulkUsers(bulkUsers.filter((_, i) => i !== idx));
  };
  const handleBulkSave = async () => {
    if (!window.confirm('정말 저장하시겠습니까?')) return;
    // 비밀번호는 항상 '12345'로 자동 설정
    const usersToAdd = bulkUsers.map(u => ({ ...u, password: '12345' }));
    try {
      const response = await fetch('http://motclub.co.kr/api/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usersToAdd),
      });
      if (!response.ok) throw new Error('일괄 등록에 실패했습니다.');
      const newUsers = await response.json();
      setUsers([...newUsers, ...users]);
      setBulkUsers([]);
      setShowBulkModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };
  const handleBulkCancel = () => {
    if (window.confirm('정말 취소하시겠습니까?')) {
      setBulkUsers([]);
      setShowBulkModal(false);
    }
  };

  // 회원 삭제 핸들러
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`http://motclub.co.kr/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('회원 삭제에 실패했습니다.');
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 가입일 업데이트 핸들러
  const handleUpdateCreatedAt = async () => {
    if (!window.confirm('가입일이 없는 사용자들의 가입일을 오늘 날짜로 업데이트하시겠습니까?')) return;
    try {
      const response = await fetch('http://motclub.co.kr/api/users/update-created-at', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('가입일 업데이트에 실패했습니다.');
      const result = await response.json();
      alert(result.message);
      // 사용자 목록 새로고침
      const usersResponse = await fetch('http://motclub.co.kr/api/users');
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setUsers(data);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p className="text-red-500">에러: {error}</p>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            전체 회원 목록
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            현재 등록된 모든 사용자입니다.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddingUser({ name: '', email: '', role: 'USER', activityLevel: 1, remarks: '' })} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">등록</button>
          <button onClick={() => { setShowBulkModal(true); setBulkUsers([]); }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">일괄등록</button>
          <button onClick={handleUpdateCreatedAt} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">가입일 업데이트</button>
        </div>
      </div>
      <div className="border-t border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '181px'}}>이름</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '260px'}}>이메일</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '150px'}}>역할</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '320px'}}>비고</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '120px'}}>가입일</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{width: '120px'}}>수정일</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* 신규 등록 행 */}
            {addingUser && (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><input type="text" name="name" value={addingUser.name || ''} onChange={handleAddInputChange} className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><input type="email" name="email" value={addingUser.email || ''} onChange={handleAddInputChange} className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select name="role" value={addingUser.role || 'USER'} onChange={handleAddInputChange} className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="EXPERT">EXPERT</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500"><textarea name="remarks" value={addingUser.remarks || ''} onChange={handleAddInputChange} className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={handleAddSave} className="text-blue-600 hover:text-blue-900">저장</button>
                    <button onClick={handleAddCancel} className="text-gray-600 hover:text-gray-900">취소</button>
                  </div>
                </td>
              </tr>
            )}
            {/* 기존 회원 목록 */}
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{editingUserId === user.id && editingUser ? <input type="text" name="name" value={editingUser.name} onChange={handleInputChange} className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/> : user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{editingUserId === user.id && editingUser ? <input type="email" name="email" value={editingUser.email} onChange={handleInputChange} className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/> : user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingUserId === user.id && editingUser ? (
                    <select name="role" value={editingUser.role} onChange={handleInputChange} className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : user.role === 'EXPERT' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {editingUserId === user.id && editingUser ? (
                    <textarea 
                      name="remarks"
                      value={editingUser.remarks || ''}
                      onChange={handleInputChange}
                      className="block w-full p-3 border-gray-300 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    user.remarks
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.updatedAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingUserId === user.id ? (
                    <div className="flex space-x-2">
                      <button onClick={() => handleSaveClick(user.id)} className="text-blue-600 hover:text-blue-900">저장</button>
                      <button onClick={handleCancelClick} className="text-gray-600 hover:text-gray-900">취소</button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-900">수정</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">삭제</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 일괄등록 팝업 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 min-w-[960px]">
            <h2 className="text-xl font-bold mb-4">회원 일괄등록</h2>
            <table className="min-w-full mb-4">
              <thead>
                <tr>
                  <th className="px-2 py-1" style={{width: '216px'}}>이름</th>
                  <th className="px-2 py-1" style={{width: '312px'}}>이메일</th>
                  <th className="px-2 py-1" style={{width: '180px'}}>역할</th>
                  <th className="px-2 py-1" style={{width: '384px'}}>비고</th>
                  <th className="px-2 py-1" style={{width: '120px'}}>가입일</th>
                  <th className="px-2 py-1" style={{width: '120px'}}>수정일</th>
                  <th className="px-2 py-1" style={{width: '96px'}}>관리</th>
                </tr>
              </thead>
              <tbody>
                {bulkUsers.map((user, idx) => (
                  <tr key={idx}>
                    <td><input type="text" name="name" value={user.name} onChange={e => handleBulkInputChange(idx, e)} className="border p-1 rounded w-48" /></td>
                    <td><input type="email" name="email" value={user.email} onChange={e => handleBulkInputChange(idx, e)} className="border p-1 rounded w-72" /></td>
                    <td>
                      <select name="role" value={user.role} onChange={e => handleBulkInputChange(idx, e)} className="border p-1 rounded w-32">
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="EXPERT">EXPERT</option>
                      </select>
                    </td>
                    <td><input type="text" name="remarks" value={user.remarks} onChange={e => handleBulkInputChange(idx, e)} className="border p-1 rounded w-80" /></td>
                    <td className="px-2 py-1 text-sm text-gray-500">-</td>
                    <td className="px-2 py-1 text-sm text-gray-500">-</td>
                    <td><button onClick={() => handleBulkRemoveRow(idx)} className="text-red-500">삭제</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-2 mb-4">
              <button onClick={handleBulkAddRow} className="px-3 py-1 bg-gray-200 rounded">행 추가</button>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={handleBulkSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">저장</button>
              <button onClick={handleBulkCancel} className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500">취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 