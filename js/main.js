// ============================================================
// DETOXA — shared site behavior
// ============================================================

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const mobile = document.querySelector('.nav__mobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      mobile.classList.toggle('open');
      toggle.textContent = mobile.classList.contains('open') ? 'Close' : 'Menu';
    });
  }

  // Scroll-reveal for elements with .fade-up (progressive enhancement —
  // elements are visible by default in CSS; we only add the animated
  // "pre" state here, after confirming IntersectionObserver support)
  const revealEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach(el => el.classList.add('pre'));
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => obs.observe(el));
  }

  // Animate bar-fill widths when they scroll into view
  const bars = document.querySelectorAll('.bar-fill[data-pct]');
  if ('IntersectionObserver' in window && bars.length) {
    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const pct = entry.target.getAttribute('data-pct');
          entry.target.style.width = pct + '%';
          barObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    bars.forEach(b => barObs.observe(b));
  } else {
    bars.forEach(b => { b.style.width = b.getAttribute('data-pct') + '%'; });
  }
});
