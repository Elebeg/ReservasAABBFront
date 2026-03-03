import React, { useState, useEffect } from 'react'; // useEffect: reset imgFailed on logoUrl change

// ── Forma do escudo (compartilhada) ───────────────────────────────────────────
const S = 'M50 5 L93 20 L93 67 Q93 95 50 111 Q7 95 7 67 L7 20 Z';

// ── 16 temas de cor (primária, secundária, destaque) ──────────────────────────
const THEMES = [
  { p: '#1a2b6d', s: '#ffffff', a: '#e8b800' }, // 00 · azul-marinho / branco / ouro
  { p: '#8b0000', s: '#ffffff', a: '#ffd700' }, // 01 · vermelho escuro / branco / ouro
  { p: '#005c1e', s: '#ffffff', a: '#ffd700' }, // 02 · verde floresta / branco / ouro
  { p: '#4a0080', s: '#ffd700', a: '#ffd700' }, // 03 · roxo / ouro / ouro
  { p: '#0d3349', s: '#e8a200', a: '#e8a200' }, // 04 · azul-profundo / âmbar / âmbar
  { p: '#111111', s: '#e8b800', a: '#e8b800' }, // 05 · preto / ouro / ouro
  { p: '#005f5f', s: '#ffffff', a: '#ffd700' }, // 06 · verde-azulado / branco / ouro
  { p: '#6b1010', s: '#ffffff', a: '#e8c000' }, // 07 · bordô / branco / ouro
  { p: '#c04000', s: '#111111', a: '#ffd700' }, // 08 · laranja-queimado / preto / ouro
  { p: '#002366', s: '#cc0000', a: '#ffffff' }, // 09 · azul-real / vermelho / branco
  { p: '#1a5e00', s: '#f5c518', a: '#f5c518' }, // 10 · verde-grama / amarelo-ouro / amarelo-ouro
  { p: '#7c3800', s: '#f5deb3', a: '#ffd700' }, // 11 · marrom-cobre / trigo / ouro
  { p: '#1c1c2e', s: '#00b4d8', a: '#00b4d8' }, // 12 · azul-noite / ciano / ciano
  { p: '#3d1a00', s: '#c9a84c', a: '#c9a84c' }, // 13 · marrom-escuro / ouro-âmbar / ouro-âmbar
  { p: '#880e4f', s: '#ffffff', a: '#f8bbd0' }, // 14 · magenta-escuro / branco / rosa
  { p: '#004d40', s: '#e0f2f1', a: '#ffd700' }, // 15 · esmeralda-escuro / menta-clara / ouro
];

// ── Determinístico: mesmo time → mesmo hash ───────────────────────────────────
function hashName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) { h = name.charCodeAt(i) + ((h << 5) - h); h |= 0; }
  return Math.abs(h);
}

// ── Registro global: garante que nenhum par (design, tema) se repita ──────────
// Persiste durante toda a sessão; mesmo time sempre recebe o mesmo escudo.
const _teamBadge = {}; // { teamName: { di, ti } }
const _taken     = new Set(); // "di-ti"

function assignBadge(name) {
  if (_teamBadge[name] !== undefined) return _teamBadge[name];
  const h  = hashName(name);
  let di   = h % 16;                       // índice de design (forma)
  let ti   = Math.floor(h / 16) % 16;     // índice de tema   (cores)

  // Procura o primeiro par livre mais próximo do hash original
  outer: for (let dd = 0; dd < 16; dd++) {
    for (let dt = 0; dt < 16; dt++) {
      const cd  = (di + dd) % 16;
      const ct  = (ti + dt) % 16;
      const key = `${cd}-${ct}`;
      if (!_taken.has(key)) { di = cd; ti = ct; break outer; }
    }
  }

  const key = `${di}-${ti}`;
  _taken.add(key);
  _teamBadge[name] = { di, ti };
  return _teamBadge[name];
}

// ── 16 designs de escudo ──────────────────────────────────────────────────────
// Cada função recebe (primary, secondary, accent, clipId) e retorna elementos SVG
const DESIGNS = [
  // 00 · Divisão horizontal (cima = secundária, baixo = primária)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="0" y="0" width="100" height="54"  fill={s} clipPath={`url(#${id})`} />
    <rect x="0" y="51" width="100" height="6"  fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 01 · Divisão vertical (esquerda = primária, direita = secundária)
  (p, s, a, id) => <>
    <rect x="0"  y="0" width="100" height="116" fill={s} clipPath={`url(#${id})`} />
    <rect x="0"  y="0" width="50"  height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="47" y="0" width="6"   height="116" fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 02 · Diagonal (primária topo-esquerdo, secundária baixo-direito)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p}  clipPath={`url(#${id})`} />
    <polygon points="0,116 100,0 100,116"       fill={s}  clipPath={`url(#${id})`} />
    <line x1="0" y1="116" x2="100" y2="0"      stroke={a} strokeWidth="5" clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 03 · Chevron apontando para BAIXO
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <polygon points="0,28 50,78 100,28 100,42 50,92 0,42" fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 04 · Quatro quadrantes em cruz
  (p, s, a, id) => <>
    <rect x="0"  y="0"  width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="50" y="0"  width="50"  height="58"  fill={s} clipPath={`url(#${id})`} />
    <rect x="0"  y="58" width="50"  height="58"  fill={s} clipPath={`url(#${id})`} />
    <rect x="47" y="0"  width="6"   height="116" fill={a} clipPath={`url(#${id})`} />
    <rect x="0"  y="55" width="100" height="6"   fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 05 · Três faixas verticais (primária | secundária | primária)
  (p, s, a, id) => <>
    <rect x="0"  y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="34" y="0" width="32"  height="116" fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 06 · Estrela central em fundo sólido
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <circle cx="50" cy="63" r="26" fill={s} clipPath={`url(#${id})`} />
    <polygon
      points="50,43 55,57 69,57 58,66 62,79 50,71 38,79 42,66 31,57 45,57"
      fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 07 · Escudo interno concêntrico + círculo central
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <path d="M50 18 L81 30 L81 67 Q81 90 50 103 Q19 90 19 67 L19 30 Z"
          fill={s} clipPath={`url(#${id})`} />
    <circle cx="50" cy="62" r="13" fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 08 · Três faixas horizontais (secundária | primária | secundária) com linhas de destaque
  (p, s, a, id) => <>
    <rect x="0" y="0"  width="100" height="116" fill={s} clipPath={`url(#${id})`} />
    <rect x="0" y="38" width="100" height="40"  fill={p} clipPath={`url(#${id})`} />
    <rect x="0" y="36" width="100" height="4"   fill={a} clipPath={`url(#${id})`} />
    <rect x="0" y="76" width="100" height="4"   fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 09 · Diagonal oposta — espelho do 02 (secundária topo-esquerdo, primária baixo-direito)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={s} clipPath={`url(#${id})`} />
    <polygon points="0,0 100,116 0,116"          fill={p}  clipPath={`url(#${id})`} />
    <line x1="0" y1="0" x2="100" y2="116"       stroke={a} strokeWidth="5" clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 10 · Chevron apontando para CIMA (V invertido)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <polygon points="0,62 50,12 100,62 100,76 50,26 0,76" fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 11 · Losango central
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <polygon points="50,16 88,58 50,100 12,58"  fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 12 · Saltire (X cruzado, estilo Saint Andrew)
  (p, s, a, id) => <>
    <rect x="0"   y="0"   width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <line x1="0"  y1="0"   x2="100" y2="116" stroke={s} strokeWidth="22" clipPath={`url(#${id})`} />
    <line x1="100" y1="0"  x2="0"   y2="116" stroke={s} strokeWidth="22" clipPath={`url(#${id})`} />
    <line x1="0"  y1="0"   x2="100" y2="116" stroke={a} strokeWidth="5"  clipPath={`url(#${id})`} />
    <line x1="100" y1="0"  x2="0"   y2="116" stroke={a} strokeWidth="5"  clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 13 · Cruz (+ estilo Saint George)
  (p, s, a, id) => <>
    <rect x="0"  y="0"  width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <rect x="40" y="0"  width="20"  height="116" fill={s} clipPath={`url(#${id})`} />
    <rect x="0"  y="48" width="100" height="20"  fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 14 · Faixa diagonal larga (sash) de cima-esq a baixo-dir
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116"   fill={p} clipPath={`url(#${id})`} />
    <polygon points="0,0 65,0 100,116 35,116"     fill={s} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,

  // 15 · Três escudos concêntricos (rings)
  (p, s, a, id) => <>
    <rect x="0" y="0" width="100" height="116" fill={p} clipPath={`url(#${id})`} />
    <path d="M50 14 L86 27 L86 66 Q86 91 50 106 Q14 91 14 66 L14 27 Z" fill={s} clipPath={`url(#${id})`} />
    <path d="M50 30 L72 39 L72 66 Q72 83 50 95 Q28 83 28 66 L28 39 Z"  fill={p} clipPath={`url(#${id})`} />
    <path d="M50 46 L58 51 L58 66 Q58 74 50 80 Q42 74 42 66 L42 51 Z"  fill={a} clipPath={`url(#${id})`} />
    <path d={S} fill="none" stroke={a} strokeWidth="2.5" />
  </>,
];

// ── Componente de escudo SVG ──────────────────────────────────────────────────
function BadgeSVG({ name, size }) {
  const { di, ti } = assignBadge(name);
  const { p, s, a } = THEMES[ti];
  // ID único por time para o clipPath (baseado no hash)
  const id = `bc${hashName(name)}`;

  return (
    <svg viewBox="0 0 100 116" fill="none" xmlns="http://www.w3.org/2000/svg"
         width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <clipPath id={id}><path d={S} /></clipPath>
      </defs>
      {DESIGNS[di](p, s, a, id)}
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

// ── Componente principal ──────────────────────────────────────────────────────
/**
 * TeamLogo — 2 camadas de fallback:
 *   1. logoUrl do banco
 *   2a. shape="shield" → escudo SVG único por time (16 designs × 16 temas)
 *   2b. shape="circle" → avatar circular com iniciais coloridas
 */
export default function TeamLogo({ name = '', logoUrl = null, size = 32, shape = 'shield', style = {} }) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [logoUrl]);

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

  // ① logoUrl do banco com imagem carregada
  if (logoUrl && !imgFailed) {
    return (
      <span style={containerStyle}>
        <img src={logoUrl} alt={name}
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
