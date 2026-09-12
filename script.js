const root = document.documentElement;
const toggle = document.querySelector('#theme-toggle');
const menuButton = document.querySelector('#menu-toggle');
const navLinks = document.querySelector('.nav-links');
const savedTheme = localStorage.getItem('elaine-theme');
if (savedTheme === 'light') root.classList.add('light');

function updateThemeButton() {
  const light = root.classList.contains('light');
  toggle.textContent = light ? '☾' : '☼';
  toggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
}

updateThemeButton();
toggle.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('elaine-theme', root.classList.contains('light') ? 'light' : 'dark');
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

function updateScrollUi() {
  backTop.classList.toggle('visible', window.scrollY > 420);
}
window.addEventListener('scroll', updateScrollUi, { passive: true });
updateScrollUi();
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
  document.querySelectorAll('.job').forEach(job => job.classList.toggle('is-hidden', selected !== 'all' && job.dataset.category !== selected));
}));
