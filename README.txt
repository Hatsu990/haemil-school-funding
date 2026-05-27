프로젝트명
해밀학교 후원 프로젝트

프로젝트 전용 Skill 시스템 적용 완료
- 위치: .agents/skills/haemill-school/SKILL.md
- 기준 문서: PROJECT_SPEC.txt
- 앞으로 모든 Codex 작업은 PROJECT_SPEC.txt + SKILL.md를 함께 참조

--------------------------------------------------
Turso DB 초기화 방법
--------------------------------------------------

1) 프로젝트 루트(`haemill-school-funding/.env.local`)에 아래 값이 있어야 합니다.
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

2) 스키마 적용
- `npm run db:schema`

3) 시드 데이터 적용
- `npm run db:seed`

실행 로그에는 아래 정보가 함께 출력됩니다.
- 연결 대상 DB URL(마스킹)
- 현재 테이블 목록
- `students` 테이블 row 수

실행 중 필수 환경변수가 없으면 누락된 변수명이 에러로 출력되고 즉시 중단됩니다.

--------------------------------------------------
Production DB 디버깅 (/students)
--------------------------------------------------

- 디버깅 로그 위치: `lib/repositories/students.ts`의 `getStudents()`
- 출력 항목:
  - `TURSO_DATABASE_URL` 존재 여부 (`set`/`missing`)
  - `TURSO_AUTH_TOKEN` 존재 여부 (`set`/`missing`)
  - 조회 성공 시 `students count`
  - 조회 실패 시 실제 에러(`console.error`)
- 민감정보 보호:
  - 토큰 값(`TURSO_AUTH_TOKEN`) 자체는 절대 로그로 출력하지 않음

`/students` 페이지는 production에서도 로그 확인이 가능하도록
`dynamic = "force-dynamic"`으로 동적 렌더링을 강제합니다.

Vercel 확인 경로:
1) Vercel Dashboard
2) Project 선택
3) `Logs` (또는 Runtime Logs)
4) `/students` 요청 시점 로그 확인

--------------------------------------------------
DB 연결 소스/동기화 점검 (2026-05-15)
--------------------------------------------------

목적:
- localhost 개발 서버와 Vercel Production이 같은 Turso DB를 바라보는지 확인
- 운영 반영 지연이 "코드 배포 문제"인지 "서로 다른 DB 연결 문제"인지 분리

lib/db/client.ts 환경변수 로딩 규칙:
1) Vercel 런타임(`VERCEL`/`VERCEL_ENV` 존재)
- `.env.local`을 읽지 않음
- Vercel Environment Variables만 사용

2) localhost 개발 런타임
- 프로젝트 루트 `.env.local`을 로딩 시도
- 없으면 OS process environment 사용

보안 정책:
- `TURSO_AUTH_TOKEN` 전체값 출력 금지
- `TURSO_DATABASE_URL` 전체값 출력 금지
- 로그에는 마스킹된 일부만 출력

출력되는 DB 디버그 로그 예시:
- `[DB] runtime=localhost-development, source=.env.local (local file), url=libsql://xxxx***yyyyyy, token=abcd***xyz`
- `[DB] runtime=vercel-production, source=Vercel Environment Variables, url=libsql://xxxx***yyyyyy, token=abcd***xyz`

동일 DB 판별 방법:
1) localhost에서 관리자 페이지 요청(또는 DB 조회 발생) 후 터미널 로그의 `url=...` 확인
2) 운영 사이트에서 동일 기능 호출 후 Vercel Runtime Logs의 `url=...` 확인
3) 두 로그의 마스킹 URL 패턴이 동일하면 같은 Turso DB를 사용 중

중요:
- localhost와 Production이 같은 DB를 바라보면,
  localhost 관리자 페이지에서 수정한 데이터는 운영 사이트에도 즉시 반영될 수 있음
  (동일 DB이므로 배포 없이 데이터 레벨로 바로 공유됨)

DB 연결 실패 시:
- 화면 메시지에 `환경(runtime)` + `마스킹 DB URL`이 함께 표시됨
- 서버 콘솔에도 동일 디버그 컨텍스트로 에러가 남음

--------------------------------------------------
운영 시작 전 초기화/삭제 정책 (2026-05-16)
--------------------------------------------------

운영 초기화 명령:
- `npm run db:reset-operational -- --confirm`

동작:
- `sponsorships` 전체 삭제
- `students.sponsorship_status` 전체 `available`로 일괄 변경
- 학생 데이터 자체(`students` row), 학생 프로필 이미지, 손편지 이미지는 삭제하지 않음

보존:
- `gallery_items`
- `settings`
- `sms_logs`

주의:
- 더미 신청 데이터는 `db:seed`를 다시 실행할 때만 재삽입됩니다.
- 앱 런타임에서 `seed.sql`을 자동 실행하지 않습니다.

학생 상태 기준:
- DB 내부 상태값: `available` / `pending` / `matched`
- UI 표시값: 신청가능 / 입금대기 / 결연완료
- 초기화는 상태값과 무관하게 모든 학생을 `available`로 재설정합니다.

갤러리 삭제 정책:
- 공개 노출 여부는 `gallery_items` 테이블 기준으로만 판단합니다.
- 관리자에서 항목 삭제 시 `/`, `/gallery`, `/admin/gallery`, `/admin/dashboard` 경로를 revalidate합니다.
- 따라서 DB에서 삭제된 항목은 공개 메인/갤러리에서 다시 보이면 안 됩니다.

Blob 정리 정책:
- `file_url`이 Vercel Blob URL(`*.blob.vercel-storage.com`)일 때만 Blob 삭제를 시도합니다.
- Blob 삭제 실패 시에도 DB 삭제는 성공 처리하며, 화면에서는 "노출 삭제 완료 + 파일 정리 실패"를 분리 안내합니다.
- Blob 삭제 실패 원인은 `console.error`로 기록합니다.

--------------------------------------------------
이미지 활용/디자인 고도화 (2026-05-16)
--------------------------------------------------

적용 배경:
- 공개 페이지의 이미지 반복을 줄이고, 페이지별 분위기 차이를 강화
- `Image` 폴더의 추가 자산(`People4~6`, `School3`)을 웹 경로에서 사용 가능하도록 반영

자산 경로 정리:
- 원본: `Image/People4.jpg`, `Image/People5.jpg`, `Image/People6.jpg`, `Image/Scool3.jpg`
- 반영: `public/images/haemill/people-activity-4.jpg`, `people-activity-5.jpg`, `people-activity-6.jpg`, `school-campus-3.jpg`

페이지별 이미지 톤:
- 홈(`/`)
  - 희망적/따뜻한 분위기: 대형 히어로 + 통계 카드 + CTA 배경을 서로 다른 이미지로 분리
- 학생 만나기(`/students`)
  - 안정감/신뢰 중심: 학교 전경 기반 히어로 + 운영 안내 섹션의 활동 사진 보조
- 학교 소개(`/about`)
  - 실제 생활감 강조: 각 가치 카드마다 다른 이미지 매칭, 카드-카드 간 중복 제거
- 프로젝트 안내(`/project`)
  - 공감/설득 중심: 후원 필요성/운영 원칙/절차 영역을 각기 다른 활동 이미지로 구성
- 갤러리(`/gallery`)
  - 생동감 강화: 활동 사진 히어로 + 보조 썸네일로 진입부 밀도 개선

반복 감소 방식:
- 동일 페이지 내 중복 이미지 사용을 최대한 제거
- 같은 계열 이미지는 섹션별로 분산 배치
- 섹션별 overlay/opacity/gradient를 다르게 적용해 시각적 반복감 완화

디자인 처리:
- 대형 히어로 섹션에 gradient overlay + blur 계열 레이어 적용
- 카드/섹션마다 배경 이미지의 투명도와 색온도를 다르게 조절해 가독성 유지
- CTA 영역은 배경 이미지 + 따뜻한 그라데이션으로 강조
- 모바일에서는 이미지 카드가 단일 열로 내려오도록 유지해 정보 읽기 흐름 확보

--------------------------------------------------
작업 로그 (2026-05-12)
--------------------------------------------------

초기 프론트 세팅 완료:
- Next.js App Router + TypeScript + Tailwind CSS 프로젝트 구조 적용
- 공개 페이지 라우트 구성
  - /
  - /students
  - /about
  - /project
  - /gallery
- 관리자 페이지 라우트 구성
  - /admin/login
  - /admin/dashboard
  - /admin/sponsorships
  - /admin/messages
  - /admin/students
  - /admin/gallery
  - /admin/settings

공통 레이아웃:
- 공개 페이지: 헤더/푸터
- 관리자 페이지: 사이드바/상단바(모바일 네비 포함)

mock 데이터:
- 학생 목록
- 후원 신청 목록
- 갤러리 목록
- 문자 발송 로그

현재 mock/placeholder 상태(연동 미구현):
- Turso DB 연결
- Vercel Blob 업로드
- Solapi 발송 연동
- 실제 로그인 세션 인증
- 실제 후원 신청 저장

프로젝트 목적
해밀학교 학생들의 생활관비를 1:1 결연 방식으로 후원받을 수 있는 사이트 제작.

목표는 단순 소개 사이트가 아니라,
실제로 후원이 이루어질 수 있는 “모금 전략 페이지 + 결연 시스템”을 구축하는 것.

이 프로젝트는 기존 UBMK 후원 사이트 구조를 참고하여 제작한다.
참고 사이트:
https://ubmk-70.vercel.app/

--------------------------------------------------
학교 정보
--------------------------------------------------

학교명:
해밀학교

설립:
가수 인순이(김인순)가 설립한 다문화 대안학교

위치:
강원특별자치도 홍천군

학생 수:
60명

학생 특징:
- 다문화 학생 비율 50% 이상
- 중도입국 학생 존재
- 경제적으로 어려운 학생 존재
- 기숙사 생활

후원 목적:
학생들이 부담하는 생활관비를 후원받기 위함

생활관비:
월 약 10만 원 내외

--------------------------------------------------
후원 시스템 정책
--------------------------------------------------

후원 방식:
1. 일시후원
2. 정기후원

후원 금액:
- 일시후원: 10만 원 고정
- 정기후원: 월 10만 원 고정

정기후원 기간:
체크박스로 선택 가능
예:
- 1개월
- 3개월
- 6개월
- 12개월
- 직접 입력

후원 방식:
자동 결제 시스템 사용 안 함.
후원 신청 후 관리자가 직접 전화하여 입금 안내 진행.

후원 프로세스:
1. 사용자가 학생 선택
2. 후원 신청 작성
3. 관리자 페이지에 신청 등록
4. 관리자가 직접 전화
5. 입금 확인
6. 관리자가 입금 완료 처리
7. 학생 결연 완료 상태 변경

결연 완료 기준:
“입금 완료” 기준

중요 정책:
- 학생 1명당 후원자 1명만 가능
- 입금 대기 상태가 되면 다른 사람 신청 불가
- 취소 시 다시 신청 가능

--------------------------------------------------
학생 공개 정책
--------------------------------------------------

학생 실명:
비공개

학생 이름:
공개 표시명 사용

공개 정보:
- 공개 표시명
- 성별
- 학년
- 소개 문구

학생 사진:
실제 사진 사용 안 함

학생 프로필 이미지:
카툰풍 AI 이미지 사용

손편지:
이미지 형태로 공개

--------------------------------------------------
후원 신청 폼 항목
--------------------------------------------------

- 후원자 이름
- 휴대폰 번호
- 이메일
- 후원 방식
  - 일시후원
  - 정기후원
- 후원 기간
- 후원자 공개 여부
  - 기본값: 공개
- 응원 메시지
- 기부금 영수증 발급 희망 여부
- 개인정보 수집 동의
- 선택한 학생 ID

--------------------------------------------------
프론트 페이지 구조
--------------------------------------------------

1. 홈
- 메인 비주얼
- 후원 목표 표시
- 현재 결연 현황
- 결연 완료 수
- 진행률
- 대표 학생 카드
- 후원자 메시지
- 학교 소개
- 후원 CTA 버튼

2. 학생 만나기
- 학생 60명 목록
- 결연 상태 표시
- 학생 상세 정보
- 손편지 보기
- 결연 신청 버튼
- 필터 기능
- 정렬 기능

3. 학교 소개
- 해밀학교 소개
- 설립 배경
- 교육 철학
- 학교 생활
- 다문화 학생 이야기
- 기숙사 설명

4. 프로젝트 안내
- 생활관비 후원의 필요성
- 결연 구조 설명
- 후원 사용처 설명
- 후원 흐름 설명

5. 갤러리
- 학교 활동 사진
- 행사 사진
- 영상 업로드 가능
- 여러 장 업로드 가능

--------------------------------------------------
관리자 페이지 구조
--------------------------------------------------

관리자 경로:
/admin/login

로그인 방식:
고정 아이디 / 비밀번호 방식

환경변수:
ADMIN_ID=admin
ADMIN_PASSWORD=ubmk2026!

회원가입 기능:
없음

--------------------------------------------------
관리자 기능
--------------------------------------------------

1. 대시보드
- 전체 학생 수
- 결연 완료 수
- 결연 대기 수
- 입금 대기 수
- 일시후원 수
- 정기후원 수
- 오늘 전화할 후원자
- 최근 신청 목록

2. 결연 신청 관리
- 전체 신청 목록
- 입금대기 / 입금완료 / 취소 관리
- 검색 기능
- 공개 여부 설정
- 응원 메시지 확인
- 수동 상태 변경

3. 발송 관리
- 정기후원 관리
- 자동 문자 발송
- 발송 실패 확인
- 발송 이력 확인
- 관리자 알림 발송

4. 학생 관리
- 학생 정보 수정
- AI 프로필 이미지 관리
- 손편지 이미지 관리
- 학생 소개 수정
- 결연 상태 관리

5. 갤러리 관리
- 사진 업로드
- 영상 업로드
- 제목 설정
- 여러 장 업로드

6. 설정
- 문자 수신자 설정
- 자동 발송 시간 설정
- 관리자 연락 설정

--------------------------------------------------
문자 시스템
--------------------------------------------------

문자 API:
Solapi

문자 특징:
- 템플릿 기반
- 이름 부분만 변경하여 발송

예상 문자 종류:
- 신청 완료 안내
- 관리자 전화 예정 안내
- 입금 완료 안내
- 정기후원 안내
- 관리자 새 신청 알림
- 관리자 일일 알림

--------------------------------------------------
기술 스택
--------------------------------------------------

프론트:
Next.js

배포:
Vercel

데이터베이스:
Turso DB

이미지 저장:
Vercel Blob

SMS:
Solapi

--------------------------------------------------
데이터 저장 정책
--------------------------------------------------

Turso DB:
- 학생 정보
- 후원 신청 정보
- 입금 상태
- 후원 메시지
- 문자 발송 기록
- 설정값 저장

Vercel Blob:
- 학생 AI 이미지
- 손편지 이미지
- 갤러리 이미지
- 갤러리 영상

--------------------------------------------------
개발 방향
--------------------------------------------------

- 실제 운영 가능한 수준으로 제작
- GitHub에 전체 작업 기록
- AI(Codex/Claude/ChatGPT)를 활용한 제작 연습
- 관리자 페이지와 프론트 페이지 모두 구현
- 실제 후원 운영 가능 구조 목표

--------------------------------------------------
작업 로그 (2026-05-13)
--------------------------------------------------
- DB 스키마 초안 생성
- Turso 연결 준비
- Repository 계층 준비
- 아직 실제 DB 연동은 미완료

--------------------------------------------------
작업 로그 (2026-05-13 - 관리자 인증)
--------------------------------------------------
- 관리자 로그인 기능 구현 (/admin/login)
- ADMIN_ID / ADMIN_PASSWORD 환경변수 검증 로직 추가
- admin-auth httpOnly 쿠키 기반 세션 처리 추가
- 관리자 보호 라우트 미들웨어 추가
- 로그아웃 기능 추가

--------------------------------------------------
작업 로그 (2026-05-13 - 후원 신청 mock 플로우)
--------------------------------------------------
- /students 카드의 결연 신청 버튼을 실제 신청 라우트와 연결
- available 상태 학생만 신청 가능하도록 처리
- pending/matched 상태 학생은 신청 버튼 비활성화 및 정책 사유 안내
- /students/[studentId]/sponsorship 페이지 추가 (학생별 후원 신청 폼)
- 후원 신청 필수 항목 구현
  - 후원자 이름 / 휴대폰 번호 / 이메일
  - 후원 방식(일시후원/정기후원)
  - 후원 기간(1/3/6/12개월/직접 입력)
  - 후원자 공개 여부(기본 공개)
  - 응원 메시지
  - 기부금 영수증 발급 희망 여부
  - 개인정보 수집 동의
  - 선택 학생 ID(hidden)
- 서버 액션 입력 검증 구현
  - 이름 필수
  - 휴대폰 번호 필수(형식 검증 포함)
  - 이메일 형식 검증
  - 후원 방식 필수
  - 개인정보 수집 동의 필수
  - 정기후원 선택 시 후원 기간 필수
- mock 제출 처리 구현 (DB 저장 없음)
  - 제출 성공 시 완료 메시지 노출
  - "관리자가 확인 후 전화드릴 예정" 안내 문구 노출
  - 쿠키 기반 mock 상태 반영으로 선택 학생을 pending처럼 표시
- 결연 정책 안내 반영
  - 학생 1명당 후원자 1명
  - 입금 대기 상태 신청 불가
  - 입금 완료 상태 신청 불가
  - 결연 완료 기준은 입금 완료

--------------------------------------------------
작업 로그 (2026-05-13 - 관리자 결연 신청 관리 mock)
--------------------------------------------------
- /admin/sponsorships 페이지를 클라이언트 상태 기반 관리 화면으로 보강
- mock 후원 신청 목록 테이블에 필수 표시 항목 반영
  - 신청일 / 후원자 이름 / 전화번호 / 이메일 / 학생 공개 표시명
  - 후원 방식 / 후원 기간 / 후원자 공개 여부
  - 기부금 영수증 희망 여부 / 응원 메시지 / 상태
- 검색 기능 구현
  - 이름 / 전화번호 / 이메일 / 학생 공개 표시명 기준 통합 검색
- 상태 필터 구현
  - 전체 / 입금대기 / 입금완료 / 취소
- 상태 변경 UI 구현
  - 각 행에서 입금대기 / 입금완료 / 취소로 변경 후 즉시 반영
- 상태 변경 정책 mock 반영
  - 입금완료 => 학생 결연완료 상태로 간주
  - 취소 => 학생 신청가능 상태로 간주
  - 입금대기 => 학생 입금대기 상태로 간주
- 긴 응원 메시지 처리
  - 목록에서는 미리보기 + "상세 보기"
  - 상세 모달에서 전체 메시지 확인 가능
- DB 저장/문자 발송 없이 mock 상태로만 동작

--------------------------------------------------
작업 로그 (2026-05-13 - Turso DB 연결/seed 준비)
--------------------------------------------------
- Turso 클라이언트 정리 (@libsql/client 기반, 환경변수 누락 에러 메시지 강화)
- schema.sql 정리 (테이블/인덱스/CHECK 제약/updated_at 트리거 점검)
- seed.sql 생성 (개발용 학생 60명 + 후원/갤러리/설정/SMS 샘플)
- DB 실행 스크립트 추가
  - db:schema
  - db:seed
- repository 실제 쿼리화 준비
  - getStudents / getStudentById / updateStudentStatus
  - getSponsorships / getSponsorshipById / createSponsorship / updateSponsorshipStatus
  - getGalleryItems / createGalleryItem
  - createSmsLog
  - getSettings
- 기존 mock UI는 유지 (이번 단계에서 전면 DB 연결은 미진행)

--------------------------------------------------
작업 로그 (2026-05-13 - 학생 화면 repository 전환)
--------------------------------------------------
- /students 페이지를 getStudents() 기반 데이터 흐름으로 전환
- /admin/students 페이지를 getStudents() 기반 데이터 흐름으로 전환
- 학생 관련 화면의 mock-data 직접 import 제거
  - /students
  - /students/[studentId]/sponsorship (page/actions)
  - /admin/students
- 학생 UI 보정 유틸 추가 (profileTheme/letterSummary 기본값 보정)
- DB 연결 실패 시 사용자 안내 메시지 표시 + console error 로깅 추가
- 기존 mock UI 구조는 유지하고, 학생 상태(available/pending/matched) 반영은 유지

--------------------------------------------------
작업 로그 (2026-05-13 - 후원 신청 DB 저장 연결)
--------------------------------------------------
- /students/[studentId]/sponsorship 서버 액션을 mock 쿠키 처리에서 Turso repository 저장 흐름으로 전환
- 제출 시 createSponsorship(data)로 sponsorships 테이블에 신청 저장
- 저장 성공 후 updateStudentStatus(studentId, "pending")로 학생 상태를 입금대기 상태와 일치하도록 갱신
- 신청 저장 직전 학생 상태를 재확인하여 available 상태가 아니면 저장 차단
- DB의 active sponsorship 유니크 제약(학생 1명당 1명) 충돌 시 사용자 안내 메시지 반환
- 신청 완료 안내 문구를 "신청이 접수되었습니다. 관리자가 확인 후 전화드릴 예정입니다."로 표시
- /admin/sponsorships 페이지를 getSponsorships() + getStudents() 기반 DB 데이터 로딩으로 연결
- DB 연결 실패 시 사용자 안내 메시지와 console error를 함께 출력하도록 처리

--------------------------------------------------
작업 로그 (2026-05-13 - 관리자 상태 변경 트랜잭션/원자성 강화)
--------------------------------------------------
- /admin/sponsorships 상태 변경 UI를 서버 액션 + repository DB 업데이트로 연결
- 상태 변경 시 updateSponsorshipStatus(id, status)로 실제 Turso DB에 저장되도록 반영
- 관리자 상태 변경 트랜잭션 강화
  - sponsorships.status 변경 + students.sponsorship_status 동기화를 단일 트랜잭션으로 처리
  - 정책 매핑 강제
    - 입금대기 -> pending
    - 입금완료 -> matched
    - 취소 -> available
  - 잘못된 status 값은 repository 계층에서 거부
- 후원 신청 트랜잭션 강화
  - createSponsorship(data)에서 신청 저장 + 학생 pending 변경을 단일 트랜잭션으로 처리
  - 저장 직전 DB에서 학생 상태를 재확인하고 available이 아니면 저장 차단
- 관리자 상태 변경 감사 로그 준비
  - 기존 sms_logs 구조를 활용하는 createStatusChangeLog() repository 함수 추가
  - Solapi 실제 문자 발송 없이 상태 변경 이력 저장 준비
- 관리자 UI 피드백 보강
  - 상태 변경 성공/실패 메시지 표시
  - 저장 중 중복 클릭 방지를 위해 select/button 비활성화 처리

--------------------------------------------------
작업 로그 (2026-05-13 - 관리자 학생 추가/삭제 기능)
--------------------------------------------------
- /admin/students 페이지에 학생 추가 폼 구현 (공개 표시명/성별/학년/소개/초기 상태)
- 학생 추가 시 createStudentAction -> createStudent(repository) -> Turso DB INSERT 연결
- /admin/students 카드에 학생 삭제 버튼 구현
- 학생 삭제 시 deleteStudentAction -> deleteStudent(repository) -> Turso DB DELETE 연결
- 후원 신청 이력이 있는 학생은 삭제 차단 (무결성/운영 안정성 안내 메시지 제공)
- 추가/삭제 성공/실패 메시지 및 처리 중 중복 클릭 방지 UI 반영

--------------------------------------------------
작업 로그 (2026-05-13 - 갤러리 Vercel Blob 업로드 + Turso 저장)
--------------------------------------------------
- @vercel/blob 기반 관리자 갤러리 업로드 서버 액션 추가
  - BLOB_READ_WRITE_TOKEN 환경변수 필수 검사
  - image/*, video/* 파일만 허용
  - 파일 크기 초과(100MB) 안내 메시지 처리
- /admin/gallery 페이지를 mock에서 DB 기반으로 전환
  - 제목 + 다중 파일 업로드 UI 구현
  - 업로드 중 로딩, 성공/실패 메시지 처리
  - 업로드된 갤러리 목록(제목/타입/미리보기/업로드일) 표시
- 업로드 성공 시 gallery_items 테이블에 title/type/file_url/created_at 저장
- /gallery 공개 페이지를 getGalleryItems() 기반으로 전환
  - image 타입: 이미지 카드 렌더링
  - video 타입: 재생 가능한 video 카드 렌더링
- .env.example에 BLOB_READ_WRITE_TOKEN 항목 추가

--------------------------------------------------
작업 로그 (2026-05-13 - Solapi 문자 발송 구조 준비)
--------------------------------------------------
- Solapi SDK 기반 문자 발송 클라이언트 추가 (lib/sms/client.ts)
  - 환경변수(SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_PHONE) 기반 구성
  - sendSms(to, text) 함수 구현
  - 발송 시 sms_logs 테이블에 성공/실패 로그 저장
  - 환경변수 누락 시 실제 발송 스킵 + 개발 모드 콘솔 fallback 출력
- 문자 템플릿 모듈 추가 (lib/sms/templates.ts)
  - getSmsTemplate(templateName, variables)
  - 템플릿 목록: sponsorship_received, admin_new_sponsorship, sponsorship_confirmed, recurring_reminder, admin_daily_call_list
- 문자 발송 서비스 함수 추가 (lib/sms/service.ts)
  - sendSponsorshipReceivedSms(sponsorshipId)
  - sendAdminNewSponsorshipSms(sponsorshipId)
  - sendSponsorshipConfirmedSms(sponsorshipId)
  - sendRecurringReminderSms(sponsorshipId)
  - sendAdminDailyCallListSms()
- 기존 기능 연결
  - 후원 신청 접수 성공 시 관리자 알림 문자 발송 시도
  - 입금완료 처리 시 후원자 완료 문자 발송 시도
  - 문자 발송 실패가 핵심 후원 플로우를 깨뜨리지 않도록 예외 분리 처리
- /admin/messages 페이지 보강
  - 문자 템플릿 목록 표시
  - sms_logs 기반 발송 이력 표시
  - 최근 성공/실패/대기 현황 표시
  - 수동 발송 기능은 준비중 placeholder 유지
- .env.example에 Solapi 관련 환경변수 추가
  - SOLAPI_API_KEY
  - SOLAPI_API_SECRET
  - SOLAPI_SENDER_PHONE
  - ADMIN_NOTIFICATION_PHONE

--------------------------------------------------
작업 로그 (2026-05-14 - 관리자 대시보드 DB 운영 현황 연결)
--------------------------------------------------
- /admin/dashboard mock import 제거 및 repository 기반 데이터 로딩으로 전환
  - getStudents()
  - getSponsorships()
  - getSmsLogs()
  - getGalleryItems()
- 운영 통계 11개 항목 구현
  - 전체 학생 수
  - 결연 완료 학생 수
  - 결연 대기 학생 수
  - 입금 대기 신청 수
  - 입금 완료 신청 수
  - 취소 신청 수
  - 일시후원 수
  - 정기후원 수
  - 최근 30일 문자 발송 수
  - 최근 30일 문자 실패 수
  - 갤러리 등록 수
- 결연 진행률 섹션 추가
  - matched 학생 수 / 전체 학생 수 기준 퍼센트 계산 및 표시
- 최근 후원 신청 목록(최대 10건) 구현
  - 후원자 이름, 학생 공개 표시명, 상태, 신청일 표시
- 오늘 연락할 후원자 목록 구현
  - 입금대기 신청 기준
  - 후원자 이름, 전화번호, 학생 공개 표시명, 신청일 표시
- 빈 상태/DB 오류 안내 처리
  - DB 로딩 실패 시 안내 메시지 노출
  - 최근 신청/연락 대상이 없을 때 빈 상태 문구 노출

--------------------------------------------------
작업 로그 (2026-05-14 - 학생 프로필 이미지 연결/적용)
--------------------------------------------------
- Profile1(남학생), Profile2(여학생) 이미지를 public 정적 경로로 정리
  - public/students/profiles/male
  - public/students/profiles/female
- 학생 프로필 이미지 매핑 유틸 추가
  - lib/students/profile-images.ts
  - gender + studentId 기반으로 성별별 이미지 경로를 안정적으로 계산
- UI fallback 보강
  - 이미지 로딩 실패 시 fallback.svg로 대체
  - profile_image_url 값이 비어 있으면 자동 매핑 경로로 보정
- 학생 카드 UI 반영
  - 홈 대표 학생 카드
  - /students 학생 카드
  - /admin/students 학생 썸네일 카드
  - /students/[studentId]/sponsorship 신청 페이지 요약 카드
- seed 데이터 반영
  - lib/db/seed.sql에 gender 기준 profile_image_url UPDATE 구문 추가
  - 남학생은 male 경로, 여학생은 female 경로로만 연결
- 신규 학생 생성 반영
  - createStudent(repository) 시 profile_image_url 자동 할당
- mock 데이터 반영
  - lib/mock-data.ts students 배열에 profileImageUrl 자동 매핑 적용

--------------------------------------------------
작업 로그 (2026-05-14 - 관리자 설정 페이지 DB CRUD 연결)
--------------------------------------------------
- /admin/settings 페이지의 mock(adminContacts) 의존 제거
- settings repository 기반 조회 연결
  - getSettings()로 설정값 로드
- settings 저장 서버 액션 추가
  - app/admin/(panel)/settings/actions.ts
  - upsertSetting(setting_key, setting_value) 기반 저장
- 설정 키 매핑 유틸 추가
  - lib/settings/admin-settings.ts
  - 기본값 + DB값 병합 로직
- 관리자 설정 UI를 클라이언트 매니저 컴포넌트로 전환
  - components/admin/admin-settings-manager.tsx
  - 저장 성공/실패 피드백 메시지 표시
  - 저장 중 버튼/입력 비활성화 처리
- 저장 버튼 문구를 Mock에서 실제 저장 문구로 변경
  - "설정 저장 (Mock)" -> "설정 저장"
- 관리 항목 반영
  - 관리자 알림 전화번호
  - 문자 발신 번호 표시
  - 일일 연락 알림 발송 시간
  - 사이트 공개 여부
  - 후원 신청 가능 여부
  - 기본 후원 금액
  - 전체 목표 학생 수
- seed 기본 설정값 확장
  - sms_sender_phone_display
  - site_public_enabled
  - sponsorship_request_enabled
  - default_sponsorship_amount
  - target_student_count

--------------------------------------------------
작업 로그 (2026-05-14 - 운영 폴리시/UI·SEO·예외처리 개선)
--------------------------------------------------
- UI polish
  - 공통 디자인 토큰/테이블/버튼/hover 스타일 정리 (`app/globals.css`)
  - 공개 페이지(홈/학생/학교소개/프로젝트/갤러리) 메타/카드/여백/문구 톤 정리
  - 관리자 페이지 테이블 가독성 개선(`data-table`) 및 빈 상태 카드/토스트 스타일 통일
  - 상태 뱃지 시각 개선(점 아이콘 + 경계 + 대비 강화)
- SEO 적용
  - 루트 metadata 강화 (title template, keywords, openGraph, twitter, favicon)
  - 페이지별 metadata 보강 (홈/학생/학교 소개/프로젝트/갤러리)
  - `app/sitemap.ts`, `app/robots.ts` 추가
  - 관리자 영역 noindex 처리 (`/admin`, `/admin/login`, `/admin/(panel)`)
- 운영 예외 처리
  - 전역 `not-found.tsx`, `error.tsx`, `loading.tsx` 추가
  - 공개/관리자 세그먼트 로딩(`(public)/loading.tsx`, `admin/(panel)/loading.tsx`) 추가
  - 관리자 패널 전용 에러 바운더리(`admin/(panel)/error.tsx`) 추가
  - 미인증 관리자 접근 시 로그인 안내 문구 강화 (middleware query 전달)
  - 후원 상태 변경 후 문자 발송 실패 시 성공/실패 분리 메시지 처리
- 성능 개선
  - 갤러리/관리자 갤러리 이미지 렌더링을 Next/Image로 통일
  - route-level loading UI로 체감 로딩 개선
  - 관리자 목록 화면의 검색/필터 계산은 memoization 기반으로 유지
- 운영 UX 개선
  - 공통 `FeedbackToast` 적용(학생/결연/갤러리/설정/후원 신청 오류)
  - 결연 관리 상태 변경 confirm + 저장 중 disabled + 동일 상태 변경 방지
  - 결연/문자/대시보드에서 전화/이메일 복사 버튼 추가
  - 관리자 날짜 표기 `formatDateTimeKorean`으로 통일
  - 학생/결연 관리에 검색 초기화 UX 추가
- 접근성 개선
  - 버튼/요소 aria-label 보강(모바일 메뉴, 복사 버튼, 상태 저장, 메시지 상세)
  - 모달 ESC 닫기 및 배경 클릭 닫기 지원
  - 입력 라벨 연결 점검 및 최소 터치 영역 유지

--------------------------------------------------
작업 로그 (2026-05-14 - 배포 준비 최종 점검)
--------------------------------------------------
- 배포 전 체크리스트 문서 추가
  - `DEPLOY_CHECKLIST.md` 생성
  - 환경변수/Turso/Vercel Blob/Solapi/관리자 인증/SEO/스모크 테스트 항목 정리
- Next.js 16 권장 컨벤션 반영
  - `middleware.ts` -> `proxy.ts`로 마이그레이션
  - 관리자 보호 라우트 인증 로직은 유지
- 공개 홈 페이지 DB 기반 운영 데이터로 전환
  - 학생/후원/설정 정보를 repository로 조회
  - 목표 학생 수(`target_student_count`) 설정값 반영
  - 결연 통계/대표 학생/공개 응원 메시지를 실제 데이터 기반으로 표시
  - DB 조회 실패 시 안내 메시지 표시
- 공개 프로젝트 페이지에서 불필요한 mock import 제거
  - 후원금 사용처 데이터는 페이지 내부 상수로 유지
- 후원 정책 유틸 정리
  - `lib/sponsorship/policy.ts` 신설
  - 기존 `mock-flow` 의존 제거 및 관련 import 전환
- 미사용 mock 데이터 파일 정리
  - `lib/mock-data.ts` 삭제

--------------------------------------------------
작업 로그 (2026-05-15 - 운영 전 버그 수정/기능 보강)
--------------------------------------------------
- 관리자 갤러리 삭제 기능 추가
  - `/admin/gallery` 항목별 삭제 버튼 + confirm dialog 추가
  - DB(`gallery_items`) 삭제 구현
  - Vercel Blob 파일 삭제 시도 및 실패 시 DB 삭제 성공과 분리 안내
  - 삭제 후 `/gallery` 공개 목록 즉시 반영
- 관리자 학생 상태 초기화 기능 추가
  - `/admin/students`에 "전체 학생 신청 가능 상태로 초기화" 버튼 추가
  - confirm 후 `students.sponsorship_status`를 일괄 `available`로 변경
  - 운영 초기화 목적 안내 문구 반영
- 관리자 문자 템플릿 수동 발송 구현
  - `/admin/messages`에 템플릿별 수동 발송 폼 추가
  - 전화번호 + 템플릿 변수(name/studentPublicName/amount 포함) 입력 지원
  - 서버 액션에서 템플릿 렌더 후 `sendSms()` 호출
  - 발송 결과 `sms_logs` 기록 유지
  - Solapi 환경변수 누락 시 개발 모드 fallback 안내 문구 강화
- 위험한 전체 초기화 기능 제거
  - `/admin/sponsorships`의 전체 초기화 버튼 제거
  - 운영 화면에서 전체 삭제/초기화 동작이 노출되지 않도록 정리
  - `sms_logs`, `gallery_items`, `settings`는 유지
- 손편지 없는 학생 UI 처리
  - `letter_image_url`이 비어 있으면 "손편지 없음" 표시
  - 손편지 버튼을 disabled 처리하고 빈 모달이 열리지 않도록 수정
  - 홈 대표 학생 카드와 `/students` 목록 카드에 동일 정책 적용
- 관리자 학생 손편지 업로드/관리 추가
  - `/admin/students`에서 학생별 손편지 이미지 업로드/교체/삭제 지원
  - 업로드 파일은 Vercel Blob 저장 후 `students.letter_image_url` 갱신
  - 기존 손편지 미리보기/원본 보기/삭제 동작 추가
- 학생 만나기 필터/정렬 실제 동작 수정
  - 성별/학년/결연상태 필터 실제 적용
  - 정렬(기본순, 학년 낮은/높은 순, 신청 가능 우선, 결연 완료 우선) 적용
  - 필터/정렬 변경 시 목록 즉시 갱신
- 프로젝트 안내 페이지 정리
  - `/project`의 "후원금 사용처" 섹션 삭제
  - 생활관비 후원 필요성과 결연 절차 설명은 유지
