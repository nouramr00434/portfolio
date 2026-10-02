const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EMAIL = 'YOUR_EMAIL@gmail.com';

/* ---------- Draggable tool map ---------- */
const nodes = [
  { id: 'me',     label: 'Nour',   x: 300, y: 230, r: 38, t: 'Me', d: 'Engineering student building toward DevOps. Everything here connects back to this.', l: ['linux', 'git', 'python', 'net'] },
  { id: 'linux',  label: 'Linux',  x: 140, y: 120, r: 34, t: 'Linux', d: 'Users, permissions, services, processes and shell scripting in my admin lab.', l: ['bash', 'docker'] },
  { id: 'bash',   label: 'Bash',   x: 70,  y: 270, r: 30, t: 'Bash', d: 'Small scripts that automate repetitive admin work.', l: [] },
  { id: 'git',    label: 'Git',    x: 300, y: 70,  r: 32, t: 'Git and GitHub', d: 'Branches, pull requests and history. Every project lives in a repo.', l: ['ci'] },
  { id: 'ci',     label: 'CI/CD',  x: 470, y: 110, r: 34, t: 'CI/CD', d: 'Pipelines that build, test and deploy on every push.', l: ['docker', 'azure'] },
  { id: 'docker', label: 'Docker', x: 220, y: 370, r: 34, t: 'Docker', d: 'Containerising apps so they run the same everywhere.', l: ['azure'] },
  { id: 'azure',  label: 'Azure',  x: 440, y: 360, r: 34, t: 'Azure', d: 'Deploying containers and configuring cloud infrastructure.', l: [] },
  { id: 'python', label: 'Python', x: 520, y: 240, r: 32, t: 'Python', d: 'Automation, data pipelines and tooling.', l: ['azure'] },
  { id: 'net',    label: 'TCP/IP', x: 90,  y: 410, r: 30, t: 'Networking', d: 'TCP/IP, CCNA fundamentals and troubleshooting connectivity.', l: ['linux'] },
];
const NS = 'http://www.w3.org/2000/svg', svg = $('#graph'), byId = Object.fromEntries(nodes.map(n => [n.id, n]));
const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const edges = [];
nodes.forEach(n => n.l.forEach(t => edges.push({ a: n, b: byId[t], el: svg.appendChild(mk('line', { class: 'edge' })) })));
nodes.forEach(n => {
  n.el = svg.appendChild(mk('g', { class: 'node', tabindex: 0 }));
  n.el.append(mk('circle', { r: n.r }), Object.assign(mk('text', { dy: 5 }), { textContent: n.label }));
});
const info = $('#mapInfo');
function draw() {
  edges.forEach(e => { e.el.setAttribute('x1', e.a.x); e.el.setAttribute('y1', e.a.y); e.el.setAttribute('x2', e.b.x); e.el.setAttribute('y2', e.b.y); });
  nodes.forEach(n => n.el.setAttribute('transform', `translate(${n.x},${n.y})`));
}
function select(n) {
  const near = new Set([n.id]);
  edges.forEach(e => { const hot = e.a === n || e.b === n; e.el.classList.toggle('hot', hot); if (hot) { near.add(e.a.id); near.add(e.b.id); } });
  nodes.forEach(m => { m.el.classList.toggle('sel', m === n); m.el.classList.toggle('near', near.has(m.id) && m !== n); m.el.classList.toggle('dim', !near.has(m.id)); });
  info.innerHTML = `<b>${n.t}</b><span>${n.d}</span>`;
}
function toPoint(ev) {
  const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}
nodes.forEach(n => {
  let drag = null;
  n.el.addEventListener('pointerdown', ev => {
    n.el.setPointerCapture(ev.pointerId);
    const p = toPoint(ev); drag = { dx: n.x - p.x, dy: n.y - p.y, sx: ev.clientX, sy: ev.clientY, moved: false };
  });
  n.el.addEventListener('pointermove', ev => {
    if (!drag) return;
    if (Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) > 4) drag.moved = true;
    const p = toPoint(ev);
    n.x = Math.max(n.r, Math.min(600 - n.r, p.x + drag.dx));
    n.y = Math.max(n.r, Math.min(460 - n.r, p.y + drag.dy));
    draw();
  });
  n.el.addEventListener('pointerup', () => { if (drag && !drag.moved) select(n); drag = null; });
  n.el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(n); } });
});
draw(); select(byId.me);

/* ---------- Stack layers ---------- */
const layers = [
  [['C / C++', 'Robotics and coursework', 4], ['Python', 'Automation and data', 3], ['Bash', 'Admin scripting', 3], ['SQL', 'Queries and pipelines', 3]],
  [['Git and GitHub', 'Daily workflow', 4], ['Docker', 'Containers', 3], ['CI/CD', 'Build, test, deploy', 3], ['Linux', 'Admin lab', 4]],
  [['TCP/IP', 'How packets travel', 4], ['CCNA fundamentals', 'Switching and routing basics', 3], ['Troubleshooting', 'Finding where it breaks', 3]],
  [['Azure', 'Deployments', 2], ['Data pipelines', 'Moving and shaping data', 3], ['Infrastructure', 'Configuration and automation', 2]],
];
function showLayer(i) {
  $$('.layer').forEach((b, k) => b.classList.toggle('active', k === i));
  $('#layerView').innerHTML = layers[i].map(([n, d, lv], k) =>
    `<div class="skill" style="animation-delay:${k * 60}ms"><b>${n}</b><span>${d}</span><div class="dots" aria-label="Level ${lv} of 5">${[1, 2, 3, 4, 5].map(x => `<i class="${x <= lv ? 'f' : ''}"></i>`).join('')}</div></div>`).join('');
}
$$('.layer').forEach(b => b.onclick = () => showLayer(+b.dataset.l));
showLayer(0);

/* ---------- Work accordion ---------- */
$$('.row > button').forEach(b => b.onclick = () => {
  const row = b.parentElement, open = !row.classList.contains('open');
  $$('.row').forEach(r => { r.classList.remove('open'); $('button', r).setAttribute('aria-expanded', false); });
  if (open) { row.classList.add('open'); b.setAttribute('aria-expanded', true); }
});

/* ---------- Theme, copy email, nav highlight ---------- */
const modeBtn = $('#mode');
function setMode(m) { document.documentElement.dataset.theme = m; modeBtn.textContent = m === 'paper' ? 'Dark' : 'Light'; }
setMode(matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'paper');
modeBtn.onclick = () => setMode(document.documentElement.dataset.theme === 'paper' ? 'night' : 'paper');

const toast = $('#toast');
$('#copyMail').onclick = async () => {
  try { await navigator.clipboard.writeText(EMAIL); toast.textContent = 'Email copied'; }
  catch { toast.textContent = EMAIL; }
  toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1800);
};

const navLinks = $$('#nav a');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => spy.observe(s));
