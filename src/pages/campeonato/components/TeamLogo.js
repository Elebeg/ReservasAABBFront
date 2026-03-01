import React, { useState, useEffect } from 'react';

// ── Escudo padrão inline (sem dependência de arquivo externo) ─────────────
function DefaultBadge({ size }) {
  return (
    <svg viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg"
         width={size} height={size} style={{ display: 'block' }}>
      <path d="M50 4 L94 20 L94 62 Q94 90 50 106 Q6 90 6 62 L6 20 Z"
            fill="#1a3c6e" stroke="#F5B800" strokeWidth="3"/>
      <circle cx="50" cy="57" r="21" fill="white" opacity="0.88"/>
      <polygon points="50,45 58,50 58,60 50,65 42,60 42,50"
               fill="#1a3c6e" opacity="0.8"/>
      <line x1="50" y1="36" x2="42" y2="50" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <line x1="50" y1="36" x2="58" y2="50" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <line x1="29" y1="50" x2="42" y2="50" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <line x1="71" y1="50" x2="58" y2="50" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <line x1="29" y1="63" x2="42" y2="60" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <line x1="71" y1="63" x2="58" y2="60" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <line x1="50" y1="78" x2="42" y2="60" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <line x1="50" y1="78" x2="58" y2="60" stroke="#1a3c6e" strokeWidth="1.2" opacity="0.3"/>
      <polygon points="50,11 52,17 58,17 53,21 55,27 50,23 45,27 47,21 42,17 48,17"
               fill="#F5B800"/>
    </svg>
  );
}

// ── Paleta de iniciais ────────────────────────────────────────────────────
const PALETTE = [
  ['#1a3c6e','#e8f0fb'], ['#7c2d12','#fef3ef'], ['#14532d','#f0fdf4'],
  ['#4c1d95','#f5f3ff'], ['#713f12','#fffbeb'], ['#164e63','#ecfeff'],
  ['#881337','#fff1f2'], ['#1e3a5f','#eff6ff'], ['#3b0764','#faf5ff'],
  ['#052e16','#f0fdf4'], ['#422006','#fefce8'], ['#0c4a6e','#f0f9ff'],
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

// ── Cache global — uma fetch por nome por sessão ──────────────────────────
// null = ainda não buscou, false = não encontrado, string = URL
const _cache = {};

async function fetchLogo(name) {
  if (_cache[name] !== undefined) return _cache[name];

  try {
    const r = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(name)}`
    );
    const d = await r.json();
    const teams = d.teams || [];

    const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const q    = norm(name);
    const word = q.split(' ')[0];

    // Procura primeiro por nome exato, depois por primeiro token
    const exact = teams.find(t =>
      (t.strSport === 'Soccer' || t.strSport === 'Football') &&
      norm(t.strTeam) === q
    );
    const partial = teams.find(t =>
      (t.strSport === 'Soccer' || t.strSport === 'Football') &&
      norm(t.strTeam).includes(word)
    );

    const match  = exact || partial;
    const badge  = match?.strTeamBadge || match?.strBadge || null;
    const url    = badge ? badge + '/tiny' : false;
    _cache[name] = url;
    return url;
  } catch {
    _cache[name] = false;
    return false;
  }
}

// ── Componente principal ──────────────────────────────────────────────────
/**
 * TeamLogo: exibe logo com 3 camadas de fallback
 *   1. logoUrl do banco
 *   2. Busca automática na TheSportsDB pelo nome
 *   3. Escudo padrão SVG inline
 *
 * Props:
 *   name     string   — nome do time (obrigatório)
 *   logoUrl  string?  — URL salva no banco (pode ser null)
 *   size     number   — px (padrão: 32)
 *   shape    'shield' | 'circle' | 'square'
 *   style    object?  — estilos extras no container
 */
export default function TeamLogo({ name = '', logoUrl = null, size = 32, shape = 'shield', style = {} }) {
  const [resolved, setResolved] = useState(
    // Se já tem URL no banco usa direto; senão verifica cache síncrono
    logoUrl
      ? logoUrl
      : (_cache[name] !== undefined ? _cache[name] : null)
  );
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (logoUrl) { setResolved(logoUrl); setImgFailed(false); return; }

    // Já no cache?
    if (_cache[name] !== undefined) {
      setResolved(_cache[name]);
      return;
    }

    // Busca assíncrona
    let live = true;
    fetchLogo(name).then(url => {
      if (live) setResolved(url);
    });
    return () => { live = false; };
  }, [name, logoUrl]);

  const [fg, bg] = colorFromName(name);
  const initials  = getInitials(name);

  const clipMap = {
    shield: 'polygon(50% 0%, 100% 18%, 100% 65%, 50% 100%, 0% 65%, 0% 18%)',
    circle: 'none',
    square: 'none',
  };
  const radiusMap = { shield: 0, circle: '50%', square: 4 };

  const containerStyle = {
    width:          size,
    height:         size,
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    overflow:       'hidden',
    background:     bg,
    clipPath:       clipMap[shape] || clipMap.shield,
    borderRadius:   radiusMap[shape] || 0,
    ...style,
  };

  // ① URL resolvida e imagem carregada com sucesso
  if (resolved && !imgFailed) {
    return (
      <span style={containerStyle}>
        <img
          src={resolved}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  // ② Fetch completo mas não encontrou nada → escudo padrão
  if (resolved === false || imgFailed) {
    return (
      <span style={{ ...containerStyle, background: 'transparent', clipPath: 'none', borderRadius: 0 }}>
        <DefaultBadge size={size} />
      </span>
    );
  }

  // ③ Ainda buscando → iniciais (evita "piscada" vazia)
  return (
    <span style={{ ...containerStyle, color: fg, fontSize: size * 0.31, fontWeight: 900, letterSpacing: '0.03em' }}>
      {initials}
    </span>
  );
}
