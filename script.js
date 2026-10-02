const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Scroll progress + active nav link ---------- */
addEventListener('scroll', () => {
  const h = document.documentElement;
  $('#progress').style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
}, { passive: true });

const links = $$('.nav-links a');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => spy.observe(s));

/* ---------- Mobile menu + theme ---------- */
const menu = $('#navLinks'), menuBtn = $('#menuBtn');
menuBtn.onclick = () => menuBtn.setAttribute('aria-expanded', menu.classList.toggle('open'));
links.forEach(a => a.onclick = () => { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); });

const themeBtn = $('#themeBtn');
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? 'Light' : 'Dark';
}
setTheme(matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
themeBtn.onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

/* ---------- Count-up numbers ---------- */
const counter = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  counter.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, dec = +el.dataset.dec || 0, t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / 1200, 1);
    el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec).replace(/^(\d{4})$/, '$1');
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}));
$$('[data-count]').forEach(el => counter.observe(el));

/* ---------- Interactive terminal ---------- */
const out = $('#termOut'), inp = $('#termIn'), body = $('#termBody');
const cmdLog = []; let hi = 0;

const commands = {
  help: () => 'Commands: <span class="hl">about, skills, projects, contact, theme, clear</span>',
  about: () => 'Nour Amr Mohamed\nComputing &amp; Communication Engineering, Alexandria University.\nFocus: Linux, networking, automation, cloud.',
  skills: () => 'Linux · Git · Docker · CI/CD · Bash · Python · C/C++ · TCP/IP · Azure',
  projects: () => 'Soccer Robot\nLinux Administration Lab\nCloud Deployment\nCI/CD Pipeline\n<span class="ok">Scrolling to projects...</span>',
  contact: () => 'GitHub: github.com/nouramr00434\nLinkedIn: linkedin.com/in/nour-amr-336510366\nEmail: YOUR_EMAIL@gmail.com\n<span class="ok">Scrolling to the contact form...</span>',
  theme: () => { themeBtn.click(); return 'Theme switched.'; },
  clear: () => { out.innerHTML = ''; return null; },
};
const goto = { projects: '#projects', contact: '#contact', about: '#about', skills: '#skills' };

function print(html, cls = 'out') {
  const d = document.createElement('div');
  d.className = cls; d.innerHTML = html;
  out.appendChild(d); body.scrollTop = body.scrollHeight;
}
function run(raw) {
  const c = raw.trim().toLowerCase();
  if (!c) return;
  cmdLog.push(c); hi = cmdLog.length;
  print('<span class="ok">nour@portfolio:~$</span> ' + c.replace(/</g, '&lt;'), 'out cmd');
  if (commands[c]) {
    const r = commands[c]();
    if (r) print(r);
    if (goto[c] && (c === 'projects' || c === 'contact')) setTimeout(() => $(goto[c]).scrollIntoView({ behavior: 'smooth' }), 700);
  } else print(`command not found: ${c.replace(/</g, '&lt;')}. Type <span class="hl">help</span>.`);
}
print('Welcome. Type <span class="hl">help</span> or tap a command below.');
inp.addEventListener('keydown', e => {
  if (e.key === 'Enter') { run(inp.value); inp.value = ''; }
  if (e.key === 'ArrowUp' && hi > 0) inp.value = cmdLog[--hi];
  if (e.key === 'ArrowDown') inp.value = cmdLog[++hi] || (hi = cmdLog.length, '');
});
body.onclick = () => inp.focus();
$$('.term-hints button').forEach(b => b.onclick = () => run(b.dataset.cmd));

/* ---------- Journey pipeline ---------- */
const stages = [
  ['Started university', 'Joined Computing and Communication Engineering at Alexandria University. Replace this text with what you learned.'],
  ['Linux and Git', 'Built a Linux lab and learned version control. Add the tools, courses or certificates here.'],
  ['Docker and cloud', 'Containerised apps and deployed to Azure. Add what you built and what broke.'],
  ['First DevOps role', 'Looking for an internship or junior role where I can own a pipeline end to end.'],
];
function showStage(i) {
  $$('.stage').forEach((s, k) => {
    s.classList.toggle('active', k === i);
    s.classList.toggle('done', k < i);
  });
  $('#stageDetail').innerHTML = `<h3>${stages[i][0]}</h3><p class="muted">${stages[i][1]}</p>`;
}
$$('.stage').forEach(s => s.onclick = () => showStage(+s.dataset.i));
showStage(0);

/* ---------- Skill tabs ---------- */
$$('.tab').forEach(t => t.onclick = () => {
  $$('.tab').forEach(x => x.classList.toggle('active', x === t));
  $$('.panel').forEach(p => p.classList.toggle('active', p.id === t.dataset.tab));
});

/* ---------- Project filter + modal ---------- */
$$('.chip').forEach(c => c.onclick = () => {
  $$('.chip').forEach(x => x.classList.toggle('active', x === c));
  $$('.project').forEach(p => p.classList.toggle('hide', c.dataset.f !== 'all' && p.dataset.cat !== c.dataset.f));
});

const modal = $('#modal');
function openProject(p) {
  $('#mType').textContent = $('.type', p).textContent;
  $('#mTitle').textContent = p.dataset.title;
  $('#mDesc').textContent = p.dataset.desc;
  $('#mTags').innerHTML = p.dataset.tags.split(',').map(t => `<span>${t}</span>`).join('');
  $('#mLink').href = p.dataset.link;
  modal.showModal();
}
$$('.project').forEach(p => {
  p.onclick = () => openProject(p);
  p.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(p); } };
});
$('#closeModal').onclick = () => modal.close();
modal.onclick = e => { if (e.target === modal) modal.close(); };

/* ---------- Contact form (opens the visitor's email app) ---------- */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target, msg = $('#formMsg');
  let ok = true;
  $$('input,textarea', f).forEach(el => {
    const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
    el.classList.toggle('bad', bad); if (bad) ok = false;
  });
  msg.className = 'form-msg' + (ok ? '' : ' err');
  if (!ok) { msg.textContent = 'Fill in every field and use a valid email address.'; return; }
  msg.textContent = 'Opening your email app...';
  location.href = `mailto:YOUR_EMAIL@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + f.name.value)}&body=${encodeURIComponent(f.msg.value + '\n\n' + f.email.value)}`;
});
