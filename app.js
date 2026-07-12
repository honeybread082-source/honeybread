/* ══════════════════════════════════════════════
   꿀빵지 · 공통 로더 (app.js)
   - supabase.js 의 fetchAll / insertRow 사용
   - 모든 페이지 </body> 위: supabase CDN → supabase.js → app.js
   ══════════════════════════════════════════════ */

var PROFILE = {};

/* ── 유틸 ── */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(t) { return String(t == null ? '' : t).replace(/[<>&]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }); }
function ready() { document.body.classList.add('ready'); }

/* ── SOOP 프사 ── */
function soopAvatar(id) {
  if (!id) return '';
  return 'https://profile.img.sooplive.co.kr/LOGO/' + id.slice(0, 2) + '/' + id + '/' + id + '.jpg';
}

/* ── D-Day ── */
function calcDday(md) {
  if (!md) return null;
  var p = md.split('-'), t = new Date(); t.setHours(0, 0, 0, 0);
  var b = new Date(t.getFullYear(), p[0] - 1, p[1]);
  if (b < t) b = new Date(t.getFullYear() + 1, p[0] - 1, p[1]);
  return Math.round((b - t) / 86400000);
}

/* ── 프로필 로드 (모든 페이지 공통) ── */
async function loadProfile() {
  try {
    var rows = await fetchAll('profile');
    var r = (rows || []).find(function (x) { return x.id === 1; }) || rows[0];
    PROFILE = (r && r.data) || {};
  } catch (e) { PROFILE = {}; }

  /* 텍스트 훅 */
  $$('[data-k]').forEach(function (el) {
    var k = el.dataset.k, v = PROFILE[k];
    if (v == null || v === '') return;
    if (el.tagName === 'IMG') { el.src = v; el.setAttribute('referrerpolicy', 'no-referrer'); }
    else el.textContent = v;
  });

  /* 프사 (직접 URL > SOOP 아이디) */
  var av = PROFILE['avatar'] || soopAvatar(PROFILE['soop-id']);
  if (av) $$('img[data-avatar]').forEach(function (i) { i.src = av; i.setAttribute('referrerpolicy', 'no-referrer'); });

  /* 파비콘 */
  if (av) { var f = $('link[rel="icon"]'); if (f) f.href = av; }

  /* D-Day */
  var n = calcDday(PROFILE['birth-md'] || '10-15');
  if (n !== null) $$('.dday').forEach(function (e) { e.textContent = n === 0 ? '오늘!' : 'D-' + n; });

  /* 링크 */
  var lk = { 'link-soop': 'a[data-link="soop"]', 'link-yt': 'a[data-link="yt"]', 'link-x': 'a[data-link="x"]' };
  Object.keys(lk).forEach(function (k) {
    var u = PROFILE[k]; if (!u) return;
    $$(lk[k]).forEach(function (a) { a.href = u; a.target = '_blank'; a.rel = 'noreferrer'; });
  });

  /* TMI */
  var tl = $('[data-tmi]');
  if (tl) {
    var items = [];
    for (var i = 1; i <= 8; i++) { var t = PROFILE['tmi' + i]; if (t) items.push(t); }
    if (items.length) tl.innerHTML = items.map(function (t) {
      return '<li><svg class="ic" width="13" height="13"><use href="#i-paw"/></svg><span>' + esc(t) + '</span></li>';
    }).join('');
  }

  /* 규칙 */
  var rl = $('[data-rules]');
  if (rl) {
    var groups = [];
    try { groups = JSON.parse(PROFILE['rules'] || '[]'); } catch (e) { groups = []; }
    if (groups.length) {
      var half = Math.ceil(groups.length / 2);
      var col = function (arr) {
        return '<div class="rcol">' + arr.map(function (g) {
          return '<div class="rgrp"><b class="rh">❧ ' + esc(g.t) + '</b><ul>' +
            (g.items || []).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul></div>';
        }).join('') + '</div>';
      };
      rl.innerHTML = col(groups.slice(0, half)) + col(groups.slice(half));
    }
  }
  var rw = $('[data-rules-warn]');
  if (rw && PROFILE['rules-warn']) rw.innerHTML = esc(PROFILE['rules-warn']).replace(/\n/g, '<br>');
  var rf = $('[data-rules-foot]');
  if (rf && PROFILE['rules-foot']) rf.textContent = PROFILE['rules-foot'];

  ready();
}

/* ── 이번 주 (프로필의 week JSON) ── */
function renderWeek() {
  var box = $('[data-week]'); if (!box) return;
  var W = [];
  try { W = JSON.parse(PROFILE['week'] || '[]'); } catch (e) { }
  if (!W.length) W = [{s:'방송',t:''},{s:'방송',t:''},{s:'휴방',t:''},{s:'방송',t:''},
                      {s:'방송',t:''},{s:'방송',t:''},{s:'방송',t:''}];
  var D = ['월', '화', '수', '목', '금', '토', '일'];
  box.innerHTML = W.map(function (w, i) {
    var off = w.s === '휴방';
    return '<div class="wd' + (off ? ' off' : '') + '"><em>' + D[i] + '</em><b>' + esc(w.s) + '</b>' +
      (w.t ? '<i>' + esc(w.t) + '</i>' : '') + '</div>';
  }).join('');
}

/* ── 일정 달력 ── */
var CAL_Y, CAL_M, SCHEDULE = [];
async function loadSchedule() {
  try { SCHEDULE = await fetchAll('schedule', { order: 'date' }) || []; } catch (e) { SCHEDULE = []; }
  var t = new Date(); CAL_Y = t.getFullYear(); CAL_M = t.getMonth();
  renderWeek(); renderCal();
}
function calMove(d) { CAL_M += d; if (CAL_M < 0) { CAL_M = 11; CAL_Y--; } if (CAL_M > 11) { CAL_M = 0; CAL_Y++; } renderCal(); }
function renderCal() {
  var box = $('[data-cal]'); if (!box) return;
  var ttl = $('[data-cal-title]'); if (ttl) ttl.textContent = CAL_Y + '년 ' + (CAL_M + 1) + '월';
  var first = new Date(CAL_Y, CAL_M, 1), last = new Date(CAL_Y, CAL_M + 1, 0);
  var lead = (first.getDay() + 6) % 7;                     // 월요일 시작
  var head = ['월', '화', '수', '목', '금', '토', '일'].map(function (d, i) {
    return '<div class="wh' + (i === 6 ? ' sun' : '') + '">' + d + '</div>';
  }).join('');
  var cells = '';
  for (var i = 0; i < lead; i++) cells += '<div class="cell empty"></div>';
  for (var d = 1; d <= last.getDate(); d++) {
    var ds = CAL_Y + '-' + String(CAL_M + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    var evs = SCHEDULE.filter(function (s) { return (s.date || '').slice(0, 10) === ds; });
    var wd = (new Date(CAL_Y, CAL_M, d).getDay() + 6) % 7;
    var tags = evs.map(function (e) {
      return '<span class="ev ' + (e.color || 'song') + '">' + esc(e.title) + (e.time ? ' ' + esc(e.time) : '') + '</span>';
    }).join('');
    cells += '<div class="cell' + (wd === 6 ? ' sun' : '') + (evs.length ? ' has' : '') + '"><em>' + d + '</em>' + tags + '</div>';
  }
  box.innerHTML = head + cells;
}

/* ── 업보 ── */
var VIEWERS = [], UTYPES = [], UCOUNTS = [];
async function loadUpbo() {
  try {
    VIEWERS = await fetchAll('viewers', { order: 'sort_order' }) || [];
    UTYPES = await fetchAll('upbo_types', { order: 'sort_order' }) || [];
    UCOUNTS = await fetchAll('upbo_counts') || [];
  } catch (e) { }
  var g = $('#vgrid'); if (!g) return;
  g.innerHTML = '';                                   /* 정적 테스트 카드 제거 */
  if (!VIEWERS.length) { $('#empty').style.display = 'block'; return; }
  $('#empty').style.display = 'none';
  g.innerHTML = VIEWERS.map(function (v) {
    var cs = UCOUNTS.filter(function (c) { return c.viewer_id === v.id && c.count > 0; });
    var total = cs.reduce(function (a, c) { return a + c.count; }, 0);
    return '<div class="vc" data-nick="' + esc(v.nickname) + '" data-id="' + esc(v.soop_id || '') + '" data-vid="' + v.id + '">' +
      '<div class="vfb">' + esc((v.nickname || '?')[0]) + '</div>' +
      '<b class="vn">' + esc(v.nickname) + '</b>' +
      '<em class="vi">@' + esc(v.soop_id || '-') + '</em>' +
      '<span class="vt">' + total + '개</span></div>';
  }).join('');
  $$('.vc').forEach(function (c) {
    c.addEventListener('click', function () {
      var vid = +c.dataset.vid;
      var cs = UCOUNTS.filter(function (x) { return x.viewer_id === vid && x.count > 0; });
      var rows = cs.map(function (x) {
        var t = UTYPES.find(function (y) { return y.id === x.type_id; }) || {};
        return '<div class="urow"><span class="nm">' + esc(t.name || '-') + '</span>' +
          (t.category === '이벤트' ? '<span class="ev">이벤트</span>' : '') +
          '<span class="ct">' + x.count + '</span></div>';
      }).join('');
      var tot = cs.reduce(function (a, x) { return a + x.count; }, 0);
      $('#mAv').textContent = (c.dataset.nick || '?')[0];
      $('#mNick').textContent = c.dataset.nick;
      $('#mId').textContent = '@' + (c.dataset.id || '-');
      $('#mTot').textContent = '총 ' + tot + '개';
      $('#mBody').innerHTML = rows || '<p class="empty" style="display:block">업보가 없어요!</p>';
      $('#ov').classList.add('on');
    });
  });
  if (typeof filt === 'function') filt();
}

/* ── 옷장 ── */
var DRESS = [];
async function loadDress() {
  try { DRESS = await fetchAll('dress_items', { order: 'sort_order' }) || []; } catch (e) { DRESS = []; }
  DRESS.sort(function (a, b) { return (b.created_at || '').localeCompare(a.created_at || ''); });
  var LAB = { hair: '헤어', outfit: '의상', lens: '렌즈' };
  var isNew = function (d) {
    var b = d.badges || [];
    return b.some(function (x) { return (x.label || x) === 'NEW'; });
  };
  var pg = $('#pgrid'), ag = $('#agrid');
  if (!pg) return;
  pg.innerHTML = ''; if (ag) ag.innerHTML = '';       /* 정적 테스트 포스터 제거 */
  if (!DRESS.length) { var e = $('#empty'); if (e) e.style.display = 'block'; return; }
  pg.innerHTML = DRESS.map(function (d) {
    return '<div class="poster" data-c="' + esc(d.category) + '" data-new="' + (isNew(d) ? 1 : 0) + '"' +
      ' data-src="' + esc(d.image_url) + '" data-name="' + esc(d.name) + '" data-desc="' + esc(d.description || '') + '">' +
      '<img class="avatar" src="' + esc(d.image_url) + '" referrerpolicy="no-referrer" alt="' + esc(d.name) + '">' +
      '<span class="frame"></span>' +
      '<div class="p-top"><span class="p-brand">HONEYBREAD</span>' + (isNew(d) ? '<span class="p-new">NEW</span>' : '') + '</div>' +
      '<div class="p-bottom"><span class="p-cat">' + (LAB[d.category] || d.category) + '</span>' +
      '<span class="p-line"></span><b class="p-name">' + esc(d.name) + '</b>' +
      '<div class="p-meta">' + (d.created_at || '').slice(0, 10) + '</div>' +
      '<p class="p-desc">' + esc(d.description || '') + '</p></div></div>';
  }).join('');
  ag.innerHTML = DRESS.map(function (d) {
    return '<div class="item" data-c="' + esc(d.category) + '" data-new="' + (isNew(d) ? 1 : 0) + '"' +
      ' data-src="' + esc(d.image_url) + '" data-name="' + esc(d.name) + '" data-desc="' + esc(d.description || '') + '">' +
      '<img class="avatar" src="' + esc(d.image_url) + '" referrerpolicy="no-referrer" alt="' + esc(d.name) + '">' +
      '<div class="i-cap"><b>' + esc(d.name) + '</b><em>' + (d.created_at || '').slice(0, 10) + '</em></div></div>';
  }).join('');
  $$('.poster, .item').forEach(function (el) {
    el.addEventListener('click', function () { openLb('', el); });
  });
  if (typeof render === 'function') render();
}

/* ── 아바타 정보 ── */
async function loadAvatarInfo() {
  var CR = [];
  try { CR = await fetchAll('avatar_credits', { order: 'sort_order' }) || []; } catch (e) { }
  var link = function (c) {
    return c.url
      ? '<a class="cl" href="' + esc(c.url) + '" target="_blank" rel="noreferrer">' + esc(c.name) + '</a>'
      : '<em>' + esc(c.name) + '</em>';
  };

  /* 아바타 (그룹별) */
  var box = $('[data-av-rows]');
  if (box) {
    var av = CR.filter(function (c) { return c.section === 'avatar'; });
    var groups = [];
    av.forEach(function (c) {
      var g = groups.find(function (x) { return x.label === c.group_label; });
      if (!g) { g = { label: c.group_label, parts: [] }; groups.push(g); }
      g.parts.push(c);
    });
    box.innerHTML = '';
    box.innerHTML = groups.map(function (g) {
      return '<div class="row"><b>' + esc(g.label) + ' //</b><span>' +
        g.parts.map(function (c) { return '<span class="p">' + esc(c.role) + ' : ' + link(c) + '</span>'; }).join('') +
        '</span></div>';
    }).join('');
  }

  /* 의상 / 헤어 (2열) */
  ['cloth', 'hair'].forEach(function (sec) {
    var b = $('[data-' + sec + ']'); if (!b) return;
    var arr = CR.filter(function (c) { return c.section === sec; });
    var half = Math.ceil(arr.length / 2);
    var col = function (a) {
      return '<div class="col">' + a.map(function (c) {
        return '<a class="it" href="' + esc(c.url || '#') + '" target="_blank" rel="noreferrer">' + esc(c.name) + '<i>↗</i></a>';
      }).join('') + '</div>';
    };
    b.innerHTML = arr.length ? (col(arr.slice(0, half)) + col(arr.slice(half))) : '';
    var cnt = $('[data-' + sec + '-cnt]'); if (cnt) cnt.textContent = arr.length;
  });

  /* 안내문 */
  ['avatar-note', 'avatar-intro'].forEach(function (k) {
    var e = $('[data-k="' + k + '"]'); if (e && PROFILE[k]) e.textContent = PROFILE[k];
  });
  var dc = $('[data-discord]');
  if (dc && PROFILE['avatar-discord']) dc.textContent = 'Discord : ' + PROFILE['avatar-discord'];
}

/* ── 문의 ── */
async function sendAsk() {
  var el = $('#askText'); var t = el.value.trim(); if (!t) return;
  try { await insertRow('inquiries', { message: t }); } catch (e) { console.log(e); }
  el.value = ''; closeAsk(); alert('문의가 전송됐어요!');
}

/* ── 부팅 ── */
(async function boot() {
  await loadProfile();
  var p = document.body.dataset.page || '';
  try {
    if (p === 'schedule') await loadSchedule();
    if (p === 'work') await loadUpbo();
    if (p === 'dress') await loadDress();
    if (p === 'avatar') await loadAvatarInfo();
    if (p === 'main') renderWeek();
  } catch (e) { console.log(e); }
  ready();
})();
setTimeout(ready, 1600);   /* FOUC 폴백 */
