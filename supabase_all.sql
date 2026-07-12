-- =============================================================
-- 버추얼 팬페이지 템플릿 — Supabase 전체 셋업 SQL (한 번에 붙여넣기용)
-- 사용법: Supabase → SQL Editor → 아래 전체 복붙 → Run.
-- ✅ 여러 번 다시 실행해도 안전 (CREATE ... IF NOT EXISTS / DROP POLICY IF EXISTS).
-- ✅ 모든 표는 anon(공개) 키로 읽기+쓰기 허용 — 관리자 페이지가 anon 키로 동작하므로 필수.
-- 안 쓰는 카테고리가 있어도 표는 그냥 둬도 무방(빈 표는 아무 영향 없음).
-- 이미지는 "링크" 방식이라 Storage(버킷) 없이도 동작합니다.
-- =============================================================


-- ── 프로필 (메인: id=1 한 칸에 JSON 저장) ──
CREATE TABLE IF NOT EXISTS profile (
  id         BIGINT PRIMARY KEY,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profile_all" ON profile;
CREATE POLICY "profile_all" ON profile FOR ALL USING (true) WITH CHECK (true);


-- ── 공지 ──
CREATE TABLE IF NOT EXISTS notice (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT,
  pinned     BOOLEAN DEFAULT FALSE,
  image_url  TEXT,
  images     JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notice ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE notice ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE notice ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notice_all" ON notice;
CREATE POLICY "notice_all" ON notice FOR ALL USING (true) WITH CHECK (true);


-- ── 일기 ──
CREATE TABLE IF NOT EXISTS diary (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT,
  mood       TEXT,
  diary_date DATE,
  image_url  TEXT,
  images     JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE diary ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE diary ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE diary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diary_all" ON diary;
CREATE POLICY "diary_all" ON diary FOR ALL USING (true) WITH CHECK (true);


-- ── 일기 댓글 (일기 페이지에서 사용) ──
CREATE TABLE IF NOT EXISTS comments (
  id         BIGSERIAL PRIMARY KEY,
  diary_id   BIGINT NOT NULL,
  nickname   TEXT,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_all" ON comments;
CREATE POLICY "comments_all" ON comments FOR ALL USING (true) WITH CHECK (true);


-- ── 일정 (달력) — 색/하이라이트/2부/설명 포함 ──
CREATE TABLE IF NOT EXISTS schedule (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  time        TEXT,
  type        TEXT DEFAULT '일반',          -- 일반 / 특별 / 콜라보 / 휴방
  note        TEXT,
  color       TEXT DEFAULT 'green',
  highlight   BOOLEAN DEFAULT FALSE,
  time2       TEXT,
  title2      TEXT,
  type2       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS color       TEXT DEFAULT 'green';
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS highlight   BOOLEAN DEFAULT FALSE;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS time2       TEXT;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS title2      TEXT;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS type2       TEXT;
ALTER TABLE schedule ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "schedule_all" ON schedule;
CREATE POLICY "schedule_all" ON schedule FOR ALL USING (true) WITH CHECK (true);


-- ── 노래책: 커버곡 ──
CREATE TABLE IF NOT EXISTS songs (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  artist     TEXT,
  genre      TEXT DEFAULT '기타',
  difficulty INT  DEFAULT 3,
  memo       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "songs_all" ON songs;
CREATE POLICY "songs_all" ON songs FOR ALL USING (true) WITH CHECK (true);


-- ── 노래책: 오리지널 곡 (SOOP VOD) ──
CREATE TABLE IF NOT EXISTS original_songs (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  vod_id     TEXT,
  thumbnail  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE original_songs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "original_songs_all" ON original_songs;
CREATE POLICY "original_songs_all" ON original_songs FOR ALL USING (true) WITH CHECK (true);


-- ── 옷장 (헤어 / 렌즈 / 의상) — 이미지는 image_url(링크) ──
CREATE TABLE IF NOT EXISTS public.dress_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL DEFAULT 'hair',   -- hair / lens / outfit
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_key   TEXT DEFAULT '',                -- (안 씀) R2용 키
  image_url   TEXT DEFAULT '',                -- 이미지 링크(붙여넣은 주소)
  badges      JSONB DEFAULT '[]',             -- 예: [{"label":"NEW"}]
  is_event    BOOLEAN DEFAULT FALSE,
  glow_color  TEXT DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dress_items_category ON public.dress_items(category);
ALTER TABLE public.dress_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "dress_all" ON public.dress_items;
CREATE POLICY "dress_all" ON public.dress_items FOR ALL USING (true) WITH CHECK (true);


-- ── 업보: 시청자 ──
CREATE TABLE IF NOT EXISTS viewers (
  id         BIGSERIAL PRIMARY KEY,
  nickname   TEXT NOT NULL,
  soop_id    TEXT,
  memo       TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE viewers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "viewers_all" ON viewers;
CREATE POLICY "viewers_all" ON viewers FOR ALL USING (true) WITH CHECK (true);


-- ── 업보: 타입(종류) ──
CREATE TABLE IF NOT EXISTS upbo_types (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT DEFAULT '일반',            -- 일반 / 이벤트
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE upbo_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "upbo_types_all" ON upbo_types;
CREATE POLICY "upbo_types_all" ON upbo_types FOR ALL USING (true) WITH CHECK (true);


-- ── 업보: 카운트 (시청자 × 타입 = 횟수) ──
CREATE TABLE IF NOT EXISTS upbo_counts (
  id         BIGSERIAL PRIMARY KEY,
  viewer_id  BIGINT NOT NULL,
  type_id    BIGINT NOT NULL,
  count      INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (viewer_id, type_id)
);
ALTER TABLE upbo_counts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "upbo_counts_all" ON upbo_counts;
CREATE POLICY "upbo_counts_all" ON upbo_counts FOR ALL USING (true) WITH CHECK (true);


-- ── 문의함 ──
CREATE TABLE IF NOT EXISTS inquiries (
  id         BIGSERIAL PRIMARY KEY,
  nickname   TEXT,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inquiries_all" ON inquiries;
CREATE POLICY "inquiries_all" ON inquiries FOR ALL USING (true) WITH CHECK (true);


-- ── (옷장 OBS 오버레이 쓸 때만) "지금 트는 노래" 상태 1행 ──
CREATE TABLE IF NOT EXISTS public.overlay_state (
  id          INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  song_title  TEXT DEFAULT '',
  song_artist TEXT DEFAULT '',
  is_visible  BOOLEAN DEFAULT FALSE,          -- ⚠️ OBS에 보이려면 true
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.overlay_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.overlay_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "overlay_all" ON public.overlay_state;
CREATE POLICY "overlay_all" ON public.overlay_state FOR ALL USING (true) WITH CHECK (true);


-- ── 프로필 기본 행(id=1) 보장 ──
-- ⚠️ 한 Supabase 프로젝트는 "한 사람"에게만 쓰세요.
--    이미 다른 사람 데이터가 들어있는 프로젝트를 재사용하면, 아래 INSERT는
--    DO NOTHING 때문에 옛 데이터를 덮어쓰지 않습니다(= 프사·이름이 옛 사람으로 보임).
--    새 사람으로 갈아끼울 땐, 아래 줄의 맨 앞 '--' 를 지워서 한 번 실행하면 프로필이 비워집니다.
-- DELETE FROM profile WHERE id = 1;
INSERT INTO profile (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;

-- 끝! 이미지는 전부 "링크" 방식이라 Storage 설정이 필요 없습니다.


-- =============================================================
-- 🆕 꿀빵지 추가 스키마
-- =============================================================

-- ── 아바타 정보: 크레딧 (아바타 / 의상 / 헤어) ──
CREATE TABLE IF NOT EXISTS avatar_credits (
  id          BIGSERIAL PRIMARY KEY,
  section     TEXT NOT NULL DEFAULT 'cloth',  -- avatar / cloth / hair
  group_label TEXT DEFAULT '',                -- (avatar 전용) 헤드 / 헤어 / 몸 베이스 / 귀·꼬리
  role        TEXT DEFAULT '',                -- (avatar 전용) 원화 / 모델링 / 텍스쳐 …
  name        TEXT NOT NULL,                  -- 표시 이름
  url         TEXT DEFAULT '',                -- 부스 링크 (없으면 빈칸 → 링크 없이 텍스트)
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_avatar_credits_section ON avatar_credits(section);
ALTER TABLE avatar_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "avatar_credits_all" ON avatar_credits;
CREATE POLICY "avatar_credits_all" ON avatar_credits FOR ALL USING (true) WITH CHECK (true);


-- ── 프로필 기본값 시드 (id=1) ──
INSERT INTO profile (id, data) VALUES (1, '{
  "soop-id": "2059865",
  "avatar": "",
  "info-name": "꿀빵지",
  "info-en": "Honeybread",
  "info-catchphrase": "빵집 골목 사이에서 태어난 개냥이",
  "info-birth": "10월 15일",
  "info-species": "개냥이",
  "info-mbti": "ISFP",
  "info-fandom": "왕밤",
  "info-debut": "12월 24일",
  "birth-md": "10-15",
  "like1": "딸기", "like2": "빵", "like3": "단 것", "like4": "얼죽아",
  "dislike1": "향신료 못먹음", "dislike2": "거미공포증",
  "tmi1": "잘 때도 꼬리 만지면 깨요",
  "tmi2": "알람은 10개 이상 맞춰두는 편",
  "tmi3": "빵 구우면 기분이 좋아져요",
  "tmi4": "밤샘 방송 끝나면 꼭 낮잠 잡니다",
  "tmi5": "노래방 마이크에 집착함",
  "tmi6": "가끔 방송 중에 혼잣말이 많아져요",
  "main-photo": "",
  "main-bigpic": "",
  "banner": "",
  "link-soop": "https://www.sooplive.com/station/2059865",
  "link-yt": "",
  "link-x": "",
  "rules": "[{\"t\":\"빨간약 관련 금지\",\"items\":[\"빵지가 일정부분 보여주더라도 유포나 언급 X\"]},{\"t\":\"시청자간 사담 · 닉네임 언급 금지\",\"items\":[\"여러분들이 소통해야 하는 사람은 오직 \\\"빵지\\\" 입니다\"]},{\"t\":\"단답 금지\",\"items\":[\"기본적인 ㅇㅎ 같은 건 OK\",\"ㅇㅇ 같은 성의없어 보이는 단답은 금지\"]},{\"t\":\"팬아트 규칙\",\"items\":[\"AI 빵지 보여주는 조건으로 허용\",\"중요부위 노출 X 전제하에 수위 조절 자유\"]},{\"t\":\"방송 흐름 끊지 않기\",\"items\":[\"일기장, TMI, 빵지방종 제외 자러갈게요 등\",\"뜬금없는 뻐꾸기 등은 게시판으로\",\"소통과는 상관없는 질문이나 채팅\",\"소통과는 관련 없는 타스 등\"]},{\"t\":\"뇌절 및 리모컨 금지\",\"items\":[\"너무 심한 훈수\",\"2절에 3절, 4절까지 가는 개드립\",\"주접도 적당히\"]},{\"t\":\"정치 · 종교 등 언급 금지\",\"items\":[\"칼 벤 입니다\"]}]",
  "rules-warn": "거미공포증이 있습니다.\n트라우마 / 공포증 관련 놀리는 발언은 즉시 강퇴입니다.",
  "rules-foot": "제제 및 규칙들은 언제나 빵덜식",
  "week": "[{\"s\":\"방송\",\"t\":\"20:00\"},{\"s\":\"방송\",\"t\":\"21:00\"},{\"s\":\"휴방\",\"t\":\"\"},{\"s\":\"방송\",\"t\":\"20:00\"},{\"s\":\"방송\",\"t\":\"22:00\"},{\"s\":\"방송\",\"t\":\"19:00\"},{\"s\":\"낮방\",\"t\":\"15:00\"}]",
  "avatar-note": "헤드, 귀, 꼬리의 저작권은 빵지에게 있습니다.",
  "avatar-intro": "숲에서 활동하는 빵지의 관련된 원저작자 크레딧입니다 (≧∇≦)ﾉ",
  "avatar-discord": "bread1015_"
}'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- ── 아바타 크레딧 시드 (한 번만) ──
INSERT INTO avatar_credits (section, group_label, role, name, url, sort_order)
SELECT * FROM (VALUES
  ('avatar','헤드','원화','U''s','',0),
  ('avatar','헤드','모델링','home','',1),
  ('avatar','헤드','텍스쳐','하리오','',2),
  ('avatar','헤어','디자인','좋냥이','',3),
  ('avatar','헤어','모델링','Home','',4),
  ('avatar','몸 베이스','아이리','キュビ','https://kyubihome.booth.pm/',5),
  ('avatar','몸 베이스','시오','Chocolate rice','https://chocolaterice.booth.pm/',6),
  ('avatar','몸 베이스','시나노','ぽんでろ','https://ponderogen.booth.pm/',7),
  ('avatar','귀 · 꼬리','디자인','좋냥이','',8),
  ('avatar','귀 · 꼬리','모델링','광부','',9),
  ('cloth','','','FOXYPLAY','https://foxyplay.booth.pm/',0),
  ('cloth','','','Koukla','https://kouklaspizzas.booth.pm/',1),
  ('cloth','','','Today cloth','https://todaycloth.booth.pm/',2),
  ('cloth','','','LookVook','https://lookvook.booth.pm/',3),
  ('cloth','','','Radiant-iseo','https://radiant-iseo.booth.pm/',4),
  ('cloth','','','Z9','https://meru0029.booth.pm/',5),
  ('cloth','','','bunnyhugs','https://bunnyhugs.booth.pm/',6),
  ('cloth','','','Libero Boutique','https://liberoboutique.booth.pm/',7),
  ('cloth','','','ALICE','https://aliceinshelter.booth.pm/',8),
  ('cloth','','','NookNook','https://osatoubox.booth.pm',9),
  ('cloth','','','PINK♡PUDDING','https://pinkpudding.booth.pm/',10),
  ('cloth','','','Oblique','https://obliquevrc.booth.pm/',11),
  ('cloth','','','Koukla','https://kouklaspizzas.booth.pm/',12),
  ('cloth','','','Overay','https://overay.booth.pm/',13),
  ('cloth','','','R&Coco.','https://r-coco.booth.pm/',14),
  ('cloth','','','くれこ','https://kurekono3d.booth.pm/',15),
  ('cloth','','','Ganger','https://glitchganger.booth.pm/',16),
  ('cloth','','','LINGO CIDER','https://lingocider.booth.pm/',17),
  ('cloth','','','Lielii','https://lielsshop.booth.pm/',18),
  ('cloth','','','MONG HAUS','https://monghaus.booth.pm/',19),
  ('cloth','','','MONG HAUS','https://monghaus.booth.pm/',20),
  ('cloth','','','EdgeMode','https://edgemode.booth.pm/',21),
  ('cloth','','','ventus','https://ventus.booth.pm/',22),
  ('cloth','','','Vinsen','https://vinsen.booth.pm/',23),
  ('cloth','','','macro0622','https://macro0622.booth.pm/',24),
  ('hair','','','WishList','https://wishlist.booth.pm/',0),
  ('hair','','','YM STORE','https://yueby.booth.pm/',1),
  ('hair','','','LookVook','https://lookvook.booth.pm/',2),
  ('hair','','','Chocolate rice','https://chocolaterice.booth.pm/',3),
  ('hair','','','山坂豆腐店','https://yamasakatofu.booth.pm/',4),
  ('hair','','','Yune-Yune','https://yune-yune.booth.pm/',5),
  ('hair','','','LOVACE','https://loverace.booth.pm/',6),
  ('hair','','','Nanaha','https://joe61.booth.pm/',7),
  ('hair','','','SOUR FLAVOR','https://sourflavor.booth.pm/',8),
  ('hair','','','Kyee_N','https://kyeen.booth.pm/',9),
  ('hair','','','MONG HAUS','https://monghaus.booth.pm/',10),
  ('hair','','','osori','https://osori.booth.pm/',11),
  ('hair','','','Dana','https://danastudio.booth.pm/',12),
  ('hair','','','daisy','https://loverace.booth.pm/',13)
) AS v(section,group_label,role,name,url,sort_order)
WHERE NOT EXISTS (SELECT 1 FROM avatar_credits);
