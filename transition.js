/* ══════════════════════════════════════════════
   꿀빵지 · 페이지 전환 (transition.js)
   - 나갈 때: 커버 + 영상 1회 재생 → 이동
   - 도착 시: 커버 없이 바로 표시 (영상 반복 방지)
   ══════════════════════════════════════════════ */
(function () {
  var HOLD_MAX = 1500;   // 영상이 안 끝나도 이 시간 지나면 강제 이동(ms)
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 서브폴더 판별 */
  var path = location.pathname.replace(/index\.html?$/, '');
  var isSub = /\/(schedule|work|dress|avatar|admin)\/$/.test(path);
  var base = isSub ? '../' : '';

  var cover = null, video = null, navigating = false;

  function build() {
    if (cover) return;
    cover = document.createElement('div');
    cover.id = 'pt-cover';
    cover.innerHTML =
      '<video id="pt-video" muted playsinline preload="auto" disablepictureinpicture>' +
      '<source src="' + base + 'transition.webm" type="video/webm">' +
      '<source src="' + base + 'transition.mp4" type="video/mp4">' +
      '</video>';
    var css = document.createElement('style');
    css.textContent =
      '#pt-cover{position:fixed;inset:0;z-index:9999;background:#FFF6E4;display:none;' +
      'align-items:center;justify-content:center;overflow:hidden}' +
      'body.dark #pt-cover{background:#241C22}' +
      '#pt-cover.on{display:flex}' +
      '#pt-video{width:100%;height:100%;object-fit:cover}';
    document.head.appendChild(css);
    document.body.appendChild(cover);
    video = document.getElementById('pt-video');
    /* 영상이 끝나면 마지막 프레임에서 정지 (루프 방지) */
    if (video) {
      video.loop = false;
      video.addEventListener('ended', function () { video.pause(); });
    }
  }
  document.addEventListener('DOMContentLoaded', build);

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || navigating) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href.charAt(0) === '#') return;
    if (a.target === '_blank' || /^(https?:)?\/\//.test(href) || /^mailto:/.test(href)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    e.preventDefault();
    navigating = true;

    if (reduce || !video) { location.href = href; return; }

    build();
    cover.classList.add('on');

    var done = false;
    var go = function () { if (done) return; done = true; location.href = href; };

    video.currentTime = 0;
    video.addEventListener('ended', go, { once: true });
    var p = video.play();
    if (p && p.catch) p.catch(go);          /* 자동재생 막히면 바로 이동 */
    setTimeout(go, HOLD_MAX);                /* 안전장치 */
  });
})();
