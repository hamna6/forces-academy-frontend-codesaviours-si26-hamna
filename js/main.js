/* =====================================================
   FORCES ACADEMY – HOME PAGE JS (v2)
   1) Animated stats counter + staggered entrance (Intersection Observer)
   2) Spotlight cursor glow + subtle tilt on stat cards
   3) Floating back-to-top button (appears after 300px scroll)
   4) Peel-off testimonials slider (autoplay + progress bar + manual controls)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------
     1) STATS COUNTER + ENTRANCE ANIMATION
  --------------------------------------------------- */
  const countersSection = document.getElementById('faCounters');
  const counters = document.querySelectorAll('.fa-counter-num');
  const counterCards = document.querySelectorAll('.fa-counter-card');

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      const current = Math.floor(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  if (countersSection) {
    const sectionObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countersSection.classList.add('fa-counters-visible');
          counters.forEach(animateCounter);
          observer.unobserve(entry.target); // run once
        }
      });
    }, { threshold: 0.35 });

    sectionObserver.observe(countersSection);
  }

  /* ---------------------------------------------------
     2) SPOTLIGHT CURSOR GLOW + TILT ON STAT CARDS
  --------------------------------------------------- */
  counterCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');

      const rotateX = ((y / rect.height) - 0.5) * -8;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      card.style.transform = 'translateY(-9px) scale(1.015) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  /* ---------------------------------------------------
     3) BACK TO TOP BUTTON (Step 10/11)
     - Appears once the user scrolls past 300px
     - Hides again when back at (or near) the top
     - Clicking scrolls smoothly to the top of the page
  --------------------------------------------------- */
  const backToTopBtn = document.getElementById('faBackToTop');
  if (backToTopBtn) {
    function toggleBackToTop() {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('fa-visible');
      } else {
        backToTopBtn.classList.remove('fa-visible');
      }
    }

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop(); // set correct initial state on load

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------
     4) PEEL-OFF TESTIMONIALS SLIDER
  --------------------------------------------------- */
  const track = document.getElementById('faSliderTrack');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.fa-slide'));
  const dotsWrap = document.getElementById('faSliderDots');
  const prevBtn = document.getElementById('faSliderPrev');
  const nextBtn = document.getElementById('faSliderNext');
  const sliderEl = document.getElementById('faSlider');
  const progressBar = document.getElementById('faSliderProgressBar');

  let current = 0;
  let isAnimating = false;
  let autoplayId = null;
  const AUTOPLAY_DELAY = 5000; // ms
  const PEEL_DURATION = 850; // matches CSS animation duration

  sliderEl.style.setProperty('--fa-autoplay-duration', (AUTOPLAY_DELAY / 1000) + 's');

  // Build dots
  slides.forEach(function (_, i) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
    if (i === 0) dot.classList.add('fa-dot-active');
    dot.addEventListener('click', function () {
      if (i === current) return;
      goToSlide(i);
      restartAutoplay();
    });
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function updateDots(index) {
    dots.forEach(function (dot, i) {
      dot.classList.toggle('fa-dot-active', i === index);
    });
  }

  function goToSlide(targetIndex) {
    if (isAnimating) return;
    const nextIndex = (targetIndex + slides.length) % slides.length;
    if (nextIndex === current) return;

    isAnimating = true;

    const currentSlide = slides[current];
    const nextSlide = slides[nextIndex];

    // start the peel-off on the current slide
    currentSlide.classList.remove('fa-slide-active');
    currentSlide.classList.add('fa-slide-peel-out');

    // bring in the next slide underneath
    nextSlide.classList.add('fa-slide-active', 'fa-slide-peel-in');

    updateDots(nextIndex);

    window.setTimeout(function () {
      currentSlide.classList.remove('fa-slide-peel-out');
      nextSlide.classList.remove('fa-slide-peel-in');
      current = nextIndex;
      isAnimating = false;
    }, PEEL_DURATION);
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function runProgressBar() {
    if (!progressBar) return;
    progressBar.classList.remove('fa-progress-run');
    void progressBar.offsetWidth; // force reflow to restart animation
    progressBar.classList.add('fa-progress-run');
  }

  function startAutoplay() {
    runProgressBar();
    autoplayId = window.setInterval(function () {
      nextSlide();
      runProgressBar();
    }, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayId) window.clearInterval(autoplayId);
    if (progressBar) progressBar.classList.remove('fa-progress-run');
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  nextBtn.addEventListener('click', function () {
    nextSlide();
    restartAutoplay();
  });

  prevBtn.addEventListener('click', function () {
    prevSlide();
    restartAutoplay();
  });

  // Pause on hover / focus for readability & accessibility
  sliderEl.addEventListener('mouseenter', stopAutoplay);
  sliderEl.addEventListener('mouseleave', startAutoplay);
  sliderEl.addEventListener('focusin', stopAutoplay);
  sliderEl.addEventListener('focusout', startAutoplay);

  // Swipe support for touch devices
  let touchStartX = 0;
  sliderEl.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderEl.addEventListener('touchend', function (e) {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? nextSlide() : prevSlide();
      restartAutoplay();
    }
  }, { passive: true });

  // Init: first slide visible, no animation
  slides[0].classList.add('fa-slide-active');
  startAutoplay();

});