(() => {
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tagline = document.querySelector("[data-scrub-tagline]");
  const heroCta = document.querySelector(".hero-cta");
  const scrollHint = document.querySelector(".scroll-hint");
  const track = document.querySelector(".hero-track");
  const mobileCta = document.querySelector(".mobile-cta");
  const contact = document.querySelector("#contact");

  function wrapWords(el) {
    if (!el) return [];
    const lines = Array.from(el.querySelectorAll(".hero-line"));
    const words = [];
    lines.forEach((line) => {
      const parts = line.textContent.trim().split(/\s+/);
      line.textContent = "";
      parts.forEach((part, idx) => {
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = part;
        line.appendChild(span);
        words.push(span);
        if (idx < parts.length - 1) line.appendChild(document.createTextNode(" "));
      });
    });
    return words;
  }

  const words = wrapWords(tagline);

  if (reduceMotion) {
    words.forEach((w) => w.classList.add("is-on"));
    if (heroCta) heroCta.classList.add("is-visible");
    if (scrollHint) scrollHint.classList.add("is-hidden");
  } else if (track && words.length) {
    let ticking = false;

    function updateScrub() {
      ticking = false;
      const rect = track.getBoundingClientRect();
      const total = track.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      const n = words.length;

      words.forEach((word, i) => {
        const threshold = 0.04 + i * (0.55 / n);
        word.classList.toggle("is-on", p > threshold);
      });

      if (heroCta) heroCta.classList.toggle("is-visible", p > 0.8);
      if (scrollHint) scrollHint.classList.toggle("is-hidden", p > 0.05);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrub);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateScrub();
  }

  // Steps reveal
  const steps = document.querySelectorAll("[data-reveal]");
  if (steps.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      steps.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const siblings = Array.from(el.parentElement.children);
            const idx = siblings.indexOf(el);
            el.style.transitionDelay = `${idx * 60}ms`;
            el.classList.add("is-in");
            io.unobserve(el);
          });
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );
      steps.forEach((el) => io.observe(el));
    }
  }

  // Sticky mobile CTA
  if (mobileCta && track && contact) {
    const mq = window.matchMedia("(max-width: 767px)");

    function syncMobileCta() {
      if (!mq.matches) {
        mobileCta.hidden = true;
        mobileCta.classList.remove("is-shown");
        return;
      }

      const pastHero = track.getBoundingClientRect().bottom <= 0;
      const contactRect = contact.getBoundingClientRect();
      const contactInView =
        contactRect.top < window.innerHeight && contactRect.bottom > 0;

      if (pastHero && !contactInView) {
        mobileCta.hidden = false;
        document.body.classList.add("has-mobile-cta");
        requestAnimationFrame(() => mobileCta.classList.add("is-shown"));
      } else {
        mobileCta.classList.remove("is-shown");
        document.body.classList.remove("has-mobile-cta");
        if (!pastHero || contactInView) {
          window.setTimeout(() => {
            if (!mobileCta.classList.contains("is-shown")) mobileCta.hidden = true;
          }, 260);
        }
      }
    }

    let mobileTick = false;
    function onMobileScroll() {
      if (mobileTick) return;
      mobileTick = true;
      requestAnimationFrame(() => {
        mobileTick = false;
        syncMobileCta();
      });
    }

    window.addEventListener("scroll", onMobileScroll, { passive: true });
    window.addEventListener("resize", onMobileScroll, { passive: true });
    mq.addEventListener?.("change", syncMobileCta);
    syncMobileCta();
  }
})();
