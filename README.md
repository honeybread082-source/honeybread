# 꿀빵지 · Honeybread

## 구조
```
index.html            메인(프로필)
schedule/index.html   일정
work/index.html       업보
dress/index.html      옷장
avatar/index.html     아바타 정보
admin/index.html      관리자
overlay/index.html    OBS 오버레이
app.js                공통 DB 로더  ← 신규
supabase.js  fx.js  style.css  supabase_all.sql
```

## 배포
1. Supabase 새 프로젝트 → SQL Editor에 `supabase_all.sql` 전체 Run
   (테이블 + 프로필 기본값 + 아바타 크레딧 49행 자동 시드)
2. `supabase.js` 상단 2줄:
   const SUPABASE_URL  = 'https://{{SUPABASE프로젝트ID}}.supabase.co';
   const SUPABASE_ANON = '{{SUPABASE_ANON_KEY}}';
3. `overlay/index.html` 안 {{SUPABASE...}} 도 채우기
4. `admin/index.html` 의 {{관리자비밀번호}} 교체 (버리는 비번)
5. GitHub 업로드 → Cloudflare Pages (빌드설정 비움 / Framework: None)
6. grep -r "{{" . → 잔여 0 확인

## 관리자에서 수정 가능한 것
- 프로필 탭: 이름/영문/한줄/생일MD, 프로필 5칸, **이미지 URL 3종**(대표사진·큰사진·배너),
  좋아하는것 4, 특이사항 2, TMI 6, 링크 3, 아바타 안내문 → 저장 시 전 페이지 반영
- 이번 주 방송: 요일별 방송/휴방/낮방 + 시간 (메인·일정 공통)
- 규칙 탭: 그룹 추가/삭제, 항목 편집, 경고문, 하단 문구
- 일정 탭: 날짜·제목·시간·색상 추가/삭제 → 달력에 반영
- 업보 탭: 종류 / 시청자 / 카운트(시청자 × 종류)
- 옷장 탭: 이름·분류·이미지URL·설명·NEW 체크 → 포스터/앨범 자동 분류
- 아바타 탭: 크레딧 추가/삭제 (섹션·그룹·역할·이름·부스링크)
- 문의 탭: 받은 문의 확인/삭제

## 이미지 = 전부 링크(URL) 방식
Storage 업로드 없음. SOOP 비공개 게시판에 올린 뒤 이미지 우클릭 → "이미지 주소 복사".
페이지에서 `referrerpolicy="no-referrer"` 자동 적용됨.

## SOOP
- 방송국: https://www.sooplive.com/station/2059865
- 프사: https://profile.img.sooplive.co.kr/LOGO/20/2059865/2059865.jpg
