import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Planta da sede (SVG) — usada na Home e na página de Estrutura.
───────────────────────────────────────────────────────────── */
export function ClubMap() {
  return (
    <svg viewBox="0 0 360 480" className="map-svg" aria-hidden="true">
      <rect width="360" height="480" fill="#efe6ce" />
      <rect width="360" height="480" fill="none" stroke="#0e244a" strokeWidth="1" />

      <text x="20" y="34" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="14" fill="#0e244a" letterSpacing="2">
        PLANTA · SEDE PRÓPRIA
      </text>
      <text x="20" y="50" fontFamily="Newsreader" fontStyle="italic" fontSize="12" fill="#0e244a" opacity="0.65">
        Escala aproximada · sem proporção rigorosa
      </text>

      {/* bosque */}
      <g fill="#29512f" opacity="0.55">
        <circle cx="60" cy="100" r="10" /><circle cx="90" cy="115" r="9" />
        <circle cx="50" cy="130" r="11" /><circle cx="85" cy="150" r="8" />
        <circle cx="65" cy="170" r="10" /><circle cx="100" cy="180" r="9" />
        <circle cx="55" cy="200" r="11" /><circle cx="90" cy="220" r="10" />
        <circle cx="70" cy="240" r="9" /><circle cx="40" cy="260" r="10" />
        <circle cx="80" cy="280" r="11" /><circle cx="50" cy="300" r="9" />
        <circle cx="95" cy="320" r="10" /><circle cx="60" cy="340" r="11" />
        <circle cx="80" cy="370" r="10" /><circle cx="50" cy="390" r="9" />
        <circle cx="95" cy="410" r="11" /><circle cx="65" cy="430" r="10" />
      </g>

      {/* piscina I */}
      <rect x="140" y="80" width="120" height="70" fill="#1a5f9e" stroke="#0e244a" strokeWidth="1" />
      <rect x="142" y="82" width="116" height="66" fill="none" stroke="#c89525" strokeWidth="0.5" opacity="0.5" />
      <line x1="145" y1="115" x2="255" y2="115" stroke="#efe6ce" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.7" />
      <text x="200" y="120" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="16" textAnchor="middle" fill="#efe6ce">I</text>

      {/* piscina infantil */}
      <rect x="275" y="100" width="60" height="40" fill="#1a5f9e" stroke="#0e244a" strokeWidth="1" />

      {/* beach tennis II */}
      <g transform="translate(140 170)">
        <rect width="58" height="80" fill="#c89525" stroke="#0e244a" strokeWidth="1" />
        <rect x="64" width="58" height="80" fill="#c89525" stroke="#0e244a" strokeWidth="1" />
        <rect x="128" width="58" height="80" fill="#c89525" stroke="#0e244a" strokeWidth="1" />
        <line x1="29" y1="0" x2="29" y2="80" stroke="#efe6ce" strokeWidth="0.5" />
        <line x1="93" y1="0" x2="93" y2="80" stroke="#efe6ce" strokeWidth="0.5" />
        <line x1="157" y1="0" x2="157" y2="80" stroke="#efe6ce" strokeWidth="0.5" />
        <text x="93" y="48" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="16" textAnchor="middle" fill="#0e244a">II</text>
      </g>

      {/* campo III */}
      <g transform="translate(140 270)">
        <rect width="196" height="100" fill="#29512f" stroke="#0e244a" strokeWidth="1" />
        <rect x="4" y="4" width="188" height="92" fill="none" stroke="#efe6ce" strokeWidth="0.6" />
        <line x1="98" y1="4" x2="98" y2="96" stroke="#efe6ce" strokeWidth="0.6" />
        <circle cx="98" cy="50" r="12" fill="none" stroke="#efe6ce" strokeWidth="0.6" />
        <rect x="4" y="30" width="14" height="40" fill="none" stroke="#efe6ce" strokeWidth="0.6" />
        <rect x="178" y="30" width="14" height="40" fill="none" stroke="#efe6ce" strokeWidth="0.6" />
        <text x="98" y="56" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="18" textAnchor="middle" fill="#efe6ce">III</text>
      </g>

      {/* quadra coberta IV */}
      <rect x="140" y="390" width="90" height="56" fill="#a73022" stroke="#0e244a" strokeWidth="1" />
      <rect x="146" y="396" width="78" height="44" fill="none" stroke="#efe6ce" strokeWidth="0.5" />
      <text x="185" y="424" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="16" textAnchor="middle" fill="#efe6ce">IV</text>

      {/* salão V */}
      <rect x="240" y="170" width="95" height="80" fill="#0e244a" stroke="#0e244a" strokeWidth="1" />
      <text x="287" y="215" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="16" textAnchor="middle" fill="#c89525">V</text>

      {/* churrasqueiras VI */}
      <g fill="#0e244a" opacity="0.85">
        <rect x="245" y="395" width="14" height="14" /><rect x="263" y="395" width="14" height="14" />
        <rect x="281" y="395" width="14" height="14" /><rect x="299" y="395" width="14" height="14" />
        <rect x="245" y="413" width="14" height="14" /><rect x="263" y="413" width="14" height="14" />
        <rect x="281" y="413" width="14" height="14" /><rect x="299" y="413" width="14" height="14" />
      </g>
      <text x="280" y="445" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="12" textAnchor="middle" fill="#0e244a">
        VI · CHURRASQUEIRAS
      </text>

      {/* salão dos sócios VII */}
      <rect x="240" y="260" width="95" height="44" fill="#efe6ce" stroke="#0e244a" strokeWidth="1.5" />
      <line x1="240" y1="268" x2="335" y2="268" stroke="#0e244a" strokeWidth="0.5" />
      <text x="287" y="290" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="14" textAnchor="middle" fill="#0e244a">VII</text>

      {/* entrada */}
      <g transform="translate(150 458)">
        <rect width="80" height="14" fill="#c89525" stroke="#0e244a" strokeWidth="1" />
        <text x="40" y="11" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="9" textAnchor="middle" fill="#0e244a" letterSpacing="2">
          ENTRADA
        </text>
      </g>

      {/* bússola */}
      <g transform="translate(320 455)">
        <circle cx="0" cy="0" r="14" fill="none" stroke="#0e244a" strokeWidth="0.8" />
        <polygon points="0,-10 3,0 0,2 -3,0" fill="#a73022" />
        <polygon points="0,10 3,0 0,-2 -3,0" fill="#0e244a" />
        <text x="0" y="-16" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="9" textAnchor="middle" fill="#0e244a">N</text>
      </g>
    </svg>
  );
}

export default ClubMap;
