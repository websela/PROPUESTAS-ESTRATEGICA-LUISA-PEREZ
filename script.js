const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ===== Paneles apilables (efecto de scroll) ===== */
const panels = $$('.panel');
let tops = [];
function layout() {
  let y = 0; tops = [];
  panels.forEach(p => {
    // si el panel es más alto que la pantalla, se queda fijo cuando se ve su final
    p.style.top = Math.min(0, innerHeight - p.offsetHeight) + 'px';
    tops.push(y); y += p.offsetHeight;
  });
}
const ro = new ResizeObserver(layout);
panels.forEach(p => ro.observe(p));
addEventListener('resize', layout); addEventListener('load', layout);
layout();

/* ===== Menú ===== */
const links = $('#links'), burger = $('#bg'), nav = $('#nav'), anchors = $$('#links a');
burger.onclick = () => {
  links.classList.toggle('open');
  burger.textContent = links.classList.contains('open') ? '✕' : '☰';
};
$$('nav a[href^="#"], [data-go]').forEach(a => a.onclick = e => {
  e.preventDefault();
  const i = panels.findIndex(p => '#' + p.id === a.getAttribute('href'));
  if (i > -1) scrollTo({ top: tops[i], behavior: 'smooth' });
  links.classList.remove('open'); burger.textContent = '☰';
});

let lastY = 0, tick = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  $('#bar').style.width = (y / max * 100) + '%';
  nav.classList.toggle('hide', y > lastY && y > 300 && !links.classList.contains('open'));
  lastY = y;
  // panel activo + profundidad (el panel anterior se encoge al ser cubierto)
  let cur = panels[0];
  panels.forEach((p, i) => {
    const t = p.getBoundingClientRect().top;
    if (t <= 200) cur = p;
    const nx = panels[i + 1];
    const prog = nx ? Math.min(1, Math.max(0, 1 - nx.getBoundingClientRect().top / innerHeight)) : 0;
    p.style.setProperty('--p', prog.toFixed(3));
  });
  anchors.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + cur.id));
  tick = false;
}
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* ===== Aparición al hacer scroll ===== */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
$$('.rv').forEach(el => io.observe(el));

/* ===== Brillo que sigue al cursor en las tarjetas ===== */
$$('.card').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--x', (e.clientX - r.left) + 'px');
  c.style.setProperty('--y', (e.clientY - r.top) + 'px');
}));

/* ===== Cursor transparente ===== */
const cur = $('#cur');
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  let mx = 0, my = 0, cx = 0, cy = 0;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cur.style.opacity = 1;
    cur.classList.toggle('big', !!e.target.closest('a,button,[data-tip]')); });
  (function loop() { cx += (mx - cx) * .22; cy += (my - cy) * .22; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
}

/* ===== Tooltips: toca o pasa el cursor sobre [data-tip] ===== */
const tt = $('#tt'); let active = null;
function showTip(el) {
  if (active) active.classList.remove('on');
  active = el; el.classList.add('on');
  tt.innerHTML = el.dataset.tip; tt.classList.add('show');
  const r = el.getBoundingClientRect(), w = tt.offsetWidth, h = tt.offsetHeight;
  const x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
  let y = r.top - h - 10; if (y < 70) y = r.bottom + 10;
  tt.style.left = x + 'px'; tt.style.top = y + 'px';
}
function hideTip() { tt.classList.remove('show'); if (active) active.classList.remove('on'); active = null; }
const hov = () => matchMedia('(hover:hover)').matches;
$$('[data-tip]').forEach(el => {
  el.tabIndex = 0;
  el.addEventListener('click', e => { e.stopPropagation(); active === el ? hideTip() : showTip(el); });
  el.addEventListener('mouseenter', () => hov() && showTip(el));
  el.addEventListener('mouseleave', () => hov() && hideTip());
});
document.addEventListener('click', hideTip);
addEventListener('scroll', hideTip, { passive: true });

/* ===== Tabs (delegación: funciona con cualquier botón .tb) ===== */
document.addEventListener('click', e => {
  const b = e.target.closest('.tb'); if (!b) return;
  const box = b.closest('[data-tabs]'), bs = $$('.tb', box), i = bs.indexOf(b);
  bs.forEach((x, k) => x.classList.toggle('on', k === i));
  $$('.pn', box).forEach((x, k) => x.classList.toggle('on', k === i));
});
$$('[data-tabs]').forEach(box => $('.tb', box).click());

/* ===== Flujos que se iluminan en secuencia ===== */
$$('[data-cycle]').forEach(box => {
  const it = $$('span', box); let i = 0;
  setInterval(() => { it.forEach(x => x.classList.remove('on')); it[i++ % it.length].classList.add('on'); }, 1500);
});

/* ===== Ventana emergente (guiones y pop-up de Academy) ===== */
const md = $('#md'), mdc = $('#mdc');
const open = html => { mdc.innerHTML = html; md.classList.add('show'); document.body.style.overflow = 'hidden'; };
const close = () => { md.classList.remove('show'); document.body.style.overflow = ''; };
md.addEventListener('click', e => { if (e.target === md || e.target.closest('.x')) close(); });
addEventListener('keydown', e => e.key === 'Escape' && close());

const G = {
  1: { d: 'Día 1', t: 'Necesito otro par de manos',
    o: 'Generar identificación: que la comunidad se vea reflejada en su rutina. Todavía no se revela el MCP.',
    b: [['Escena', 'Laura muestra su rutina como mamá y emprendedora.'],
        ['Hook', '“Entre ser mamá, responder mensajes, revisar pedidos y tratar de hacer crecer mi negocio… hay días en los que siento que necesito otro par de manos.”'],
        ['Giro', '“Por eso últimamente estoy buscando herramientas que me ayuden a hacer más fácil todo lo que hay detrás de un negocio online.”'],
        ['Cierre', '“Y encontré algo que quiero probar… 👀” · CTA: “Les cuento en unos días.”']] },
  2: { d: 'Día 4', t: 'Le pregunté a la IA',
    o: 'Revelar la conexión Dropi + Claude como un descubrimiento natural, no como un anuncio.',
    b: [['Hook', '“Les dije que había encontrado algo que me estaba ayudando con mi negocio… pues miren esto.”'],
        ['Consulta 1', '“¿Qué productos tuvieron más devoluciones esta semana?” Claude responde con información conectada de Dropi.'],
        ['Reacción', '“¿Cómo así que simplemente se lo puedo preguntar?”'],
        ['Consulta 2', '“¿Cuáles fueron mis productos con más ventas?”'],
        ['Explicación', '“Ahora puedo conectar Dropi con Claude y consultar información de mi operación directamente desde ahí.”'],
        ['Cierre', '“Y apenas estoy descubriendo todo lo que puedo hacer con esto.”']] },
  3: { d: 'Día 7', t: 'No se trata de hacerlo todo sola',
    o: 'Demostrar utilidad: la IA no hace el negocio por ella, la ayuda a entenderlo y decidir más rápido.',
    b: [['Hook', '“Creo que una de las cosas más difíciles de emprender es sentir que tienes que estar pendiente de todo.”'],
        ['Escena', 'Laura trabaja desde casa y usa Claude.'],
        ['Consulta', '“Analiza mis ventas de esta semana y dime qué debería revisar.”'],
        ['Mensaje', '“No se trata de que la IA haga mi negocio por mí. Se trata de tener herramientas que me ayuden a entender mejor lo que está pasando y tomar decisiones más rápido.”'],
        ['Cierre', 'DROPi + CLAUDE · Tu negocio, conectado con IA.']] }
};
$$('[data-guion]').forEach(b => b.onclick = e => {
  e.stopPropagation(); const g = G[b.dataset.guion]; let d = 0;
  open(`<button class="x" aria-label="Cerrar">✕</button>
   <div class="mh l" style="--d:${d++}"><svg class="ic"><use href="#i-reel"/></svg><div><span class="chip">${g.d}</span><h3>${g.t}</h3></div></div>
   <div class="l int" style="--d:${d++}"><small>Intención</small>${g.o}</div>` +
   g.b.map(([k, v]) => `<div class="l" style="--d:${d++}"><small>${k}</small><q>${v}</q></div>`).join(''));
});

/* Pop-up de Academy: se abre desde la maqueta del home */
$$('[data-popup]').forEach(b => b.onclick = e => {
  e.stopPropagation();
  open(`<button class="x" aria-label="Cerrar">✕</button>
   <div class="mh l" style="--d:0"><svg class="ic"><use href="#i-spark"/></svg><h3>Conoce nuestra nueva herramienta</h3></div>
   <p class="l" style="--d:1">Dropi + Claude: consulta tu operación conversando. Mira primero el video de lanzamiento y luego aprende a conectarla paso a paso.</p>
   <div class="l" style="--d:2"><button class="btn" id="goAc">Ir a Dropi Academy →</button></div>`);
  $('#goAc').onclick = () => {
    close();
    const ac = $('#acad'); $('.tb', ac).click();
    scrollTo({ top: tops[panels.indexOf($('#academy'))], behavior: 'smooth' });
    ac.classList.add('hot'); setTimeout(() => ac.classList.remove('hot'), 2600);
  };
});

/* ===== Insight: el robot escala cada palabra clave ===== */
const cl = $('#climb');
if (cl) {
  const bot = $('.bot', cl), sts = $$('.stp', cl);
  let cur = 0, hold = false;
  const goTo = i => {
    const s = sts[i];
    bot.style.left = (s.offsetLeft + s.offsetWidth / 2 - bot.offsetWidth / 2) + 'px';
    bot.style.bottom = (cl.clientHeight - s.offsetTop - 6) + 'px';
    sts.forEach((x, k) => x.classList.toggle('hit', k === i));
    cur = i;
  };
  sts.forEach((s, i) => s.addEventListener('click', () => { hold = true; goTo(i); setTimeout(() => hold = false, 5000); }));
  new ResizeObserver(() => goTo(cur)).observe(cl);
  goTo(0);
  setInterval(() => { if (!hold) goTo((cur + 1) % sts.length); }, 1700);
}

/* ===== Cronopost: historias con acento colombiano y pop-ups de expectativa ===== */
const S = {
  1: { d: 'Semana 1', t: 'Historias · Algo se viene', o: 'Intriga pura: generar preguntas sin revelar el producto. Acento colombiano natural, sin caricatura.',
    b: [['Historia 1 · pregunta', '“Ay, parce, les tengo que contar algo… pero todavía no. 🤫” · En pantalla: “¿Qué le preguntarías a tu negocio si te pudiera contestar?”'],
        ['Historia 2 · encuesta', '“Uy, no, qué pena con ustedes, pero hoy no les digo nada. Eso sí: esto se pone bueno.” · Encuesta: “¿Les cuento o no les cuento?”'],
        ['Historia 3 · cuenta regresiva', '“Estén pendientes, ¿sí? Que lo que viene es para quienes viven pegados al celular con sus pedidos.” · Sticker de recordatorio.']] },
  2: { d: 'Semana 2', t: 'Historias · Pistas', o: 'Dar pistas del problema real, no del producto, y responder a la comunidad sin confirmar nada.',
    b: [['Historia 1 · pista', '“¿Será que sí se puede preguntar por los pedidos sin abrir doscientas pestañas? Pues… veremos.”'],
        ['Historia 2 · comunidad', '“Me escribieron un montón adivinando y algunos van calientes, eh. 🔥 No les confirmo nada.”'],
        ['Historia 3 · pista final', '“Pista: tiene que ver con IA y con sus ventas. Ya no les digo más, de una.”']] },
  3: { d: 'Semana 3', t: 'Historias · Lanzamiento', o: 'Convertir la expectativa en acción: mostrar, enseñar a conectar y llevar a Academy.',
    b: [['Historia 1 · revelación', '“¡Listo, parce, llegó el día! Miren lo que les tenía guardado.”'],
        ['Historia 2 · tutorial', '“Se conecta en tres pasos, de una. Les dejo el tutorial en Dropi Academy.”'],
        ['Historia 3 · invitación', '“Pruébenlo y me cuentan cómo les fue. ¡Quiero ver esas primeras consultas!”']] }
};
$$('[data-story]').forEach(b => b.onclick = e => {
  e.stopPropagation(); const g = S[b.dataset.story]; let d = 0;
  open(`<button class="x" aria-label="Cerrar">✕</button>
   <div class="mh l" style="--d:${d++}"><svg class="ic"><use href="#i-chat"/></svg><div><span class="chip">${g.d}</span><h3>${g.t}</h3></div></div>
   <div class="l int" style="--d:${d++}"><small>Intención</small>${g.o}</div>` +
   g.b.map(([k, v]) => `<div class="l" style="--d:${d++}"><small>${k}</small><q>${v}</q></div>`).join(''));
});

let cdTimer = null;
$$('[data-teaser]').forEach(b => b.onclick = e => {
  e.stopPropagation(); const n = b.dataset.teaser;
  if (n === '3') { $('[data-popup]').click(); return; }
  if (n === '1') {
    const end = Date.now() + 7 * 864e5 + 3 * 36e5;
    open(`<button class="x" aria-label="Cerrar">✕</button>
     <div class="mh l" style="--d:0"><svg class="ic"><use href="#i-spark"/></svg><h3>Algo se viene 👀</h3></div>
     <p class="l" style="--d:1">Estamos preparando algo para tu negocio. Activa el recordatorio y entérate primero.</p>
     <div class="cdw l" style="--d:2" id="cd"><div><b>--</b><span>días</span></div><div><b>--</b><span>horas</span></div><div><b>--</b><span>min</span></div><div><b>--</b><span>seg</span></div></div>
     <div class="l" style="--d:3"><button class="btn" id="rem"><span class="bell">🔔</span> Recordarme</button></div>
     <p class="l" style="--d:4;font-size:.75rem;color:#999">Maqueta ilustrativa del pop-up en la página de Dropi.</p>`);
    $('#rem').onclick = close;
    const tick = () => {
      const box = $('#cd'); if (!box || !md.classList.contains('show')) { clearInterval(cdTimer); return; }
      let t = Math.max(0, end - Date.now()); const v = [864e5, 36e5, 6e4, 1e3].map(u => { const x = Math.floor(t / u); t -= x * u; return String(x).padStart(2, '0'); });
      $$('b', box).forEach((el, i) => el.textContent = v[i]);
    };
    clearInterval(cdTimer); tick(); cdTimer = setInterval(tick, 1000);
  } else {
    open(`<button class="x" aria-label="Cerrar">✕</button>
     <div class="mh l" style="--d:0"><svg class="ic"><use href="#i-spark"/></svg><h3>Ya casi, parce</h3></div>
     <p class="l" style="--d:1">Tres piezas, una sorpresa. Ya destapamos la primera.</p>
     <div class="mp l" style="--d:2"><div class="ok">IA</div><div class="lk">?</div><div class="lk">?</div></div>
     <p class="l" style="--d:3"><b>Pista 1:</b> tiene que ver con inteligencia artificial.</p>
     <p class="l" style="--d:4;font-size:.75rem;color:#999">Maqueta ilustrativa del pop-up en la página de Dropi.</p>`);
  }
});
