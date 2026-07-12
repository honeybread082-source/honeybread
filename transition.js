/* ══════════════════════════════════════════════
   꿀빵지 · 페이지 전환 영상 (transition.js)
   - 내부 링크 클릭 → 커버 + 영상 재생 → 이동
   - 도착 페이지: 커버가 사라지며 등장
   ══════════════════════════════════════════════ */
(function () {
  var VIDEO_MP4 = 'transition.mp4';     // 루트 기준 (서브페이지는 자동으로 ../ 붙음)
  var VIDEO_WEBM = 'transition.webm';
  var HOLD = 1250;                       // 영상 재생 시간(ms) — 영상 길이보다 살짝 짧게
  var FADE = 240;                        // 도착 후 커버 사라지는 시간(ms)

  /* 서브 폴더면 ../ 붙이기 */
  var depth = location.pathname.replace(/\/index\.html?$/, '/').split('/').filter(Boolean).length;
  var isSub = /\/(schedule|work|dress|avatar|admin)\/?$/.test(location.pathname.replace(/index\.html?$/, ''));
  var base = isSub ? '../' : '';

  /* 움직임 줄이기 설정이면 영상 없이 페이드만 */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 커버 DOM ── */
  var cover = document.createElement('div');
  cover.id = 'pt-cover';
  cover.innerHTML =
    '<video id="pt-video" muted playsinline preload="auto">' +
    '<source src="' + base + VIDEO_WEBM + '" type="video/webm">' +
    '<source src="' + base + VIDEO_MP4 + '" type="video/mp4">' +
    '</video>';

  var css = document.createElement('style');
  css.textContent =
    '#pt-cover{position:fixed;inset:0;z-index:9999;background:#FFF6E4;display:none;' +
    'align-items:center;justify-content:center;overflow:hidden}' +
    'body.dark #pt-cover{background:#241C22}' +
    '#pt-cover.on{display:flex}' +
    '#pt-cover.out{opacity:0;transition:opacity ' + FADE + 'ms ease}' +
    '#pt-video{width:100%;height:100%;object-fit:cover}' +
    '@media(prefers-reduced-motion:reduce){#pt-video{display:none}}';

  document.head.appendChild(css);
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(cover);
    arrive();
  });

  /* ── 도착 연출 ── */
  function arrive() {
    if (!sessionStorage.getItem('pt-go')) return;   // 직접 진입이면 스킵
    sessionStorage.removeItem('pt-go');
    cover.classList.add('on');
    var v = document.getElementById('pt-video');
    if (v && !reduce) { try { v.currentTime = 0; v.play(); } catch (e) { } }
    setTimeout(function () {
      cover.classList.add('out');
      setTimeout(function () { cover.classList.remove('on', 'out'); }, FADE);
    }, reduce ? 120 : 420);
  }

  /* ── 출발 연출 ── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#')) return;
    if (a.target === '_blank' || /^https?:\/\//.test(href)) return;   // 외부 링크 제외
    if (e.metaKey || e.ctrlKey) return;

    e.preventDefault();
    sessionStorage.setItem('pt-go', '1');

    if (reduce) { location.href = href; return; }

    cover.classList.add('on');
    var v = document.getElementById('pt-video');
    var go = function () { location.href = href; };
    if (v) {
      try { v.currentTime = 0; v.play(); } catch (e2) { }
      setTimeout(go, HOLD);
    } else {
      setTimeout(go, 300);
    }
  });
})();
