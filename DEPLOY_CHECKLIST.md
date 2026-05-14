# 배포 체크리스트 (해밀학교 후원 프로젝트)

## 1) 배포 전 필수 환경변수
- `NEXT_PUBLIC_SITE_URL`
  - 운영 도메인(예: `https://example.com`)
- `TURSO_DATABASE_URL`
  - Turso DB URL
- `TURSO_AUTH_TOKEN`
  - Turso 접근 토큰
- `BLOB_READ_WRITE_TOKEN`
  - Vercel Blob 업로드/삭제 토큰
- `SOLAPI_API_KEY`
  - Solapi API Key
- `SOLAPI_API_SECRET`
  - Solapi API Secret
- `SOLAPI_SENDER_PHONE`
  - Solapi 발신번호(숫자 형식)
- `ADMIN_NOTIFICATION_PHONE`
  - 관리자 알림 수신 번호
- `ADMIN_ID`
  - 관리자 로그인 아이디
- `ADMIN_PASSWORD`
  - 관리자 로그인 비밀번호

주의:
- `ADMIN_ID`, `ADMIN_PASSWORD`, Solapi Key/Secret은 절대 DB `settings` 테이블에 저장하지 않는다.
- 운영 비밀값은 Vercel 환경변수로만 관리한다.

## 2) Turso 점검
- [ ] `schema.sql`이 운영 DB에 반영되어 있는지 확인
- [ ] `students`, `sponsorships`, `gallery_items`, `sms_logs`, `settings` 테이블 존재 확인
- [ ] `idx_sponsorships_student_active` 유니크 인덱스 존재 확인
- [ ] 운영 시드 데이터 적용 여부 확인(개발용 placeholder URL 제거)
- [ ] 관리자 대시보드에서 통계 수치가 실제 DB 데이터와 일치하는지 확인

## 3) Vercel Blob 점검
- [ ] `BLOB_READ_WRITE_TOKEN` 설정 확인
- [ ] 관리자 갤러리 업로드(이미지/영상) 성공 확인
- [ ] 업로드 실패 시 사용자 오류 메시지 및 롤백 동작 확인
- [ ] 공개 `/gallery`에서 업로드 항목이 즉시 노출되는지 확인

## 4) Solapi 점검
- [ ] Solapi 키/시크릿/발신번호 설정 확인
- [ ] 후원 신청 접수 시 관리자 알림 SMS 로그 생성 확인
- [ ] 입금완료 상태 변경 시 후원자 안내 SMS 로그 생성 확인
- [ ] 실패 시 `sms_logs.status=실패` 기록 및 관리자 화면에서 확인 가능한지 점검

## 5) 관리자 계정/접근 제어 점검
- [ ] `/admin/login` 로그인 성공/실패 동작 확인
- [ ] 비로그인 상태에서 `/admin/*` 접근 시 로그인 리다이렉트 확인
- [ ] 로그인 후 대시보드/결연관리/학생/갤러리/설정 접근 가능 확인
- [ ] 로그아웃 후 보호 라우트 재접근 차단 확인

## 6) 기능 스모크 테스트 (배포 직후)
- [ ] 홈 `/` 결연 통계/대표 학생/메시지 렌더링 확인
- [ ] 학생 목록 `/students` 렌더링 및 상태 뱃지 확인
- [ ] 학생 상세 신청 `/students/[id]/sponsorship`
  - [ ] 정상 신청 가능 학생: 신청 성공
  - [ ] 입금대기/결연완료 학생: 신청 차단 메시지 확인
- [ ] 중복 신청(동일 학생 2회 시도) 차단 확인
- [ ] 관리자 결연 상태 변경
  - [ ] 입금대기 -> 입금완료 시 학생 상태 `matched` 반영
  - [ ] 취소 시 학생 상태 `available` 반영
- [ ] 관리자 설정 저장 후 새로고침 시 값 유지 확인
- [ ] 관리자 갤러리 업로드 후 공개 갤러리 반영 확인

## 7) UI/UX/접근성 점검
- [ ] 모바일(360px~430px)에서 주요 페이지 레이아웃 깨짐 없는지 확인
- [ ] 버튼 disabled 상태/로딩 상태/토스트 메시지 노출 확인
- [ ] 테이블 가로 스크롤 및 터치 동작 확인(관리자 페이지)
- [ ] 키보드 탭 이동/모달 ESC 닫기 동작 확인
- [ ] 색상 대비가 낮은 영역(상태 뱃지/보조 텍스트) 최종 눈검수

## 8) SEO 점검
- [ ] 페이지별 `<title>`, `<meta name="description">` 확인
- [ ] Open Graph/Twitter 태그 확인
- [ ] `/sitemap.xml` 응답 확인
- [ ] `/robots.txt` 응답 및 admin disallow 확인
- [ ] `favicon.ico` 노출 확인

## 9) 빌드/배포 명령 점검
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] Vercel 배포 로그에서 에러/경고 최종 확인

## 10) 배포 후 모니터링 (첫 24시간)
- [ ] 후원 신청 생성 오류 발생 여부
- [ ] 문자 발송 실패율 급증 여부
- [ ] 갤러리 업로드 실패율 확인
- [ ] 관리자 인증 관련 오류(리다이렉트 루프 등) 확인
