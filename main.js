(() => {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tag1 = document.getElementById("tag1");
  const tag2 = document.getElementById("tag2");
  const heroCta = document.getElementById("heroCta");
  const scrollHint = document.getElementById("scrollHint");
  const track = document.querySelector(".hero-track");
  const stickyCta = document.getElementById("stickyCta");
  const contact = document.getElementById("contact");

  function splitLine(el) {
    if (!el) return [];
    const parts = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return parts.map((part) => {
      const span = document.createElement("span");
      span.className = "w";
      span.textContent = part;
      el.appendChild(span);
      return span;
    });
  }

  const words = [...splitLine(tag1), ...splitLine(tag2)];

  // Reduced motion: leave CSS defaults (everything visible). Do not add js-scrub.
  if (reduceMotion) {
    setupReveals(false);
    setupStickyCta();
    return;
  }

  document.body.classList.add("js-scrub");

  let ticking = false;

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function updateScrub() {
    ticking = false;
    if (!track || !words.length) return;

    const trackRect = track.getBoundingClientRect();
    const trackHeight = track.offsetHeight;
    const denom = trackHeight - window.innerHeight;
    const p = denom > 0 ? clamp(-trackRect.top / denom, 0, 1) : 1;
    const n = words.length;
    const span = 0.42 / n;

    words.forEach((word, i) => {
      const local = clamp((p - (0.03 + i * span)) / span, 0, 1);
      word.style.opacity = String(0.12 + 0.88 * local);
      word.style.transform = `translateY(${12 * (1 - local)}px)`;
    });

    if (heroCta) heroCta.classList.toggle("on", p > 0.62);
    if (scrollHint) scrollHint.classList.toggle("off", p > 0.05);
  }

  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrub);
    }
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });
  window.addEventListener("orientationchange", onScrollOrResize, { passive: true });
  updateScrub();

  setupReveals(true);
  setupStickyCta();

  function setupReveals(animate) {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!animate || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const siblings = Array.from(el.parentElement?.children || []).filter((n) =>
            n.classList?.contains("reveal")
          );
          const idx = Math.max(0, siblings.indexOf(el));
          el.style.transitionDelay = `${idx * 60}ms`;
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => io.observe(el));
  }

  function setupStickyCta() {
    if (!stickyCta || !track || !contact) return;
    const mq = window.matchMedia("(max-width: 767px)");

    function sync() {
      if (!mq.matches) {
        stickyCta.hidden = true;
        stickyCta.classList.remove("on");
        document.body.classList.remove("has-sticky-cta");
        return;
      }

      const pastHero = track.getBoundingClientRect().bottom <= 0;
      const cRect = contact.getBoundingClientRect();
      const contactInView = cRect.top < window.innerHeight && cRect.bottom > 0;

      if (pastHero && !contactInView) {
        stickyCta.hidden = false;
        document.body.classList.add("has-sticky-cta");
        requestAnimationFrame(() => stickyCta.classList.add("on"));
      } else {
        stickyCta.classList.remove("on");
        document.body.classList.remove("has-sticky-cta");
        window.setTimeout(() => {
          if (!stickyCta.classList.contains("on")) stickyCta.hidden = true;
        }, 260);
      }
    }

    let stickyTick = false;
    function onMove() {
      if (stickyTick) return;
      stickyTick = true;
      requestAnimationFrame(() => {
        stickyTick = false;
        sync();
      });
    }

    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove, { passive: true });
    mq.addEventListener?.("change", sync);
    sync();
  }
})();
