// Custom Program API 연동 함수

import { getApiUrl } from '@/config/api';

export interface CustomProgram {
  id: number;
  customerName: string;
  programName: string;
  plannerInstructor?: string;
  programIntroduction?: string;
  note?: string;
  keywords?: string;
  attachmentFileName?: string;
  attachmentFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomProgramCreate {
  customerName: string;
  programName: string;
  plannerInstructor?: string;
  programIntroduction?: string;
  note?: string;
  keywords?: string;
}

export interface CustomProgramUpdate {
  customerName?: string;
  programName?: string;
  plannerInstructor?: string;
  programIntroduction?: string;
  note?: string;
  keywords?: string;
}

// 모든 Custom Program 목록 조회
export const fetchCustomPrograms = async (keyword?: string): Promise<CustomProgram[]> => {
  try {
    const url = keyword 
      ? getApiUrl(`/api/custom-programs?keyword=${encodeURIComponent(keyword)}`)
      : getApiUrl('/api/custom-programs');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Custom Program 목록 조회에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('Custom Program 목록 조회 오류:', error);
    throw error;
  }
};

// Custom Program 상세 조회 (ID)
export const fetchCustomProgramById = async (id: number): Promise<CustomProgram> => {
  try {
    const response = await fetch(getApiUrl(`/api/custom-programs/${id}`));
    if (!response.ok) {
      throw new Error('Custom Program 조회에 실패했습니다.');
    }
    return await response.json();
  } catch (error) {
    console.error('Custom Program 조회 오류:', error);
    throw error;
  }
};

// Custom Program 생성
export const createCustomProgram = async (
  data: CustomProgramCreate,
  attachmentFile?: File
): Promise<CustomProgram> => {
  try {
    const formData = new FormData();
    formData.append('program', JSON.stringify(data));
    
    if (attachmentFile) {
      formData.append('attachmentFile', attachmentFile);
    }
    
    const response = await fetch(getApiUrl('/api/custom-programs'), {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Custom Program 생성에 실패했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Custom Program 생성 오류:', error);
    throw error;
  }
};

// Custom Program 수정
export const updateCustomProgram = async (
  id: number,
  data: CustomProgramUpdate,
  attachmentFile?: File,
  deleteAttachment?: boolean
): Promise<CustomProgram> => {
  try {
    const formData = new FormData();
    formData.append('program', JSON.stringify(data));
    
    if (attachmentFile) {
      formData.append('attachmentFile', attachmentFile);
    }
    
    if (deleteAttachment !== undefined) {
      formData.append('deleteAttachment', deleteAttachment.toString());
    }
    
    const response = await fetch(getApiUrl(`/api/custom-programs/${id}`), {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Custom Program 수정에 실패했습니다.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Custom Program 수정 오류:', error);
    throw error;
  }
};

// Custom Program 삭제
export const deleteCustomProgram = async (id: number): Promise<void> => {
  try {
    const response = await fetch(getApiUrl(`/api/custom-programs/${id}`), {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Custom Program 삭제에 실패했습니다.');
    }
  } catch (error) {
    console.error('Custom Program 삭제 오류:', error);
    throw error;
  }
};

