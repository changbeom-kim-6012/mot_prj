import { useState, useEffect } from 'react';

export interface CommonCode {
  id: number;
  menuName: string;
  codeName: string;
  codeValue: string;
  description: string;
  parentId?: number;
  children?: CommonCode[];
}

export const useCommonCodes = (menuName: string) => {
  const [codes, setCodes] = useState<CommonCode[]>([]);
  const [hasEtc, setHasEtc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuCodes(menuName);
  }, [menuName]);

  const fetchMenuCodes = async (menu: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [codesResponse, etcResponse] = await Promise.all([
        fetch(`http://localhost:8080/api/codes/menu/${menu}/details`),
        fetch(`http://localhost:8080/api/codes/menu/${menu}/has-etc`)
      ]);
      
      if (!codesResponse.ok || !etcResponse.ok) {
        throw new Error('코드를 불러오는데 실패했습니다.');
      }
      
      const codesData = await codesResponse.json();
      const hasEtcData = await etcResponse.json();
      
      setCodes(codesData);
      setHasEtc(hasEtcData);
    } catch (err: any) {
      setError(err.message || '코드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchMenuCodes(menuName);

  return { codes, hasEtc, loading, error, refetch };
}; 