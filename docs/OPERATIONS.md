# Awesome Books Asia 운영 매뉴얼

> www.awesomebooks.asia · 2026년 8월 기준
> 대상: 운영자 (관리자 계정 보유자)

---

## 1. 서비스 한눈에 보기

| 항목 | 내용 |
|---|---|
| 프로덕션 | https://www.awesomebooks.asia (apex는 www로 리다이렉트) |
| 저장소 | github.com/joeywoongsekim-pixel/awesome-books-asia (`main` 브랜치) |
| 배포 | `main`에 push하면 Vercel이 자동 배포 (약 40초) |
| DB/인증/파일 | Supabase 프로젝트 `hbsqmtdnnkzsbqxvclxf` (Awesome AI Asia 공용) |
| DNS | Cloudflare (A `76.76.21.21`, CNAME www `cname.vercel-dns.com`, 모두 DNS only) |
| 언어 | 8개 — EN·KO·JA·FIL·DE·FR·ES·PT |
| 관리자 | joey.woongse.kim@awesomeai.asia · akira.murata@awesomeai.asia · contact@awesomebooks.asia |

**현재 비즈니스 모델**
- 단권 구매: 사이트에서 팔지 않음 → 상세 페이지의 구매처 링크(Amazon·교보문고·YES24·알라딘)로 연결
- 열람 권한: **초대 쿠폰 전용**. 쿠폰 없이 가입 불가, 쿠폰 등록 시 구독 기간만큼 전권 열람
- 유료 구독: 카탈로그 200권 도달 시 결제 활성화 예정 (코드 준비 완료, 휴면 상태)

---

## 2. 최초 1회 설정 (아직 남은 것)

Supabase 대시보드 → 프로젝트 → **Authentication**:

1. **URL Configuration**
   - Site URL: `https://www.awesomebooks.asia`
   - Redirect URLs에 추가: `https://www.awesomebooks.asia/api/auth/callback`
   - (이걸 안 하면 가입 확인 메일의 링크가 localhost로 갑니다)
2. **Confirm email 정책 결정** (Sign In / Providers → Email)
   - 켜짐(기본): 가입 후 확인 메일 클릭 필요 — 스팸 계정 차단, 대신 메일 수신이 필수
   - 꺼짐: 즉시 가입 — 초대 쿠폰이 이미 문지기 역할을 하므로 꺼도 안전합니다 (운영 편의상 추천)
3. **Google 로그인** (선택): Providers → Google에 OAuth 클라이언트 ID/Secret 등록. 등록 전까지 Google 버튼은 오류가 납니다 — 급하지 않으면 나중에

---

## 3. 지인 초대하기 (핵심 운영 흐름)

### 3-1. 관리자 본인 가입 (최초)

1. 부트스트랩 쿠폰 코드(별도 전달됨) 하나를 들고 https://www.awesomebooks.asia/ko/auth/signup 접속
2. 쿠폰 코드 + 관리자 이메일(위 3개 중 하나) + 비밀번호로 가입
3. (Confirm email이 켜져 있으면) 메일의 확인 링크 클릭
4. 로그인하면 쿠폰이 자동 등록되고, https://www.awesomebooks.asia/ko/admin 이 열립니다

### 3-2. 초대 쿠폰 발급

1. `/ko/admin` → **쿠폰** 탭
2. 유형 선택:
   - **365일 구독** ← 지인 초대용 표준 (1년 무료 열람)
   - 30일 구독 / 단권(책 지정)도 가능
3. 수량(1~100)·만료일(선택) 입력 → **쿠폰 생성**
4. 목록에서 `ABA-XXXX-XXXX` 코드 복사 → 지인에게 전달

전달 문구 예시:
> 어썸북스아시아에 초대합니다. https://www.awesomebooks.asia/ko/auth/signup 에서
> 쿠폰 코드 `ABA-XXXX-XXXX` 로 가입하시면 1년간 모든 책을 무료로 읽으실 수 있습니다.

### 3-3. 초대받은 사람의 경험

가입(코드 필수) → 첫 로그인 때 코드 자동 등록 → 서재·리더에서 전권 열람.
자동 등록이 안 된 경우(다른 기기에서 메일 확인 등)에는 `/ko/redeem` 에서 코드를 직접 입력하면 됩니다.

- 코드는 **1회용**입니다. 등록 즉시 잠기고 누가 언제 썼는지 기록됩니다
- 쿠폰 없는 방문자: 책마다 앞 3스프레드(샘플)만 읽을 수 있고, 그 다음엔 가입 안내가 뜹니다

---

## 4. 도서 관리

`/ko/admin` → **도서** 탭

### 4-1. 새 도서 등록

**새 도서** 버튼 → 입력:

| 필드 | 설명 |
|---|---|
| 제목 / 저자 | 표기 그대로 |
| 슬러그 | URL 이름 (예: `ai-bible`) — 소문자·하이픈만, 등록 후 변경 비권장 |
| 분야 | `ai` / `edu` / `kids` |
| 가격(USD) | 서점 판매가 표시용. 0이면 구독 전용 |
| 난이도 | 1~3 |
| 쪽수 / 출간일 / 신간 표시 | 상세 페이지 표기용 |

### 4-2. 파일 업로드 (PDF/EPUB)

도서 편집 화면 하단에서 언어(EN/KO/JA)별로 **PDF 업로드 / EPUB 업로드**.
- 파일은 비공개 스토리지에 `슬러그/언어.pdf` 형태로 저장되고, 열람 권한이 있는 독자에게만 10분짜리 서명 URL로 제공됩니다
- 업로드 완료 시 ✓ 표시

### 4-3. 알아둘 것 (중요)

- 현재 **홈·서점 화면의 책 목록은 코드에 내장된 초기 6권**을 보여줍니다. 관리자에서 등록한 책은 권한·파일·200권 카운트에는 반영되지만, **스토어프론트 노출은 아직 수동**입니다 — 등록이 본격화되면 "스토어프론트를 DB와 연동"하는 작업을 요청해 주세요 (예정된 다음 단계)
- **200권 도달 시**: 책 수는 DB 기준으로 자동 계산되므로, 200번째 책이 등록되면 요금제 안내 문구 기준이 충족됩니다. 이때 결제(§6)를 켜면 됩니다

---

## 5. 회원·권한 구조 (참고)

| 개념 | 의미 |
|---|---|
| 쿠폰 (coupons) | 초대장 = 이용권. 단권/30일/365일 |
| 구매 (purchases) | 단권 영구 소장 (쿠폰 또는 향후 결제로 생성) |
| 구독 (subscriptions) | 기간제 전권 열람. `current_period_end` 지나면 자동 만료 |
| 샘플 | 누구나 책마다 앞 3스프레드 |
| 진도·북마크 | 로그인 독자는 읽던 위치·북마크가 자동 저장 |

관리자 추가/제거는 SQL로만 가능합니다 (Supabase SQL Editor):
```sql
insert into admin_emails (email) values ('new.admin@example.com');
delete from admin_emails where email = 'old.admin@example.com';
```

---

## 6. 유료 전환 (200권 도달 시)

결제 코드는 이미 배포돼 있고 환경변수만 없어서 꺼져 있습니다.

1. 결제사 결정: Stripe(해외 법인 필요 — 일본 GK 또는 에스토니아 OÜ) 또는 Airwallex(한국 법인 가능, 수납 기능 확인 필요)
2. Stripe 기준: Vercel → 프로젝트 → Settings → Environment Variables에
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `SUPABASE_SERVICE_ROLE_KEY` 입력 → 재배포
3. Stripe 대시보드에 웹훅 엔드포인트 등록: `https://www.awesomebooks.asia/api/stripe-webhook`
   (이벤트: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
4. 가입 페이지의 초대 쿠폰 필수 조건 해제는 개발 작업 1건 (요청 시 즉시)

---

## 7. 콘텐츠·번역·배포 (개발 워크플로)

- 사이트 문구는 `messages/en.json`(영어 원본)에서 관리 → `npm run i18n` 실행 시 7개 언어 파일 재생성 (번역 캐시 `scripts/translation-cache.json` 커밋 관리, `ANTHROPIC_API_KEY`가 있으면 신규 문구 자동 번역)
- `npm run i18n:check` — 번역 누락 검사 (누락 시 실패)
- `npm run build` 통과 확인 후 `git push` → Vercel 자동 배포
- DB 스키마 변경 이력: `supabase/migrations/` (적용은 Supabase SQL Editor 또는 Claude에게 요청)

---

## 8. 문제 해결

| 증상 | 확인 |
|---|---|
| 가입이 안 됨 ("유효하지 않은 코드") | 쿠폰이 미사용·미만료인지 관리자 쿠폰 목록에서 확인 |
| 확인 메일이 안 옴 | Supabase Auth 로그 확인, 스팸함, §2의 URL 설정 여부 |
| 가입했는데 책이 잠겨 있음 | `/ko/redeem` 에서 쿠폰 수동 등록 (자동 등록이 놓친 경우) |
| 관리자 페이지가 "권한 없음" | 로그인 이메일이 admin_emails 3개 중 하나인지, 메일 확인을 마쳤는지 |
| 파일 업로드 실패 | 관리자 계정인지 확인 후 재시도, 파일 확장자(.pdf/.epub) 확인 |
| 사이트 스타일 깨짐/구버전 | 강력 새로고침(Ctrl+Shift+R), Vercel 대시보드에서 최근 배포 상태 확인 |
| 도메인 오류 | Cloudflare DNS의 A/CNAME이 §1 값이고 "DNS only"인지 확인 |

---

## 9. 계정·자산 목록

- **GitHub**: joeywoongsekim-pixel / awesome-books-asia
- **Vercel**: 프로젝트 awesome-books-asia (GitHub 연동 자동 배포)
- **Supabase**: 프로젝트 hbsqmtdnnkzsbqxvclxf (Auth·DB·Storage)
- **Cloudflare**: awesomebooks.asia DNS (⚠️ MX smtp.google.com, NS gabia 3줄, TXT 검증 레코드는 절대 수정 금지 — 회사 메일·네임서버가 끊깁니다)
- **디자인 가이드**: `docs/` 폴더 (브랜드 v1.0 사양, 프로토타입)
- **로고 원본**: `public/logo.jpg` (원형 인장, 파비콘 `app/icon.png`)
