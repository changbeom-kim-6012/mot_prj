// API 서버 URL 설정

const getApiBaseUrl = () => {
  // 환경별 API URL 설정
  let apiUrl;
  
  // 환경 변수 우선순위: API_URL > NEXT_PUBLIC_API_URL > 기본값
  if (process.env.API_URL) {
    apiUrl = process.env.API_URL;
  } else if (process.env.NEXT_PUBLIC_API_URL) {
    apiUrl = process.env.NEXT_PUBLIC_API_URL;
  } else {
    // 환경 변수가 없을 때 NODE_ENV 기반으로 설정
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') {
      apiUrl = 'http://www.motclub.co.kr';
    } else {
      // development 또는 기타 환경에서는 localhost 사용
      apiUrl = 'http://localhost:8084';
    }
  }
  
  // 빌드 시 환경 변수 로깅
  if (typeof window === 'undefined') {
    console.log('=== API 환경 설정 ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('API_URL:', process.env.API_URL);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('최종 BASE_URL:', apiUrl);
    console.log('==================');
  }
  
  return apiUrl;
};

export const API_CONFIG = {
  // 환경 변수에서 API URL 가져오기 (우선순위: API_URL > NEXT_PUBLIC_API_URL > 기본값)
  BASE_URL: getApiBaseUrl(),
  
  // API 엔드포인트들
  ENDPOINTS: {
    // 인증 관련
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
    RESET_PASSWORD: '/api/auth/reset-password',
    
    // Q&A 관련
    QUESTIONS: '/api/questions',
    QUESTION_DETAIL: '/api/questions',
    QUESTION_CATEGORIES: '/api/codes/menu/qna/details',
    QUESTION_SEARCH: '/api/questions/search',
    
    // 의견 관련
    OPINIONS: '/api/opinions',
    OPINION_DETAIL: '/api/opinions',
    
    // 코스 관련
    COURSES: '/api/courses',
    COURSE_DETAIL: '/api/courses',
    
    // 학습 관련
    LEARNING: '/api/learning',
    
    // 도서관 관련
    LIBRARY: '/api/library',
    
    // 관리자 관련
    ADMIN_USERS: '/api/admin/users',
    ADMIN_EXPERTS: '/api/admin/experts',
    ADMIN_OPINIONS: '/api/admin/opinions',
    ADMIN_CODES: '/api/admin/codes',
    
    // 전문가 관련
    EXPERTS: '/api/experts',
  }
} as const;

// API URL 생성 헬퍼 함수
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 상대 경로 API URL 생성 (프록시 사용 시)
export const getRelativeApiUrl = (endpoint: string): string => {
  return endpoint;
};

// 환경에 따른 API URL 설정
export const getApiConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    baseUrl: API_CONFIG.BASE_URL,
    useProxy: isDevelopment, // 개발 환경에서는 프록시 사용
    timeout: 30000,
    retryCount: 3,
  };
};
