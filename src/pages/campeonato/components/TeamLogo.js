import React, { useState, useEffect } from 'react';

// ── Forma do escudo (compartilhada) ───────────────────────────────────────────
const S = 'M50 5 L93 20 L93 67 Q93 95 50 111 Q7 95 7 67 L7 20 Z';

// ── 8 temas de cor (primária, secundária, destaque) ───────────────────────────
const THEMES = [
  { p: '#1a2b6d', s: '#ffffff', a: '#e8b800' }, // azul-marinho / branco / ouro
  { p: '#8b0000', s: '#ffffff', a: '#ffd700' }, // vermelho escuro / branco / ouro
  { p: '#005c1e', s: '#ffffff', a: '#ffd700' }, // verde floresta / branco / ouro
  { p: '#4a0080', s: '#ffd700', a: '#ffd700' }, // roxo / ouro / ouro
  { p: '#0d3349', s: '#e8a200', a: '#e8a200' }, // azul-profundo / âmbar / âmbar
  { p: '#111111', s: '#e8b800', a: '#e8b800' }, // preto / ouro / ouro
  { p: '#005f5f', s: '#ffffff', a: '#ffd700' }, // verde-azulado / branco / ouro
  { p: '#6b1010', s: '#ffffff', a: '#e8c000' }, // bordô / branco / ouro
];

// ── Determinístico: mesmo time → mesmo hash → mesmo escudo ───────────────────
function hashName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) { h = name.charCodeAt(i) + ((h << 5) - h); h |= 0; }
  return Math.abs(h);
}

// ── 8 designs de escudo ───────────────────────────────────────────────────────
// Cada função recebe (primary, secondary, accent, clipId) e retorna elementos SVG
const DESIGNS = [
  // 0 · Divisão horizontal (cima = secundária, baixo = primária)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="0" y="0" width="100" height="54"  fill={s} clipPath={`url(#${id})`} />
    <rect x="0" y="51" width="100" height="6"  fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 1 · Divisão vertical (esquerda = primária, direita = secundária)
  (p, s, a, id) => <>
    <rect x="0"  y="0" width="100" height="116" fill={s} clipPath={`url(#${id})`} />
    <rect x="0"  y="0" width="50"  height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="47" y="0" width="6"   height="116" fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 2 · Divisão diagonal (primária no topo-esquerdo, secundária no baixo-direito)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p}  clipPath={`url(#${id})`} />
    <polygon points="0,116 100,0 100,116"       fill={s}  clipPath={`url(#${id})`} />
    <line x1="0" y1="116" x2="100" y2="0"      stroke={a} strokeWidth="5" clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 3 · Chevron (faixa em V apontando para baixo)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <polygon points="0,28 50,78 100,28 100,42 50,92 0,42" fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 4 · Quatro quadrantes em cruz
  (p, s, a, id) => <>
    <rect x="0"  y="0"  width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="50" y="0"  width="50"  height="58"  fill={s} clipPath={`url(#${id})`} />
    <rect x="0"  y="58" width="50"  height="58"  fill={s} clipPath={`url(#${id})`} />
    <rect x="47" y="0"  width="6"   height="116" fill={a} clipPath={`url(#${id})`} />
    <rect x="0"  y="55" width="100" height="6"   fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 5 · Três faixas verticais (primária | secundária | primária)
  (p, s, a, id) => <>
    <rect x="0"  y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="34" y="0" width="32"  height="116" fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 6 · Estrela central em fundo sólido
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <circle cx="50" cy="63" r="26" fill={s} clipPath={`url(#${id})`} />
    <polygon
      points="50,43 55,57 69,57 58,66 62,79 50,71 38,79 42,66 31,57 45,57"
      fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 7 · Escudo interno (concêntrico) + círculo central
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <path d="M50 18 L81 30 L81 67 Q81 90 50 103 Q19 90 19 67 L19 30 Z"
          fill={s} clipPath={`url(#${id})`} />
    <circle cx="50" cy="62" r="13" fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,
];

// ── Componente de escudo SVG ──────────────────────────────────────────────────
function BadgeSVG({ name, size }) {
  const h   = hashName(name);
  const idx = h % 8;
  const { p, s, a } = THEMES[idx];
  // ID único por time para o clipPath (baseado no hash — sem colisão por aleatoriedade)
  const id  = `bc${h}`;

  return (
    <svg viewBox="0 0 100 116" fill="none" xmlns="http://www.w3.org/2000/svg"
         width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <clipPath id={id}><path d={S} /></clipPath>
      </defs>
      {DESIGNS[idx](p, s, a, id)}
    </svg>
  );
}

// ── Paleta e iniciais (usado como avatar circular quando shape ≠ shield) ──────
const PALETTE = [
  ['#1a3c6e','#e8f0fb'], ['#7c2d12','#fef3ef'], ['#14532d','#f0fdf4'],
  ['#4c1d95','#f5f3ff'], ['#713f12','#fffbeb'], ['#164e63','#ecfeff'],
  ['#881337','#fff1f2'], ['#1e3a5f','#eff6ff'],
];
function colorFromName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) { h = name.charCodeAt(i) + ((h << 5) - h); h |= 0; }
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function getInitials(name = '') {
  const w = name.trim().split(/\s+/);
  return w.length === 1 ? w[0].slice(0, 2).toUpperCase() : (w[0][0] + w[w.length - 1][0]).toUpperCase();
}

// ── Cache global (null = não buscou, false = não encontrou, string = URL) ─────
const _cache = {};

async function fetchLogo(name) {
  if (_cache[name] !== undefined) return _cache[name];
  try {
    const r = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`
    );
    const d = await r.json();
    const teams = d.teams || [];
    const norm  = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q     = norm(name);
    const word  = q.split(' ')[0];
    const exact   = teams.find(t => (t.strSport === 'Soccer' || t.strSport === 'Football') && norm(t.strTeam) === q);
    const partial = teams.find(t => (t.strSport === 'Soccer' || t.strSport === 'Football') && norm(t.strTeam).includes(word));
    const match = exact || partial;
    const badge = match?.strTeamBadge || match?.strBadge || null;
    const url   = badge ? badge + '/tiny' : false;
    _cache[name] = url;
    return url;
  } catch {
    _cache[name] = false;
    return false;
  }
}

// ── Componente principal ──────────────────────────────────────────────────────
/**
 * TeamLogo — 3 camadas de fallback:
 *   1. logoUrl do banco
 *   2. Busca automática na TheSportsDB
 *   3a. shape="shield" → escudo SVG único por time (8 designs)
 *   3b. shape="circle" → avatar circular com iniciais coloridas
 */
export default function TeamLogo({ name = '', logoUrl = null, size = 32, shape = 'shield', style = {} }) {
  const [resolved, setResolved] = useState(
    logoUrl ? logoUrl : (_cache[name] !== undefined ? _cache[name] : null)
  );
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (logoUrl) { setResolved(logoUrl); setImgFailed(false); return; }
    if (_cache[name] !== undefined) { setResolved(_cache[name]); return; }
    let live = true;
    fetchLogo(name).then(url => { if (live) setResolved(url); });
    return () => { live = false; };
  }, [name, logoUrl]);

  const clipMap    = { shield: 'polygon(50% 0%, 100% 18%, 100% 65%, 50% 100%, 0% 65%, 0% 18%)', circle: 'none', square: 'none' };
  const radiusMap  = { shield: 0, circle: '50%', square: 4 };

  const containerStyle = {
    width: size, height: size,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, overflow: 'hidden',
    clipPath: clipMap[shape] || clipMap.shield,
    borderRadius: radiusMap[shape] || 0,
    ...style,
  };

  // ① URL resolvida com imagem carregada
  if (resolved && !imgFailed) {
    return (
      <span style={containerStyle}>
        <img src={resolved} alt={name}
             style={{ width: '100%', height: '100%', objectFit: 'contain' }}
             onError={() => setImgFailed(true)} />
      </span>
    );
  }

  // ② shape=shield → escudo SVG distinto por time
  if (shape === 'shield') {
    return (
      <span style={{ ...containerStyle, overflow: 'visible', clipPath: 'none', borderRadius: 0 }}>
        <BadgeSVG name={name} size={size} />
      </span>
    );
  }

  // ③ shape=circle/square → avatar com iniciais coloridas
  const [fg, bg] = colorFromName(name);
  return (
    <span style={{ ...containerStyle, background: bg, color: fg, fontSize: size * 0.31, fontWeight: 900, letterSpacing: '0.03em' }}>
      {getInitials(name)}
    </span>
  );
}
