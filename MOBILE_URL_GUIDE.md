# Capacitor 웹 URL 설정 가이드

## 📝 capacitor.config.ts 설정 방법

`capacitor.config.ts` 파일에서 `APP_URL` 변수를 수정하세요.

### 1️⃣ 로컬 개발 (개발 서버)
개발 중일 때 실시간으로 변경사항을 확인하려면:

```typescript
const APP_URL = 'http://localhost:3000';
```

**주의사항:**
- `npm run dev`로 개발 서버가 실행 중이어야 합니다
- 실제 iOS/Android 기기에서 테스트할 때는 컴퓨터의 IP 주소를 사용하세요
  ```typescript
  const APP_URL = 'http://192.168.0.10:3000'; // 자신의 IP로 변경
  ```

### 2️⃣ 배포된 웹사이트
이미 배포된 웹앱을 앱에서 띄우려면:

```typescript
const APP_URL = 'https://stand-alone.bbubbu.me';
```

**장점:**
- 웹사이트를 업데이트하면 앱도 자동으로 업데이트됩니다
- 앱 스토어 재배포 없이 UI/기능 수정 가능
- HTTPS 권장 (보안)

### 3️⃣ 네이티브 앱 (오프라인)
앱에 웹 파일을 포함시켜 오프라인에서도 작동하게 하려면:

```typescript
const APP_URL = undefined; // 또는 주석 처리
```

**주의사항:**
- 빌드 전에 `npm run build`로 정적 파일 생성 필요
- 업데이트 시 앱 스토어에 재배포 필요

---

## 🔄 변경 후 적용 방법

1. `capacitor.config.ts` 수정
2. 터미널에서 실행:
   ```bash
   npm run mobile:sync
   ```
3. Xcode 또는 Android Studio에서 앱 재실행

---

## 💡 추천 설정

- **개발 단계**: 로컬 개발 서버 사용
- **테스트 단계**: 배포된 웹사이트 사용
- **최종 배포**: 배포된 웹사이트 또는 네이티브 앱

---

**현재 설정 확인:**
`capacitor.config.ts` 파일을 열어 `APP_URL` 값을 확인하세요.
