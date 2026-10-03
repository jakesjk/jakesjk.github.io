/* /me 정적 사이트 런타임 — Sierra 시안 셸(shell_sierra.html)의 화면 동작만 옮겼다.
   시안 전용(비교 컨트롤 · 직무 전환 · DOM 대조 · shadow DOM · 해시 라우터)은 없다. 본문은 HTML에 이미 있고 JS는 연출만 맡는다. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = document.documentElement.getAttribute('data-base') || '/me/';
  // 이력서 PDF 쪽 넘김(보기 전용): 이전 · 다음 · 키보드 좌우 · 스와이프 · 한 쪽씩/전체
  (function pager() {
    var pv = document.querySelector('.pv'); if (!pv) return;
    var pgs = pv.querySelectorAll('.pv-pg'), th = pv.querySelectorAll('.pv-th button'), n = pv.querySelector('.pv-n'), cur = 0;
    function show(i) { cur = Math.max(0, Math.min(pgs.length - 1, i)); pgs.forEach(function (p, k) { p.classList.toggle('on', k === cur); }); th.forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
      n.textContent = (cur + 1) + ' / ' + pgs.length; pv.querySelector('[data-pv="prev"]').disabled = cur === 0; pv.querySelector('[data-pv="next"]').disabled = cur === pgs.length - 1; }
    function mode(m) { pv.setAttribute('data-mode', m); pv.querySelectorAll('[data-pv="one"],[data-pv="all"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pv') === m)); }); }
    pv.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-pv');
      if (a === 'prev') show(cur - 1); else if (a === 'next') show(cur + 1); else if (a === 'one' || a === 'all') mode(a); else if (b.hasAttribute('data-go')) show(+b.getAttribute('data-go'));
      if (a === 'prev' || a === 'next' || b.hasAttribute('data-go')) scrollTo({ top: 0 }); });
    document.addEventListener('keydown', function (e) { if (pv.getAttribute('data-mode') !== 'one') return; if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
    var sx = null, sy = null; pv.addEventListener('touchstart', function (e) { if (e.touches.length > 1) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true }); pv.addEventListener('touchend', function (e) { if (sx === null || pv.getAttribute('data-mode') !== 'one') { sx = null; return; } var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
    mode('one'); show(0);
  })();

  // 상세 페이지 뒤로 버튼: 이 사이트에서 왔으면 브라우저 뒤로(위치 복원) + 앞 페이지 이름
  (function back() {
    var b = document.querySelector('a.back'); if (!b) return;
    var ref = null; try { ref = document.referrer ? new URL(document.referrer) : null; } catch (e) {}
    if (!ref || ref.origin !== location.origin || ref.pathname.indexOf(BASE) !== 0 || ref.pathname === location.pathname) return;
    if (history.length < 2) return;   // 새 탭으로 열었으면 이름도 이동도 기본값(상위 목록)
    var p = ref.pathname.slice(BASE.length).replace(/\/$/, '');
    var NAMES = { '': '홈', 'work': '포트폴리오', 'projects': '프로젝트', 'resume': '이력서' };
    var lab = b.querySelector('span:last-child'); if (lab) lab.textContent = NAMES[p] || '이전 페이지';
    b.addEventListener('click', function (e) { e.preventDefault(); history.back(); });
  })();

  var sroot = document.querySelector('.s'); if (!sroot) return;
  sroot.classList.add('js');

  // 첫 방문 연출: 홈에서 탭당 한 번, 1.2초
  (function intro() {
    if (reduce || sroot.getAttribute('data-route') !== '/') return;
    var seen = false; try { seen = sessionStorage.getItem('sie-intro') === '1'; } catch (e) {}
    if (seen) return;
    var fr = document.querySelector('.hero-frame'); if (!fr) return;
    try { sessionStorage.setItem('sie-intro', '1'); } catch (e) {}
    var r = fr.getBoundingClientRect();
    sroot.style.setProperty('--ix', r.left + 'px'); sroot.style.setProperty('--iy', r.top + 'px');
    sroot.style.setProperty('--iw', r.width + 'px'); sroot.style.setProperty('--ih', r.height + 'px');
    sroot.setAttribute('data-intro', 'play');
    setTimeout(function () { sroot.removeAttribute('data-intro'); }, 1200);
  })();

  // 가로 흐름: 구역 높이 = 트랙 초과 폭 + 창 높이. 900px 이하에서는 세로로 쌓는다
  (function horizontal() {
    var sec = document.querySelector('[data-hz]'); if (!sec) return;
    var inner = sec.querySelector('.hz-in'), tr = sec.querySelector('.hz-tr'), cur = 0, target = 0, raf = 0, dist = 0;
    function measure() {
      if (matchMedia('(max-width: 900px)').matches) { sec.style.height = ''; tr.style.transform = ''; dist = 0; return; }
      dist = Math.max(0, tr.scrollWidth - inner.clientWidth); sec.style.height = (inner.offsetHeight + dist) + 'px'; update();
    }
    function update() {
      if (!dist) return;
      var p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / dist)); target = -p * dist;
      if (reduce) { cur = target; tr.style.transform = 'translate3d(' + cur + 'px,0,0)'; return; }
      if (!raf) raf = requestAnimationFrame(step);
    }
    function step() { raf = 0; cur += (target - cur) * 0.28; if (Math.abs(target - cur) < 0.5) cur = target; tr.style.transform = 'translate3d(' + cur.toFixed(1) + 'px,0,0)'; if (cur !== target) raf = requestAnimationFrame(step); }
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(tr);
    measure();
  })();

  // 카드 등장
  (function reveal() {
    var cards = document.querySelectorAll('.card[data-rv="0"]'); if (!cards.length) return;
    if (reduce || !('IntersectionObserver' in window)) { cards.forEach(function (c) { c.setAttribute('data-rv', '1'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) { e.target.style.transitionDelay = (0.15 + i * 0.1) + 's'; e.target.setAttribute('data-rv', '1'); io.unobserve(e.target); });
    }, { rootMargin: '0px 200px -60px 200px' });
    cards.forEach(function (c) { io.observe(c); });
  })();

  // 카드 안 목업 재생(화면에 있을 때만)
  (function playMocks() {
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('play', e.isIntersecting); }); }, { rootMargin: '0px 100px 0px 100px' });
    document.querySelectorAll('.card').forEach(function (c) { if (c.querySelector('.mk')) io.observe(c); });
  })();

  // 상단 드롭다운 2개: 바깥 클릭 · Esc로 닫힘
  (function dropdowns() {
    var btns = document.querySelectorAll('[data-dd]');
    function closeAll(ex) { btns.forEach(function (b) { if (b === ex) return; b.setAttribute('aria-expanded', 'false'); document.getElementById(b.getAttribute('aria-controls')).hidden = true; }); }
    btns.forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); var open = b.getAttribute('aria-expanded') !== 'true'; closeAll(b); b.setAttribute('aria-expanded', String(open)); document.getElementById(b.getAttribute('aria-controls')).hidden = !open; }); });
    document.addEventListener('click', function () { closeAll(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  })();

  // 경력 카드 전환(이력서)
  (function experience() {
    var cs = document.querySelectorAll('.ex-c'); if (!cs.length) return;
    cs.forEach(function (c) { c.addEventListener('click', function () { var k = c.getAttribute('data-ex');
      cs.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      document.querySelectorAll('.ex-p').forEach(function (p) { var o = p.getAttribute('data-ex') === k; p.hidden = !o; p.classList.toggle('in', o && !reduce); }); }); });
  })();

  // 사례 대장 필터
  (function filters() {
    var g = document.querySelector('.chips'); if (!g) return;
    g.addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (!b) return; var f = b.getAttribute('data-f');
      g.querySelectorAll('[data-f]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      document.querySelectorAll('.grid .card').forEach(function (c) { c.hidden = !(f === '전체' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') >= 0); }); });
  })();

})();
