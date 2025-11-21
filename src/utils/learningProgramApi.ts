// Learning Program API 연동 함수

import { getApiUrl } from '@/config/api';
import { LearningProgram, LearningProgramCreate, LearningProgramUpdate } from '@/types/learningProgram';

// 모든 Program 목록 조회
export const fetchLearningPrograms = async (): Promise<LearningProgram[]> => {
  try {
    const response = await fetch(getApiUrl('/api/learning-programs'));
    if (!response.ok) {
      throw new Error('Program 목록 조회에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('Program 목록 조회 오류:', error);
    throw error;
  }
};

// 상태별 Program 목록 조회
export const fetchLearningProgramsByStatus = async (status: string): Promise<LearningProgram[]> => {
  try {
    const response = await fetch(getApiUrl(`/api/learning-programs/status/${status}`));
    if (!response.ok) {
      throw new Error('Program 목록 조회에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('Program 목록 조회 오류:', error);
    throw error;
  }
};

// Program 상세 조회 (ID)
export const fetchLearningProgramById = async (id: number): Promise<LearningProgram> => {
  try {
    const response = await fetch(getApiUrl(`/api/learning-programs/${id}`));
    if (!response.ok) {
      throw new Error('Program 조회에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('Program 조회 오류:', error);
    throw error;
  }
};

// Program 상세 조회 (코드)
export const fetchLearningProgramByCode = async (code: string): Promise<LearningProgram> => {
  try {
    const response = await fetch(getApiUrl(`/api/learning-programs/code/${code}`));
    if (!response.ok) {
      throw new Error('Program 조회에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('Program 조회 오류:', error);
    throw error;
  }
};

// Program 생성
export const createLearningProgram = async (
  data: LearningProgramCreate,
  curriculumFile?: File
): Promise<LearningProgram> => {
  try {
    const formData = new FormData();
    formData.append('program', JSON.stringify(data));
    
    if (curriculumFile) {
      formData.append('curriculumFile', curriculumFile);
    }
    
    const response = await fetch(getApiUrl('/api/learning-programs'), {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = 'Program 생성에 실패했습니다.';
      try {
        const errorText = await response.text();
        console.error('백엔드 에러 응답:', errorText);
        console.error('HTTP 상태 코드:', response.status);
        if (errorText) {
          errorMessage = errorText;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        console.error('에러 응답 파싱 실패:', e);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Program 생성 오류:', error);
    throw error;
  }
};

// Program 수정
export const updateLearningProgram = async (
  id: number,
  data: LearningProgramUpdate,
  curriculumFile?: File
): Promise<LearningProgram> => {
  try {
    const formData = new FormData();
    formData.append('program', JSON.stringify(data));
    
    if (curriculumFile) {
      formData.append('curriculumFile', curriculumFile);
    }
    
    const response = await fetch(getApiUrl(`/api/learning-programs/${id}`), {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Program 수정에 실패했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Program 수정 오류:', error);
    throw error;
  }
};

// Program 삭제
export const deleteLearningProgram = async (id: number): Promise<void> => {
  try {
    const response = await fetch(getApiUrl(`/api/learning-programs/${id}`), {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Program 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('Program 삭제 오류:', error);
    throw error;
  }
};

