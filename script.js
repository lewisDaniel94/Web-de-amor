const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Contador ---------- */
const startDate = new Date(2024, 10, 5, 0, 0, 0);
const ids = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'].map(i => document.getElementById(i));

function updateCounter() {
  const n = new Date();
  let y = n.getFullYear() - startDate.getFullYear();
  let mo = n.getMonth() - startDate.getMonth();
  let d = n.getDate() - startDate.getDate();
  let h = n.getHours(), mi = n.getMinutes(), s = n.getSeconds();
  if (d < 0) { mo--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
  if (mo < 0) { mo += 12; y--; }
  [y, mo, d, h, mi, s].forEach((v, i) => {
    const t = String(v).padStart(2, '0');
    if (ids[i].textContent !== t) {
      ids[i].textContent = t;
      if (!reduce) ids[i].animate([{ transform: 'translateY(-40%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 350, easing: 'ease-out' });
    }
  });
}
updateCounter();
setInterval(updateCounter, 1000);

/* ---------- Música ---------- */
const audio = $('#bgMusic'), playBtn = $('#playPauseBtn'), player = $('#player');
function setPlaying(on) {
  player.classList.toggle('playing', on);
  playBtn.innerHTML = `<i class="fa-solid fa-${on ? 'pause' : 'play'}"></i>`;
}
function togglePlay() {
  audio.paused ? audio.play().then(() => setPlaying(true)).catch(() => {}) : (audio.pause(), setPlaying(false));
}
playBtn.addEventListener('click', togglePlay);
audio.addEventListener('timeupdate', () => { if (audio.duration) $('#bar').style.width = (audio.currentTime / audio.duration * 100) + '%'; });

/* ---------- Pantalla de entrada ---------- */
$('#openBtn').addEventListener('click', () => {
  audio.play().then(() => setPlaying(true)).catch(() => {});
  $('#intro').classList.add('out');
  document.body.classList.remove('lock');
  confetti(innerWidth / 2, innerHeight / 2, 18);
  setTimeout(startLetterWatcher, 900);
});
document.body.classList.add('lock');

/* ---------- Corazones de fondo ---------- */
const cv = $('#hearts'), cx = cv.getContext('2d');
let W, H;
const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
size(); addEventListener('resize', size);
const P = Array.from({ length: 24 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, s: 8 + Math.random() * 16, v: .2 + Math.random() * .5, o: .08 + Math.random() * .22, w: Math.random() * 6 }));
(function loop() {
  cx.clearRect(0, 0, W, H);
  P.forEach(p => {
    if (!reduce) { p.y -= p.v; p.w += .012; }
    if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
    cx.globalAlpha = p.o; cx.fillStyle = '#ff8fb8'; cx.font = p.s + 'px serif';
    cx.fillText('♥', p.x + Math.sin(p.w) * 20, p.y);
  });
  requestAnimationFrame(loop);
})();

/* ---------- Corazones al tocar ---------- */
function confetti(x, y, n = 5) {
  if (reduce) return;
  for (let i = 0; i < n; i++) {
    const e = document.createElement('span');
    e.className = 'pop'; e.textContent = '♥';
    e.style.cssText = `left:${x}px;top:${y}px;font-size:${12 + Math.random() * 18}px;--dx:${(Math.random() - .5) * 140}px`;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 1100);
  }
}
document.addEventListener('pointerdown', e => { if (!e.target.closest('button,a,.lb')) confetti(e.clientX, e.clientY); });

/* ---------- Aparecer al hacer scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .12 });
$$('.reveal').forEach(el => io.observe(el));

/* ---------- Parallax portada ---------- */
const hero = $('#heroImg');
if (!reduce) addEventListener('scroll', () => { if (scrollY < 600) hero.style.transform = `translateY(${scrollY * .2}px)`; }, { passive: true });

/* ---------- Tilt 3D en fotos ---------- */
$$('.card').forEach(c => {
  c.addEventListener('pointermove', e => {
    if (reduce || e.pointerType === 'touch') return;
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
  });
  c.addEventListener('pointerleave', () => c.style.transform = '');
});

/* ---------- Lightbox con navegación ---------- */
const items = [hero, ...$$('.card img')];
const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
let cur = 0;
function show(i) {
  cur = (i + items.length) % items.length;
  lbImg.src = items[cur].src;
  lbCap.textContent = items[cur].closest('.card')?.querySelector('figcaption').textContent || '';
  lb.classList.add('show');
}
const close = () => lb.classList.remove('show');
items.forEach((img, i) => img.addEventListener('click', () => show(i)));
$('.lb-x').addEventListener('click', close);
$('.prev').addEventListener('click', () => show(cur - 1));
$('.next').addEventListener('click', () => show(cur + 1));
lb.addEventListener('click', e => { if (e.target === lb) close(); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('show')) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') show(cur - 1);
  if (e.key === 'ArrowRight') show(cur + 1);
});
let sx = 0;
lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });

/* ---------- Compartir ---------- */
const toast = msg => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); };
$('#waBtn').href = 'https://api.whatsapp.com/send?text=' + encodeURIComponent('¡Mira nuestra historia de amor! ' + location.href);
$('#copyLinkBtn').addEventListener('click', () => {
  (navigator.clipboard?.writeText(location.href) || Promise.reject()).then(() => toast('¡Enlace copiado! ♥')).catch(() => toast('No se pudo copiar'));
});
$('#downloadQrBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = 'img/QR.png'; a.download = 'codigo-qr-nuestra-historia.png';
  document.body.appendChild(a); a.click(); a.remove();
  toast('Descargando QR…');
});

/* ---------- Carta: máquina de escribir ---------- */
function startLetterWatcher() {
  const queue = [...$$('.tw')];
  let started = false;
  function typeAll() {
    if (started) return; started = true;
    let i = 0;
    (function next() {
      if (i >= queue.length) return;
      const el = queue[i], text = el.dataset.text;
      let c = 0;
      el.classList.add('typing');
      (function ch() {
        if (reduce) c = text.length;
        el.textContent = text.slice(0, c);
        if (c++ < text.length) return setTimeout(ch, 38);
        el.classList.remove('typing'); i++;
        setTimeout(next, 280);
      })();
    })();
  }
  const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { typeAll(); o.disconnect(); } }), { threshold: .3 });
  o.observe($('.letter'));
}