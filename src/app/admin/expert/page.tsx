'use client';

import { useRouter } from 'next/navigation';
import ExpertManagement from '@/components/admin/ExpertManagement';
import { Expert } from '@/types/expert';

export default function ExpertListPage() {
  const router = useRouter();

  const handleEditExpert = (expert: Expert) => {
    // 전문가 수정 페이지로 이동
    router.push(`/admin/expert/edit/${expert.id}`);
  };

  const handleCreateExpert = () => {
    // 전문가 생성 페이지로 이동
    router.push('/admin/expert/create');
  };

  return (
    <ExpertManagement 
      onEditExpert={handleEditExpert}
      onCreateExpert={handleCreateExpert}
    />
  );
} 