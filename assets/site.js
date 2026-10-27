/* Centro Infissi Gaggiano — comportamenti comuni del sito di lancio.
   Nessun movimento parte da solo: tutto risponde allo scroll o a un clic. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ── header: diventa pieno quando si scende ── */
  const hdr = $('.hdr');
  const intro = $('#intro');
  const onScrollHeader = () => {
    if (!hdr) return;
    const limit = intro ? intro.offsetHeight - innerHeight * 0.9 : 40;
    hdr.classList.toggle('solid', scrollY > limit);
  };

  /* ── menu mobile ── */
  const burger = $('.burger'), nav = $('.nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open);
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); document.body.classList.remove('menu-open');
    }));
  }
  /* le pagine non ancora costruite non portano da nessuna parte */
  $$('a.todo-link').forEach(a => a.addEventListener('click', e => e.preventDefault()));

  /* ── CTA fissa su mobile dopo il 30% della pagina ── */
  const sticky = $('.sticky');
  const onScrollSticky = () => {
    if (!sticky) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const start = intro ? intro.offsetHeight : 0;
    sticky.classList.toggle('on', scrollY > start && max > 0 && scrollY / max > 0.3);
  };

  /* ── comparsa dei blocchi ── */
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    /* i blocchi già visibili al caricamento compaiono subito, gli altri quando entrano;
       negli elenchi un piccolo ritardo a cascata rende l'ingresso morbido */
    $$('.rv').forEach(el => {
      const sib = el.parentElement ? [...el.parentElement.children].filter(x => x.classList.contains('rv')) : [];
      const i = sib.indexOf(el);
      if (i > 0) el.style.animationDelay = Math.min(i, 6) * 70 + 'ms';
      io.observe(el);
    });
  } else $$('.rv').forEach(el => el.classList.add('in'));

  /* ── recensioni: frecce per chi non usa il trackpad ── */
  $$('[data-reviews]').forEach(box => {
    const list = $('.reviews', box);
    $$('[data-dir]', box).forEach(b => b.addEventListener('click', () => {
      list.scrollBy({ left: (+b.dataset.dir) * Math.min(380, list.clientWidth * .9), behavior: reduce ? 'auto' : 'smooth' });
    }));
  });

  /* calendario: niente giorni passati */
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  $$('input[data-mindate]').forEach(i => i.min = today);

  /* ── moduli: in questo prototipo non inviano nulla ── */
  $$('form[data-demo]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const next = f.dataset.next;
    if (next) { location.href = next + location.search; return; }
    const ok = $('.sent', f.parentElement) || $('.sent', f);
    if (ok) { ok.classList.add('on'); ok.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
  }));

  /* ═══ INTRO: si entra nel Centro Infissi reale ═══════════════════
     Tre momenti, dichiarati in alto a destra:
     1 la storia nasce a Gaggiano · 2 lo showroom, con dietro la produzione · 3 casa tua.
     Si avanza con lo scroll o con il bottone; «Salta intro» porta al contenuto,
     che è già tutto nel codice della pagina. */
  if (intro) {
    const S = n => $('.s-' + n, intro);
    const ext = S('ext'), show = S('show'), home = S('home');
    const img = el => $('img', el);
    const c = [1, 2, 3].map(i => $('.c' + i, intro));
    const btn = $('#btnOpen'), btnTxt = $('#btnOpen .t'), skip = $('#skipIntro'), hint = $('.hint', intro);
    const content = document.getElementById('contenuto');
    const STOPS = [0.56, 0.92];
    const LABELS = ['Entra', 'Continua'];
    const progress = () => {
      const span = intro.offsetHeight - innerHeight;
      return span <= 0 ? 1 : clamp(-intro.getBoundingClientRect().top / span, 0, 1);
    };
    const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
    const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const render = () => {
      const p = progress();
      /* 1 · la sede: ci si avvicina fino all'ingresso */
      img(ext).style.transform = `scale(${1 + Math.pow(ease(seg(p, 0.06, 0.42)), 1.3) * 2.6})`;
      img(ext).style.filter = `blur(${(seg(p, 0.36, 0.46) * 5).toFixed(1)}px)`;
      ext.style.opacity = String(1 - seg(p, 0.38, 0.48));
      /* 2 · la produzione */
      show.style.opacity = String(seg(p, 0.38, 0.48) * (1 - seg(p, 0.68, 0.78)));
      img(show).style.transform = `scale(${1.12 - seg(p, 0.4, 0.75) * 0.1})`;
      /* 3 · casa tua, con le call to action */
      home.style.opacity = String(seg(p, 0.68, 0.78));
      img(home).style.transform = `scale(${1.06 - seg(p, 0.68, 1) * 0.06})`;
      const vis = [1 - seg(p, 0.12, 0.2),
                   seg(p, 0.48, 0.54) * (1 - seg(p, 0.64, 0.7)),
                   seg(p, 0.78, 0.86)];
      c.forEach((el, i) => {
        el.style.opacity = String(vis[i]); el.style.transform = `translateY(${(1 - vis[i]) * 16}px)`;
        el.style.pointerEvents = vis[i] > 0.6 ? 'auto' : 'none';
      });
      /* le call to action restano fisse in basso in tutti e tre i momenti */
      if (btn) {
        const end = seg(p, 0.74, 0.8);
        btn.style.opacity = String(1 - end); btn.style.pointerEvents = end > 0.5 ? 'none' : '';
        if (hint) hint.style.opacity = String(1 - end);
        const next = STOPS.findIndex(s => p < s - 0.01);
        btnTxt.textContent = LABELS[Math.max(0, Math.min(1, next))];
      }
    };

    let anim = null;
    const tweenTo = (y, ms = 2200) => {
      if (anim) cancelAnimationFrame(anim);
      if (reduce) { scrollTo(0, y); return; }
      const y0 = scrollY, d = y - y0, t0 = performance.now();
      const stepF = now => {
        const t = clamp((now - t0) / ms, 0, 1);
        scrollTo(0, y0 + d * ease(t));
        anim = t < 1 ? requestAnimationFrame(stepF) : null;
      };
      anim = requestAnimationFrame(stepF);
    };
    const yAt = p => intro.offsetTop + p * (intro.offsetHeight - innerHeight);
    if (btn) btn.addEventListener('click', () => {
      const p = progress();
      const next = STOPS.find(s => p < s - 0.01);
      if (next === undefined) tweenTo(content.offsetTop, 900);
      else tweenTo(yAt(next));
    });
    skip.addEventListener('click', () => { if (anim) cancelAnimationFrame(anim); scrollTo(0, content.offsetTop); content.focus({ preventScroll: true }); });
    ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { if (anim) { cancelAnimationFrame(anim); anim = null; } }, { passive: true }));

    if (reduce) {
      intro.style.height = '100vh';
      if (btn) btn.style.display = 'none'; ext.style.opacity = 0; home.style.opacity = 1; c[0].style.opacity = 0; c[2].style.opacity = 1; c[2].style.pointerEvents = 'auto';
    } else {
      let ticking = false;
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; render(); }); } }, { passive: true });
      addEventListener('resize', render);
      render();
    }
  }

  /* filtri della pagina recensioni */
  const flt = $('.filters');
  if (flt) {
    $$('button', flt).forEach(b => b.addEventListener('click', () => {
      $$('button', flt).forEach(x => x.setAttribute('aria-pressed', x === b));
      const t = b.dataset.t;
      $$('.rgrid .review').forEach(r => { r.style.display = (!t || r.dataset.t === t) ? '' : 'none'; });
    }));
  }

  /* ═══ LANDING: variante dal parametro ?tema=, UTM nei campi nascosti ═══ */
  const lp = $('[data-landing]');
  if (lp) {
    const q = new URLSearchParams(location.search);
    const VAR = JSON.parse($('#lp-varianti').textContent);
    const v = VAR[q.get('tema')] || VAR[''];
    $('#lpH1').textContent = v.h1;
    const img = $('#lpImg'); img.src = v.img; img.alt = v.alt;
    ['utm_source', 'utm_campaign', 'utm_content'].forEach(k => { const el = $(`[name="${k}"]`); if (el) el.value = q.get(k) || ''; });
    const tema = $('[name="tema"]'); if (tema) tema.value = q.get('tema') || '';
    /* il selettore rapido precompila la situazione del form */
    $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
      $$('[data-pick]').forEach(x => x.setAttribute('aria-pressed', x === b));
      const sel = $('#lpSit'); sel.value = b.dataset.pick;
      $('#form').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }));
  }

  /* pagina di ringraziamento: evento di conversione al caricamento */
  if ($('[data-thanks]')) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'generate_lead', form: 'lp_sopralluogo' });
    /* qui, dopo il consenso Iubenda: fbq('track','Lead') + evento CAPI lato server */
  }

  const all = () => { onScrollHeader(); onScrollSticky(); };
  addEventListener('scroll', all, { passive: true });
  addEventListener('resize', all);
  all();
})();
