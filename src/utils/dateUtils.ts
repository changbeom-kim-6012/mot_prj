/**
 * 안전한 날짜 포맷팅 함수
 * @param dateString - 날짜 문자열 또는 Date 객체
 * @param options - 포맷팅 옵션
 * @returns 포맷팅된 날짜 문자열 또는 에러 메시지
 */
export const formatDate = (
  dateString: string | Date | null | undefined | number[],
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }
): string => {
  if (!dateString) return '날짜 없음';
  
  try {
    let date: Date;
    
    // 배열 형태의 날짜 처리 (Java LocalDateTime 직렬화 결과)
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute, second, nano] = dateString;
      // month는 0-based이므로 1을 빼야 함
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateString);
    }
    
    // Invalid Date 체크
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '날짜 오류';
    }
    
    return date.toLocaleDateString('ko-KR', options)
      .replace(/\./g, '.')
      .replace(/\s/g, '');
  } catch (error) {
    console.error('Date formatting error:', error, 'for dateString:', dateString);
    return '날짜 오류';
  }
};

/**
 * 날짜가 유효한지 확인하는 함수
 * @param dateString - 날짜 문자열 또는 Date 객체
 * @returns 유효성 여부
 */
export const isValidDate = (dateString: string | Date | null | undefined | number[]): boolean => {
  if (!dateString) return false;
  
  try {
    let date: Date;
    
    // 배열 형태의 날짜 처리 (Java LocalDateTime 직렬화 결과)
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute, second, nano] = dateString;
      // month는 0-based이므로 1을 빼야 함
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateString);
    }
    
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * 상대적 시간 표시 함수 (예: 3일 전, 1시간 전)
 * @param dateString - 날짜 문자열 또는 Date 객체
 * @returns 상대적 시간 문자열
 */
export const getRelativeTime = (dateString: string | Date | null | undefined | number[]): string => {
  if (!dateString) return '날짜 없음';
  
  try {
    let date: Date;
    
    // 배열 형태의 날짜 처리 (Java LocalDateTime 직렬화 결과)
    if (Array.isArray(dateString)) {
      const [year, month, day, hour, minute, second, nano] = dateString;
      // month는 0-based이므로 1을 빼야 함
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return '날짜 오류';
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffDays > 1) {
      return `${diffDays}일 전`;
    } else if (diffHours > 1) {
      return `${diffHours}시간 전`;
    } else if (diffMinutes > 1) {
      return `${diffMinutes}분 전`;
    } else {
      return '방금 전';
    }
  } catch (error) {
    return '날짜 오류';
  }
};



