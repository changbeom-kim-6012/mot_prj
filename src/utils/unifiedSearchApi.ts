import { getApiUrl } from '@/config/api';

export interface UnifiedSearchResult {
  category: 'Library' | 'Learning' | 'Research' | 'Q&A';
  items: SearchItem[];
  totalCount: number;
}

export interface SearchItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  author?: string;
  createdAt: string;
  href: string;
}

export const searchUnified = async (keyword: string): Promise<UnifiedSearchResult[]> => {
  if (!keyword || !keyword.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      getApiUrl(`/api/search/unified?keyword=${encodeURIComponent(keyword.trim())}`)
    );

    if (!response.ok) {
      throw new Error(`검색 실패: ${response.status}`);
    }

    const data: UnifiedSearchResult[] = await response.json();
    return data;
  } catch (error) {
    console.error('통합검색 API 호출 오류:', error);
    throw error;
  }
};
