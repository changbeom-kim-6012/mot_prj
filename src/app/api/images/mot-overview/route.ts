import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // public 폴더의 이미지 파일 경로
    const imagePath = path.join(process.cwd(), 'public', 'MOT_Overview.png');
    
    // 파일이 존재하는지 확인
    if (!fs.existsSync(imagePath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // 파일 읽기
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Content-Type 헤더 설정
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

