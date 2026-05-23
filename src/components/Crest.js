import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Escudo da AABB Jandaia do Sul (SVG)
   Três variações: mini (topbar/carteirinha), grande (hero) e rodapé.
───────────────────────────────────────────────────────────── */

export function CrestMini({ className = '' }) {
  return (
    <svg className={`crest-mini ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#0e244a" stroke="#c89525" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="22" fill="#efe6ce" />
      <text
        x="32" y="40"
        fontFamily="Big Shoulders Display" fontWeight="900" fontSize="22"
        letterSpacing="-1.2" textAnchor="middle" fill="#0e244a"
      >
        AABB
      </text>
    </svg>
  );
}

export function CrestBig({ className = '' }) {
  return (
    <svg viewBox="0 0 400 400" className={`crest-big ${className}`} aria-label="Escudo da AABB Jandaia do Sul">
      <defs>
        <path id="crestArcTop" d="M 60 200 A 140 140 0 0 1 340 200" fill="none" />
        <path id="crestArcBot" d="M 70 220 A 130 130 0 0 0 330 220" fill="none" />
      </defs>

      {/* sombra */}
      <circle cx="204" cy="208" r="180" fill="#0a1a36" opacity="0.18" />

      {/* anéis externos */}
      <circle cx="200" cy="200" r="184" fill="#c89525" />
      <circle cx="200" cy="200" r="178" fill="#0e244a" />
      <circle cx="200" cy="200" r="176" fill="none" stroke="#c89525" strokeWidth="1" />

      {/* texto curvo superior */}
      <text fontFamily="Big Shoulders Display" fontSize="22" fontWeight="700" fill="#c89525" letterSpacing="6" textAnchor="middle">
        <textPath href="#crestArcTop" startOffset="50%">ASSOCIAÇÃO ATLÉTICA</textPath>
      </text>

      {/* texto curvo inferior */}
      <text fontFamily="Big Shoulders Display" fontSize="22" fontWeight="700" fill="#c89525" letterSpacing="6" textAnchor="middle">
        <textPath href="#crestArcBot" startOffset="50%">BANCO DO BRASIL</textPath>
      </text>

      {/* estrelas laterais */}
      <g fill="#c89525">
        <polygon points="68,200 71,209 80,209 73,215 76,224 68,219 60,224 63,215 56,209 65,209" />
        <polygon points="332,200 335,209 344,209 337,215 340,224 332,219 324,224 327,215 320,209 329,209" />
      </g>

      {/* círculo creme interno */}
      <circle cx="200" cy="200" r="118" fill="#efe6ce" />
      <circle cx="200" cy="200" r="118" fill="none" stroke="#c89525" strokeWidth="2" />
      <circle cx="200" cy="200" r="112" fill="none" stroke="#0e244a" strokeWidth="0.8" opacity="0.3" />

      {/* monograma AABB */}
      <text x="200" y="208" fontFamily="Big Shoulders Display" fontWeight="900" fontSize="106" textAnchor="middle" fill="#0e244a" letterSpacing="-6">
        AABB
      </text>

      {/* linha divisória superior */}
      <line x1="148" y1="138" x2="252" y2="138" stroke="#0e244a" strokeWidth="1.5" opacity="0.4" />

      {/* tag Jandaia */}
      <text x="200" y="128" fontFamily="Newsreader" fontStyle="italic" fontSize="16" textAnchor="middle" fill="#0e244a">
        Jandaia do Sul
      </text>

      {/* fita do ano de fundação */}
      <g transform="translate(200 250)">
        <path d="M -52 0 L -46 14 L 46 14 L 52 0 L 46 -14 L -46 -14 Z" fill="#0e244a" />
        <path d="M -52 0 L -46 -14 L -58 -10 Z M 52 0 L 46 -14 L 58 -10 Z" fill="#0a1a36" />
        <text x="0" y="6" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="20" textAnchor="middle" fill="#c89525" letterSpacing="2">
          1978
        </text>
      </g>

      {/* pequena estrela acima do ano */}
      <polygon points="200,232 202,238 208,238 203,242 205,248 200,244 195,248 197,242 192,238 198,238" fill="#c89525" />
    </svg>
  );
}

export function FootCrest({ className = '' }) {
  return (
    <svg className={`foot-crest ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="none" stroke="#c89525" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="86" fill="#0e244a" />
      <circle cx="100" cy="100" r="60" fill="#efe6ce" />
      <text x="100" y="108" fontFamily="Big Shoulders Display" fontWeight="900" fontSize="48" letterSpacing="-3" textAnchor="middle" fill="#0e244a">
        AABB
      </text>
      <text x="100" y="160" fontFamily="Newsreader" fontStyle="italic" fontSize="14" textAnchor="middle" fill="#c89525">
        desde 1978
      </text>
    </svg>
  );
}
