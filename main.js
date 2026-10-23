(() => {
  "use strict";

  const CONFIG = window.SITE_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------
   * Links e vídeos a partir do config.js
   * ------------------------------------------------------------------ */
  const waLink = (text = "") =>
    `https://wa.me/${CONFIG.whatsapp || ""}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  $$(".js-instagram").forEach((a) => (a.href = `https://instagram.com/${CONFIG.instagram || ""}`));
  $$(".js-email").forEach((a) => {
    a.href = `mailto:${CONFIG.email || ""}?subject=${encodeURIComponent("Orçamento pelo site")}`;
    a.title = CONFIG.email || "";
  });
  $(".js-year").textContent = new Date().getFullYear();

  // Todo elemento com data-wa vira link de WhatsApp com a mensagem pronta
  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.addEventListener("click", () => trackWhatsApp(a.closest("section, header, footer")?.id || a.className));
  });

  // Conversão: dispara evento para Google Tag Manager / GA4 / Meta Pixel, se instalados
  function trackWhatsApp(origem) {
    window.dataLayer && window.dataLayer.push({ event: "whatsapp_click", origem });
    window.gtag && window.gtag("event", "whatsapp_click", { origem });
    window.fbq && window.fbq("track", "Contact");
  }

  /* ------------------------------------------------------------------
   * Galeria: carrossel (arrastar / setas) + galeria em tela cheia
   * ------------------------------------------------------------------ */
  const ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    photo:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M4 7h3l2-2.5h6L17 7h3v12H4zm8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5"/></svg>',
  };
  const esc = (s = "") =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const gallery = CONFIG.galeria || [];
  const track = $(".js-gallery");
  let dragMoved = false;

  gallery.forEach((item, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "g-item";
    el.setAttribute("role", "listitem");
    el.setAttribute("aria-label", `Ampliar ${item.tipo === "video" ? "vídeo" : "foto"}: ${item.titulo || ""}`);
    const media =
      item.tipo === "video"
        ? `<video src="${item.src}" poster="${item.poster || ""}" muted loop playsinline preload="none"></video>`
        : `<img src="${item.src}" alt="" loading="lazy" draggable="false" />`;
    el.innerHTML = `${media}
      <span class="g-item__type">${item.tipo === "video" ? ICONS.play + "Vídeo" : ICONS.photo + "Foto"}</span>
      <span class="g-item__zoom">${ICONS.zoom}</span>
      <span class="g-item__meta"><strong>${esc(item.titulo)}</strong><span>${esc(item.legenda)}</span></span>`;
    el.addEventListener("click", () => !dragMoved && openLightbox(i));
    track.appendChild(el);
  });

  // Os trechos (mudos) só rodam quando estão visíveis na tela
  const galleryObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const video = e.target.querySelector("video");
        if (!video) return;
        if (e.isIntersecting && !document.body.classList.contains("lightbox-open")) video.play().catch(() => {});
        else video.pause();
      }),
    { threshold: 0.5 }
  );
  $$(".g-item", track).forEach((el) => galleryObserver.observe(el));

  // Arrastar com o mouse (no toque, o scroll nativo já resolve)
  (() => {
    let down = false, startX = 0, startScroll = 0;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      dragMoved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
    });
    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!dragMoved && Math.abs(dx) > 6) {
        dragMoved = true;
        track.classList.add("is-dragging");
      }
      if (dragMoved) track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      track.classList.remove("is-dragging");
      setTimeout(() => (dragMoved = false), 0);
    });
  })();

  // Setas + barra de progresso
  const galPrev = $(".js-gal-prev");
  const galNext = $(".js-gal-next");
  const galBar = $(".js-gal-bar");
  const itemStep = () => {
    const first = $(".g-item", track);
    return first ? first.getBoundingClientRect().width + 16 : 300;
  };
  galPrev.addEventListener("click", () => track.scrollBy({ left: -itemStep() * 2, behavior: "smooth" }));
  galNext.addEventListener("click", () => track.scrollBy({ left: itemStep() * 2, behavior: "smooth" }));
  $(".js-gal-open").addEventListener("click", () => openLightbox(0));

  function updateGalleryNav() {
    const max = track.scrollWidth - track.clientWidth;
    const visible = Math.min(1, track.clientWidth / track.scrollWidth);
    const progress = max > 0 ? track.scrollLeft / max : 0;
    galBar.style.width = `${visible * 100}%`;
    galBar.style.transform = `translateX(${(progress * (1 - visible) * 100) / visible}%)`;
    galPrev.disabled = track.scrollLeft <= 2;
    galNext.disabled = track.scrollLeft >= max - 2;
    track.parentElement.classList.toggle("at-start", galPrev.disabled);
    track.parentElement.classList.toggle("at-end", galNext.disabled);
  }
  track.addEventListener("scroll", updateGalleryNav, { passive: true });
  window.addEventListener("resize", updateGalleryNav);
  updateGalleryNav();

  // Galeria em tela cheia
  const lb = $(".lightbox");
  const lbStage = $(".lightbox__stage", lb);
  const lbMedia = $(".js-lb-media", lb);
  const lbCaption = $(".js-lb-caption", lb);
  const lbCount = $(".js-lb-count", lb);
  const lbThumbs = $(".js-lb-thumbs", lb);
  let lbIndex = 0;
  let lastFocus = null;

  gallery.forEach((item, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Ver ${item.titulo || "item " + (i + 1)}`);
    b.innerHTML = `<img src="${item.tipo === "video" ? item.poster : item.src}" alt="" loading="lazy" />`;
    b.addEventListener("click", () => showItem(i));
    lbThumbs.appendChild(b);
  });

  function showItem(i) {
    lbIndex = (i + gallery.length) % gallery.length;
    const item = gallery[lbIndex];
    const current = $("video", lbMedia);
    if (current) current.pause();

    if (item.tipo === "video") {
      const v = document.createElement("video");
      // Versão completa com som, começando no trecho que a pessoa clicou
      const full = item.completo || item.src;
      v.src = item.inicio ? `${full}#t=${item.inicio}` : full;
      v.poster = item.poster || "";
      v.controls = true;
      v.playsInline = true;
      lbMedia.replaceChildren(v);
      if (audio.playing) togglePlay(false);
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {});
      });
    } else {
      const img = new Image();
      img.src = item.src;
      img.alt = item.titulo || "";
      lbMedia.replaceChildren(img);
    }

    lbCaption.innerHTML = `<strong>${esc(item.titulo)}</strong><span>${esc(item.legenda)}</span>`;
    lbCount.textContent = `${lbIndex + 1} / ${gallery.length}`;
    [...lbThumbs.children].forEach((b, j) => b.classList.toggle("is-active", j === lbIndex));
    const thumb = lbThumbs.children[lbIndex];
    if (thumb) lbThumbs.scrollTo({ left: thumb.offsetLeft - lbThumbs.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
  }

  function openLightbox(i) {
    if (!gallery.length) return;
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add("lightbox-open");
    document.documentElement.style.overflow = "hidden";
    lenis && lenis.stop();
    $$("video", track).forEach((v) => v.pause());
    showItem(i);
    gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(lbMedia, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "power3.out" });
    $(".js-lb-close", lb).focus();
  }

  function closeLightbox() {
    const v = $("video", lbMedia);
    if (v) v.pause();
    lbMedia.replaceChildren();
    lb.hidden = true;
    document.body.classList.remove("lightbox-open");
    document.documentElement.style.overflow = "";
    lenis && lenis.start();
    // Retoma os trechos que estão na tela
    $$(".g-item", track).forEach((el) => {
      galleryObserver.unobserve(el);
      galleryObserver.observe(el);
    });
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  $(".js-lb-close", lb).addEventListener("click", closeLightbox);
  $(".js-lb-prev", lb).addEventListener("click", () => showItem(lbIndex - 1));
  $(".js-lb-next", lb).addEventListener("click", () => showItem(lbIndex + 1));
  lbStage.addEventListener("click", (e) => e.target === lbStage && closeLightbox());
  lbMedia.addEventListener("click", (e) => e.target === lbMedia && closeLightbox());

  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showItem(lbIndex - 1);
    else if (e.key === "ArrowRight") showItem(lbIndex + 1);
    else if (e.key === "Tab") {
      // Mantém o foco dentro da galeria
      const focusables = $$("button, video[controls]", lb).filter((el) => el.offsetParent !== null);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Deslizar para os lados no celular
  (() => {
    let x0 = null, y0 = null;
    lbStage.addEventListener("touchstart", (e) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    lbStage.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showItem(lbIndex + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  })();

  /* ------------------------------------------------------------------
   * Scroll suave
   * ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else (typeof target === "number" ? window.scrollTo(0, target) : target.scrollIntoView());
  };

  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
    })
  );

  /* ------------------------------------------------------------------
   * Header + menu mobile
   * ------------------------------------------------------------------ */
  const header = $(".header");
  const menuBtn = $(".menu-toggle");
  const menu = $(".mobile-menu");
  const waFloat = $(".wa-float");
  const contact = $("#contato");

  // Header sempre visível; botão flutuante aparece depois do topo e some quando o formulário está na tela
  function onScroll(y) {
    header.classList.toggle("is-scrolled", y > 20);
    const r = contact.getBoundingClientRect();
    const contactInView = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
    waFloat.classList.toggle("is-visible", y > window.innerHeight * 0.5 && !contactInView);
  }
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });

  function closeMenu() {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menuBtn.setAttribute("aria-expanded", "false");
    lenis && lenis.start();
  }
  menuBtn.addEventListener("click", () => {
    if (menu.classList.contains("is-open")) return closeMenu();
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menuBtn.setAttribute("aria-expanded", "true");
    lenis && lenis.stop();
  });

  /* ------------------------------------------------------------------
   * Divisão de texto em letras / palavras
   * ------------------------------------------------------------------ */
  $$(".split").forEach((el) => {
    // Letras agrupadas por palavra, para a quebra de linha acontecer só entre palavras
    el.innerHTML = el.textContent
      .trim()
      .split(/\s+/)
      .map((word) => `<span class="word">${[...word].map((c) => `<span class="char">${c}</span>`).join("")}</span>`)
      .join(" ");
  });

  // Títulos: cada palavra sobe de dentro de uma máscara
  $$(".split-lines").forEach((el) => {
    const nodes = [...el.childNodes];
    el.innerHTML = "";
    nodes.forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return el.appendChild(node);
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return el.appendChild(document.createTextNode(" "));
        const mask = document.createElement("span");
        mask.className = "wm";
        mask.innerHTML = `<span class="wi">${part}</span>`;
        el.appendChild(mask);
      });
    });
  });

  // Parágrafos que "acendem" palavra por palavra no scroll
  $$(".scrub-words").forEach((el) => {
    el.innerHTML = el.textContent
      .trim()
      .split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`)
      .join(" ");
  });

  /* ------------------------------------------------------------------
   * Áudio: trecho real de uma apresentação do Lucas
   * O som passa por um analisador, então o disco reage à música de verdade.
   * ------------------------------------------------------------------ */
  const BPM = 124; // só para o pulso do disco quando o som está desligado

  const audio = {
    ctx: null,
    el: null,
    playing: false,

    init() {
      this.el = new Audio(CONFIG.audioClima || "assets/audio/clima.m4a");
      this.el.loop = true;
      this.el.preload = "auto";
      const AC = window.AudioContext || window.webkitAudioContext;
      const c = (this.ctx = new AC());
      this.analyser = c.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.72;
      this.freq = new Uint8Array(this.analyser.frequencyBinCount);
      // Analisador separado, mais rápido e com mais faixa dinâmica, só para achar as batidas
      this.beatAnalyser = c.createAnalyser();
      this.beatAnalyser.fftSize = 1024;
      this.beatAnalyser.smoothingTimeConstant = 0.15;
      this.beatAnalyser.minDecibels = -85;
      this.beatAnalyser.maxDecibels = -15;
      this.beatFreq = new Uint8Array(this.beatAnalyser.frequencyBinCount);
      c.createMediaElementSource(this.el).connect(this.beatAnalyser);
      this.beatAnalyser.connect(this.analyser);
      this.analyser.connect(c.destination);
      this.bassAvg = 0;
      this.lastBeat = 0;
    },

    start() {
      if (!this.el) this.init();
      this.ctx.resume();
      this.playing = true;
      this.el.volume = 0;
      this.el.play().catch(() => togglePlay(false));
      gsap.to(this.el, { volume: 1, duration: 0.8, overwrite: true });
    },

    stop() {
      if (!this.el) return;
      this.playing = false;
      gsap.to(this.el, { volume: 0, duration: 0.4, overwrite: true, onComplete: () => this.el.pause() });
    },

    // Detecta a batida pelo salto de energia dos graves (~45–230 Hz) acima da média recente
    beat() {
      this.beatAnalyser.getByteFrequencyData(this.beatFreq);
      let bass = 0;
      for (let i = 1; i < 5; i++) bass += this.beatFreq[i];
      bass /= 4 * 255;
      const now = this.ctx.currentTime;
      const hit = bass > this.bassAvg + 0.06 && now - this.lastBeat > 0.3;
      this.bassAvg = this.bassAvg * 0.85 + bass * 0.15;
      if (hit) this.lastBeat = now;
      return hit;
    },
  };

  const playBtn = $(".play");
  function togglePlay(force) {
    const on = typeof force === "boolean" ? force : !audio.playing;
    if (on === audio.playing) return;
    on ? audio.start() : audio.stop();
    playBtn.setAttribute("aria-pressed", String(on));
    $(".play__text", playBtn).textContent = on ? "Pausar" : "Ouvir o clima";
    document.body.classList.toggle("is-playing", on);
    const lbVideo = on && $(".js-lb-media video");
    if (lbVideo) lbVideo.pause();
  }
  playBtn.addEventListener("click", () => togglePlay());
  document.addEventListener("visibilitychange", () => document.hidden && togglePlay(false));

  /* ------------------------------------------------------------------
   * Vídeo de fundo do hero: takes reais da festa e do Lucas tocando
   * ------------------------------------------------------------------ */
  function initHeroVideo() {
    const video = $(".hero__video");
    const files = CONFIG.heroVideo || {};
    const saveData = navigator.connection && navigator.connection.saveData;
    const mq = window.matchMedia("(max-width: 860px)");
    const pick = () => {
      const v = mq.matches ? files.mobile : files.desktop;
      if (!v || video.dataset.current === v.src) return;
      video.dataset.current = v.src;
      video.poster = v.poster || "";
      // Com movimento reduzido ou economia de dados, fica só a imagem de capa
      if (reduceMotion || saveData) return;
      video.src = v.src;
      video.play().catch(() => {});
    };
    pick();
    mq.addEventListener("change", pick);
    // Pausa quando o topo sai da tela
    new IntersectionObserver(([e]) => {
      if (!video.src) return;
      e.isIntersecting ? video.play().catch(() => {}) : video.pause();
    }).observe(video);
  }

  /* ------------------------------------------------------------------
   * Visualizador do hero (canvas)
   * ------------------------------------------------------------------ */
  function initVisualizer() {
    const canvas = $(".hero__canvas");
    const ctx = canvas.getContext("2d");
    const BARS = 120;
    const levels = new Float32Array(BARS);
    const particles = [];
    let w = 0, h = 0;
    let pulse = 0;
    let lastIdleBeat = -1;
    let rotation = 0;
    let visible = true;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    window.addEventListener("pointermove", (e) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    });

    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

    function onBeat(strength) {
      pulse = Math.max(pulse, strength);
      const n = Math.round(8 * strength);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2.6 * strength;
        particles.push({ a, r: 0, speed, life: 1, size: 1 + Math.random() * 1.8 });
      }
    }

    function render(time) {
      if (!visible) return;
      const t = time / 1000;
      const wide = w > 860;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // Níveis: espectro real quando o som está ligado, simulação suave quando não
      if (audio.playing) {
        audio.analyser.getByteFrequencyData(audio.freq);
        if (audio.beat()) onBeat(1);
      } else {
        const beat = Math.floor(t / (60 / BPM));
        if (beat !== lastIdleBeat) {
          lastIdleBeat = beat;
          onBeat(0.45);
        }
      }
      const half = BARS / 2;
      for (let i = 0; i < BARS; i++) {
        const k = i < half ? i : BARS - 1 - i; // espelhado
        let v;
        if (audio.playing) {
          const idx = Math.floor(Math.pow(k / half, 1.6) * audio.freq.length * 0.55);
          v = audio.freq[idx] / 255;
        } else {
          v = 0.16 + 0.1 * Math.sin(t * 1.4 + k * 0.32) * Math.sin(t * 0.6 + k * 0.13) + pulse * 0.28 * (1 - k / half);
        }
        levels[i] += (v - levels[i]) * 0.3;
      }

      ctx.clearRect(0, 0, w, h);
      const cx = w * (wide ? 0.72 : 0.5) + mouse.x * 30;
      const cy = h * (wide ? 0.52 : 0.3) + mouse.y * 30;
      const R = (wide ? Math.min(w * 0.15, h * 0.22) : Math.min(w * 0.26, h * 0.14)) * (1 + pulse * 0.04);

      // Brilho
      const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 2.8);
      glow.addColorStop(0, `rgba(255,106,26,${0.12 + pulse * 0.12})`);
      glow.addColorStop(1, "rgba(255,106,26,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Barras circulares
      const barW = Math.max(2, ((Math.PI * 2 * R) / BARS) * 0.5);
      ctx.lineCap = "round";
      ctx.lineWidth = barW;
      for (let i = 0; i < BARS; i++) {
        const a = (i / BARS) * Math.PI * 2 - Math.PI / 2 + rotation * 0.15;
        const lv = levels[i];
        const len = 4 + lv * R * 1.1;
        const cos = Math.cos(a), sin = Math.sin(a);
        ctx.strokeStyle = `hsla(${18 + lv * 26}, 100%, ${52 + lv * 14}%, ${0.45 + lv * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(cx + cos * (R + 6), cy + sin * (R + 6));
        ctx.lineTo(cx + cos * (R + 6 + len), cy + sin * (R + 6 + len));
        ctx.stroke();
      }

      // Disco (vinil) girando
      rotation += audio.playing ? 0.035 : 0.008;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.fillStyle = "rgba(14,11,8,0.92)";
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(244,237,228,0.07)";
      ctx.lineWidth = 1;
      for (let r = R * 0.42; r < R * 0.96; r += R * 0.06) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      // reflexo
      ctx.strokeStyle = "rgba(244,237,228,0.16)";
      ctx.lineWidth = R * 0.06;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.7, -0.5, 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.7, Math.PI - 0.5, Math.PI + 0.2);
      ctx.stroke();
      // selo
      ctx.fillStyle = `rgb(255,${106 + pulse * 50},26)`;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#120904";
      ctx.font = `700 ${R * 0.1}px Syne, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("LUCAS", 0, -R * 0.08);
      ctx.fillText("PASSOS", 0, R * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.025, 0, Math.PI * 2);
      ctx.fillStyle = "#0b0907";
      ctx.fill();
      ctx.restore();

      // Partículas
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.r += p.speed;
        p.life -= 0.012;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const d = R * 1.15 + p.r * 2.2;
        ctx.fillStyle = `rgba(255,${150 + p.life * 60},80,${p.life * 0.8})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(p.a) * d, cy + Math.sin(p.a) * d, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      pulse *= 0.9;
    }

    gsap.ticker.add((time) => render(time * 1000));
  }

  /* ------------------------------------------------------------------
   * Botões magnéticos (só com mouse)
   * ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!finePointer || reduceMotion) return;
    $$(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.2);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      el.addEventListener("pointerleave", () => {
        xTo(0);
        yTo(0);
      });
    });
  }

  /* ------------------------------------------------------------------
   * Animações de scroll
   * ------------------------------------------------------------------ */
  function initScrollAnimations() {
    // Hero se afasta ao rolar
    gsap.to(".hero__inner", {
      yPercent: -12,
      opacity: 0.3,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero__canvas", {
      opacity: 0.3,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero__video", {
      yPercent: 12,
      scale: 1.08,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Marquee infinito que acelera com a velocidade do scroll
    const marquee = gsap.to(".marquee__track", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    if (lenis) {
      lenis.on("scroll", ({ velocity }) => {
        const boost = 1 + Math.min(Math.abs(velocity) * 0.2, 4);
        marquee.timeScale(velocity < -0.5 ? -boost : boost);
        gsap.to(marquee, { timeScale: velocity < -0.5 ? -1 : 1, duration: 1.2, delay: 0.15, overwrite: true });
      });
    }

    // Títulos com máscara
    $$(".split-lines").forEach((title) => {
      gsap.from($$(".wi", title), {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        stagger: 0.05,
        scrollTrigger: { trigger: title, start: "top 88%" },
      });
    });

    // Foto: revela de baixo para cima + parallax
    gsap.to(".about__frame", {
      clipPath: "inset(0% 0 0 0 round 20px)",
      duration: 1.4,
      ease: "power4.inOut",
      scrollTrigger: { trigger: ".about__frame", start: "top 80%" },
    });
    gsap.fromTo(
      ".about__frame img",
      { scale: 1.25 },
      { scale: 1.05, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: ".about__frame", start: "top 80%" } }
    );
    gsap.fromTo(
      ".about__frame img",
      { yPercent: -4 },
      { yPercent: -14, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } }
    );

    // Texto que acende
    $$(".scrub-words").forEach((p) => {
      gsap.to($$(".w", p), {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: p, start: "top 85%", end: "bottom 60%", scrub: true },
      });
    });

    // Contadores
    $$(".js-counter").forEach((el) => {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: Number(el.dataset.to),
        duration: 2,
        ease: "power3.out",
        onUpdate: () => (el.textContent = Math.round(obj.v)),
        scrollTrigger: { trigger: el, start: "top 92%" },
      });
    });

    // Eventos: scroll horizontal (desktop) / carrossel (celular)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 861px)", () => {
      const pin = $(".events__pin");
      const track = $(".events__track");
      const head = $(".events__head");
      const distance = () => Math.max(0, track.offsetLeft + track.scrollWidth - window.innerWidth);
      // O título fica parado; só os cards andam e passam por trás dele
      const horizontal = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: ".events",
          pin: pin,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      const headEdge = () => Math.round(head.getBoundingClientRect().right);
      $$(".card", track).forEach((card) => {
        // Entrada pela direita
        gsap.fromTo(
          card,
          { yPercent: 6 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: horizontal, start: "left 100%", end: "left 65%", scrub: true },
          }
        );
        // Ao chegar no título, o card diminui, escurece e some por trás dele
        gsap.fromTo(
          card,
          { scale: 1, opacity: 1, filter: "brightness(1)" },
          {
            scale: 0.72,
            opacity: 0,
            filter: "brightness(0.4)",
            ease: "power1.in",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontal,
              start: () => `left ${headEdge() + 40}px`,
              end: () => `right ${headEdge()}px`,
              scrub: true,
            },
          }
        );
      });
    });
    mm.add("(max-width: 860px)", () => {
      gsap.from(".events .card", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ".events__track", start: "top 88%" },
      });
    });

    // Passos: linha de progresso
    $$(".step").forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 75%",
        end: "bottom 60%",
        onUpdate: (self) => step.style.setProperty("--p", self.progress.toFixed(3)),
        onToggle: (self) => step.classList.toggle("is-active", self.isActive || self.progress === 1),
        onLeave: () => step.style.setProperty("--p", 1),
      });
      gsap.from(step.children, {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: step, start: "top 88%" },
      });
    });

    // Galeria
    gsap.from(".g-item", {
      x: 80,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.07,
      scrollTrigger: { trigger: ".gallery__track", start: "top 88%" },
    });

    // Contato
    gsap.from([".contact__copy > *", ".form"], {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".contact", start: "top 75%" },
    });
  }

  /* ------------------------------------------------------------------
   * Formulário → WhatsApp
   * ------------------------------------------------------------------ */
  const form = $(".js-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const error = $(".form__error", form);
    if (!data.nome.trim() || !data.tipo) {
      error.hidden = false;
      gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
      return;
    }
    error.hidden = true;
    const date = data.data ? data.data.split("-").reverse().join("/") : "";
    const lines = [
      "Olá, Lucas! Vim pelo site e quero um orçamento.",
      "",
      `*Nome:* ${data.nome.trim()}`,
      `*Evento:* ${data.tipo}`,
      date && `*Data:* ${date}`,
      data.local && `*Cidade:* ${data.local}`,
    ].filter((l, i) => i === 1 || l);
    trackWhatsApp("formulario");
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  /* ------------------------------------------------------------------
   * Preloader + intro
   * ------------------------------------------------------------------ */
  function intro() {
    document.body.classList.remove("is-loading");
    lenis && lenis.start();
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".preloader", { opacity: 0, duration: 0.5, ease: "power2.out" })
      .set(".preloader", { display: "none" })
      .from(".hero__video", { opacity: 0, scale: 1.12, duration: 2.2, ease: "power2.out" }, 0)
      .from(".hero__canvas", { opacity: 0, scale: 0.9, duration: 1.6 }, 0.1)
      .from(".hero__title .char", { yPercent: 110, duration: 1, stagger: 0.025 }, 0.2)
      .from(".reveal-up", { y: 20, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.5);
  }

  function runPreloader() {
    const loaded = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    // Nunca segura o visitante mais que 2,5s, mesmo com internet lenta
    const timeout = new Promise((r) => setTimeout(r, 2500));
    Promise.race([Promise.all([loaded, fontsReady]), timeout]).then(() => {
      ScrollTrigger.refresh();
      intro();
    });
  }

  initHeroVideo();
  initVisualizer();
  initMagnetic();
  initScrollAnimations();
  runPreloader();
})();
