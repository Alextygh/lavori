/* =============================================
   SKYLANDEX — Skylanders × Pokémon Wiki
   Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Active Nav Link ── */
  const navLinks = document.querySelectorAll('nav ul li a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Scroll Reveal Animation ── */
  const revealElements = document.querySelectorAll(
    '.card, .lore-box, .section-heading, .page-banner'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((el, i) => {
      el.classList.add('reveal-target');
      el.style.transitionDelay = `${(i % 4) * 80}ms`;
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  /* ── Type Chart — Highlight Row/Col on hover ── */
  const typeTable = document.querySelector('.type-chart');
  if (typeTable) {
    const rows = typeTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, idx) => {
        cell.addEventListener('mouseenter', () => {
          // Highlight column header
          const headers = typeTable.querySelectorAll('thead th');
          if (headers[idx]) headers[idx].style.color = 'var(--gold)';
          if (headers[idx]) headers[idx].style.textShadow = '0 0 10px rgba(255,215,0,0.6)';
        });
        cell.addEventListener('mouseleave', () => {
          const headers = typeTable.querySelectorAll('thead th');
          if (headers[idx]) headers[idx].style.color = '';
          if (headers[idx]) headers[idx].style.textShadow = '';
        });
      });
    });
  }

  /* ── Type Chart — Column filter buttons ── */
  const filterBtns = document.querySelectorAll('[data-filter]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active-filter'));
      btn.classList.add('active-filter');
      const filter = btn.dataset.filter;
      filterTypeChartRows(filter);
    });
  });

  function filterTypeChartRows(elementName) {
    const rows = document.querySelectorAll('.type-chart tbody tr');
    rows.forEach(row => {
      if (elementName === 'all') {
        row.style.display = '';
        return;
      }
      const rowElem = row.querySelector('td:first-child');
      if (!rowElem) return;
      const name = rowElem.textContent.trim().toLowerCase();
      row.style.display = (name === elementName.toLowerCase()) ? '' : 'none';
    });
  }

  /* ── Parallax hero portal ── */
  const heroPortal = document.querySelector('.hero-portal');
  if (heroPortal) {
    window.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      heroPortal.style.transform = `translate(${dx * 10}px, ${dy * 10}px)`;
    });
  }

  /* ── Sparkle cursor effect (subtle) ── */
  let sparkleThrottle = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - sparkleThrottle < 80) return;
    sparkleThrottle = now;
    createSparkle(e.clientX, e.clientY);
  });

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'cursor-sparkle';
    sparkle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--portal-blue);
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      animation: sparkle-anim 0.6s ease forwards;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  }

  /* Inject sparkle animation if not already present */
  if (!document.getElementById('sparkle-style')) {
    const style = document.createElement('style');
    style.id = 'sparkle-style';
    style.textContent = `
      @keyframes sparkle-anim {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -150%) scale(0); }
      }
      .reveal-target {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      .reveal-target.revealed {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

});
