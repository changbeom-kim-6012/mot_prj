import Link from 'next/link';
import { motion } from 'framer-motion';
import { CommunityItem } from '@/types/community';

interface Props {
  communities: CommunityItem[];
  loading: boolean;
  searchTerm: string;
  selectedCategory: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\./g, '.').replace(/\s/g, '');
};

export default function CommunityList({ communities, loading, searchTerm, selectedCategory }: Props) {
  if (loading) {
    return <div className="text-center text-gray-500 py-12">데이터를 불러오는 중...</div>;
  }

  if (communities.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-gray-500">
        {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다.' : '등록된 게시글이 없습니다.'}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="col-span-2 text-sm font-medium text-gray-500">카테고리</div>
        <div className="col-span-7 text-sm font-medium text-gray-500">제목</div>
        <div className="col-span-2 text-sm font-medium text-gray-500">작성일</div>
        <div className="col-span-1 text-sm font-medium text-gray-500">작성자</div>
      </div>
      {communities.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
        >
          <div className="col-span-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {item.category?.codeName || '기타'}
            </span>
          </div>
          <div className="col-span-7">
            <Link 
              href={`/news/${item.id}`}
              className="text-gray-900 font-medium hover:text-indigo-600 transition-colors duration-150 cursor-pointer block"
            >
              {item.title}
            </Link>
          </div>
          <div className="col-span-2 text-sm text-gray-500">
            {formatDate(item.createdAt)}
          </div>
          <div className="col-span-1 text-sm text-gray-500">
            {item.author}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
} 