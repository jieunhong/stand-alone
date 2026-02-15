import type { CapacitorConfig } from '@capacitor/cli';

/**
 * 네이티브 앱에서 웹앱을 로드하는 설정
 * 
 * 사용 방법:
 * 1. 로컬 개발: APP_URL을 'http://localhost:3000' 또는 실행 중인 개발 서버 주소로 설정
 * 2. 배포된 웹앱: APP_URL을 실제 웹사이트 주소로 설정 (예: 'https://your-domain.com')
 * 3. 네이티브 빌드: APP_URL을 undefined로 두면 로컬 빌드된 파일(out 폴더) 사용
 */

// ⚠️ 여기에 앱에서 띄울 웹 주소를 입력하세요
const APP_URL = 'https://stand-alone.bbubbu.me'; // 예: 'https://stand-alone.bbubbu.me'

const config: CapacitorConfig = {
  appId: 'com.jieunhong.standalone',
  appName: 'Stand-Alone',
  webDir: 'out',

  // 서버 설정: 웹 URL이 지정되면 해당 주소를 로드
  ...(APP_URL && {
    server: {
      url: APP_URL,
      cleartext: true, // HTTP를 허용 (프로덕션에서는 HTTPS 권장)
    },
  }),
};

export default config;
