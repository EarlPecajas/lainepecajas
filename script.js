const root = document.documentElement;
const toggle = document.querySelector('#theme-toggle');
const menuButton = document.querySelector('#menu-toggle');
const navLinks = document.querySelector('.nav-links');
const savedTheme = localStorage.getItem('elaine-theme');
if (savedTheme === 'dark') root.classList.add('dark');

function updateThemeButton() {
  const dark = root.classList.contains('dark');
  toggle.textContent = dark ? '☼' : '☾';
  toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

updateThemeButton();
toggle.addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('elaine-theme', root.classList.contains('dark') ? 'dark' : 'light');
  updateThemeButton();
});

if (menuButton) {
  menuButton.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menuButton.textContent = open ? '×' : '☰';
  });
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));
}

const backTop = document.createElement('button');
backTop.className = 'icon-button back-top';
backTop.type = 'button';
backTop.setAttribute('aria-label', 'Back to top');
backTop.textContent = '↑';
document.body.append(backTop);

const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
document.body.prepend(scrollProgress);

function updateScrollUi() {
  backTop.classList.toggle('visible', window.scrollY > 420);
  const trackHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.style.width = trackHeight > 0 ? `${(window.scrollY / trackHeight) * 100}%` : '0%';
}
window.addEventListener('scroll', updateScrollUi, { passive: true });
window.addEventListener('resize', updateScrollUi);
updateScrollUi();
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let toastEl = null;
let toastTimer = null;
function showToast(message) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    document.body.append(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 1600);
}

document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', async event => {
    const value = el.dataset.copy;
    if (!value || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      showToast('Copied to clipboard');
    } catch (err) {
      /* clipboard unavailable, mailto/tel link still works */
    }
  });
});

const statNumbers = document.querySelectorAll('.stat-number[data-target]');
if (statNumbers.length && 'IntersectionObserver' in window) {
  const statObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.target);
    statObserver.unobserve(el);
    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }), { threshold: .4 });
  statNumbers.forEach(el => statObserver.observe(el));
}

const jumpLinks = document.querySelectorAll('.section-jump .filter');
if (jumpLinks.length && 'IntersectionObserver' in window) {
  const jumpSections = Array.from(jumpLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  const jumpObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = `#${entry.target.id}`;
    jumpLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === id));
  }), { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  jumpSections.forEach(section => jumpObserver.observe(section));
}

const revealItems = document.querySelectorAll('.reveal, .job, .card, .tool');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  revealItems.forEach(item => observer.observe(item));
}

const filters = document.querySelectorAll('.filter');
filters.forEach(filter => filter.addEventListener('click', () => {
  filters.forEach(item => item.classList.toggle('active', item === filter));
  const selected = filter.dataset.filter;
  document.querySelectorAll('.job').forEach(job => job.classList.toggle('is-hidden', selected !== 'all' && !job.dataset.category.split(' ').includes(selected)));
}));

const certificateViewer = document.querySelector('#certificate-viewer');
const certificateViewerImage = document.querySelector('#certificate-viewer-image');
const certificateClose = document.querySelector('#certificate-close');
document.querySelectorAll('.certificate-card a').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  certificateViewerImage.src = link.href;
  certificateViewerImage.alt = link.querySelector('img').alt;
  certificateViewer.hidden = false;
  document.body.classList.add('viewer-open');
  requestAnimationFrame(() => certificateViewer.classList.add('visible'));
  certificateClose.focus();
}));
function closeCertificateViewer() {
  if (!certificateViewer || certificateViewer.hidden) return;
  certificateViewer.classList.remove('visible');
  document.body.classList.remove('viewer-open');
  setTimeout(() => {
    certificateViewer.hidden = true;
    certificateViewerImage.src = '';
  }, 200);
}
if (certificateClose) certificateClose.addEventListener('click', closeCertificateViewer);
if (certificateViewer) certificateViewer.addEventListener('click', event => {
  if (event.target === certificateViewer) closeCertificateViewer();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeCertificateViewer();
});
