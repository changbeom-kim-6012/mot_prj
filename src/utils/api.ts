import { API_CONFIG, getApiUrl, getRelativeApiUrl, getApiConfig } from '@/config/api';

// API 호출 기본 설정
const apiConfig = getApiConfig();

// Fetch API 래퍼 함수
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = apiConfig.useProxy 
    ? getRelativeApiUrl(endpoint) 
    : getApiUrl(endpoint);
    
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// GET 요청
export const apiGet = async (endpoint: string, options: RequestInit = {}) => {
  return apiCall(endpoint, { ...options, method: 'GET' });
};

// POST 요청
export const apiPost = async (endpoint: string, data?: any, options: RequestInit = {}) => {
  return apiCall(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// PUT 요청
export const apiPut = async (endpoint: string, data?: any, options: RequestInit = {}) => {
  return apiCall(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// DELETE 요청
export const apiDelete = async (endpoint: string, options: RequestInit = {}) => {
  return apiCall(endpoint, { ...options, method: 'DELETE' });
};

// FormData를 사용한 POST 요청
export const apiPostFormData = async (endpoint: string, formData: FormData, options: RequestInit = {}) => {
  return apiCall(endpoint, {
    ...options,
    method: 'POST',
    body: formData,
    headers: {
      // FormData 사용 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
      ...options.headers,
    },
  });
};
