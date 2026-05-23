import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../contexts/AuthContext';
import { CrestBig, CrestMini } from '../components/Crest';
import { ClubMap } from '../components/ClubMap';

const API_URL = 'https://reservasaabb-production.up.railway.app';

const STATUS_LABELS = {
  DRAFT:          'Em breve',
  GROUP_STAGE:    'Fase de grupos',
  KNOCKOUT_STAGE: 'Mata-mata',
  FINISHED:       'Encerrado',
};

// ── Hook: prévia do campeonato ativo ───────────────────────────────────────────
function useTournamentPreview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${API_URL}/championship/active/all`)
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (json?.tournament) setData(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { data, loading };
}

// ── SVG: troféu ─────────────────────────────────────────────────────────────
function Trophy({ year }) {
  return (
    <svg viewBox="0 0 200 240" className="trophy" aria-hidden="true">
      <path d="M 50 70 Q 20 80 30 130 Q 35 145 55 140" fill="none" stroke="#c89525" strokeWidth="6" />
      <path d="M 150 70 Q 180 80 170 130 Q 165 145 145 140" fill="none" stroke="#c89525" strokeWidth="6" />
      <path d="M 50 50 L 50 110 Q 50 150 100 160 Q 150 150 150 110 L 150 50 Z" fill="#c89525" />
      <rect x="42" y="42" width="116" height="14" fill="#a07415" />
      <path d="M 60 60 L 60 120 Q 64 130 76 132" fill="none" stroke="#f2cf6c" strokeWidth="3" opacity="0.8" />
      <rect x="92" y="160" width="16" height="20" fill="#a07415" />
      <rect x="60" y="180" width="80" height="14" fill="#0e244a" />
      <rect x="50" y="190" width="100" height="8" fill="#0a1a36" />
      <rect x="70" y="184" width="60" height="6" fill="#c89525" />
      <text x="100" y="105" fontFamily="Big Shoulders Display" fontWeight="900" fontSize="36" textAnchor="middle" fill="#0e244a">
        {year}
      </text>
      <g fill="#efe6ce" opacity="0.9">
        <polygon points="100,70 102,76 108,76 103,80 105,86 100,82 95,86 97,80 92,76 98,76" />
      </g>
    </svg>
  );
}

// ── Campeonato: dados reais da API ────────────────────────────────────────────
function ChampSide({ data, loading, year }) {
  const tournament = data?.tournament || null;
  const matches = data?.matches || [];

  const teamName = team => team?.name || 'A definir';
  const fmtDate = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const fmtTime = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const finished = matches
    .filter(m => m.status === 'FINISHED' && (m.homeTeam || m.awayTeam))
    .sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return new Date(b.scheduledAt) - new Date(a.scheduledAt);
      if (b.scheduledAt) return 1;
      if (a.scheduledAt) return -1;
      return b.id - a.id;
    });
  const lastFinished = finished[0];

  const upcoming = matches
    .filter(m => m.status === 'SCHEDULED')
    .sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return new Date(a.scheduledAt) - new Date(b.scheduledAt);
      if (a.scheduledAt) return -1;
      if (b.scheduledAt) return 1;
      return a.id - b.id;
    })
    .slice(0, 4);

  const statusLabel = STATUS_LABELS[tournament?.status] || 'Edição ' + year;

  // crista mini com iniciais do time
  const initials = name =>
    (name || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();

  return (
    <>
      <div className="trophy-card">
        <Trophy year={year} />
        <div className="trophy-cap">
          <div className="tc-eye">{tournament ? statusLabel : 'Campeonato interno'}</div>
          <div className="tc-name">
            {tournament?.name || 'Campeonato Interno de Futebol Suíço'}
          </div>
          <div className="tc-detail">
            {tournament?.description || 'Times do clube · fins de semana · final na sede'}
          </div>
        </div>
      </div>

      <div className="champ-side">
        {loading && (
          <div className="champ-empty">
            <span className="champ-spinner" />
            <span>Carregando o campeonato…</span>
          </div>
        )}

        {!loading && !tournament && (
          <div className="champ-empty">
            <p>Nenhum campeonato ativo no momento.</p>
            <span className="champ-empty-sub">Fique de olho — a próxima edição vem aí.</span>
          </div>
        )}

        {!loading && tournament && (
          <>
            {lastFinished && (
              <div className="board-result">
                <div className="br-eye">
                  Último resultado{lastFinished.scheduledAt ? ` · ${fmtDate(lastFinished.scheduledAt)}` : ''}
                </div>
                <div className="br-row">
                  <div className="br-team">
                    <div className="br-crest" data-team="cf">{initials(lastFinished.homeTeam?.name)}</div>
                    <span>{teamName(lastFinished.homeTeam)}</span>
                  </div>
                  <div className="br-score">
                    <span>{lastFinished.homeScore ?? '–'}</span>
                    <em>×</em>
                    <span>{lastFinished.awayScore ?? '–'}</span>
                  </div>
                  <div className="br-team br-team--right">
                    <span>{teamName(lastFinished.awayTeam)}</span>
                    <div className="br-crest" data-team="ot">{initials(lastFinished.awayTeam?.name)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="champ-cols">
              <div className="cc-block">
                <div className="cc-eye">Próximas partidas</div>
                {upcoming.length > 0 ? (
                  <ul className="upcoming">
                    {upcoming.map(m => (
                      <li key={m.id}>
                        <span className="up-when">
                          {m.scheduledAt ? `${fmtDate(m.scheduledAt)} · ${fmtTime(m.scheduledAt)}` : 'A definir'}
                        </span>
                        <span className="up-game">
                          <strong>{teamName(m.homeTeam)}</strong>
                          <em>vs</em>
                          <strong>{teamName(m.awayTeam)}</strong>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="cc-note">Tabela em montagem. Em breve as próximas rodadas.</p>
                )}
              </div>

              <div className="cc-block cc-block--cta">
                <div className="cc-eye">Acompanhe tudo</div>
                <p className="cc-note">
                  Tabela completa, classificação, artilharia e chaveamento do mata-mata,
                  atualizados a cada rodada.
                </p>
                <Link to="/campeonato" className="champ-link">
                  Ver o campeonato <span className="btn-arrow">→</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── Página ──────────────────────────────────────────────────────────────────
function Home() {
  const auth = useAuth();
  const user = auth?.user || null;
  const loggedIn = auth?.isAuthenticated ? auth.isAuthenticated() : !!user;
  const firstName = user?.name ? user.name.split(' ')[0] : null;

  const { data: tournamentData, loading: tournamentLoading } = useTournamentPreview();
  const year = new Date().getFullYear();
  const cardName = loggedIn && user?.name ? user.name : 'João da Silva';

  return (
    <div className="clube-home">

      {/* ─────────── HERO ─────────── */}
      <section className="hero">
        <div className="hero-stripes" aria-hidden="true" />

        <div className="wrap hero-grid">
          <div className="hero-crest">
            <CrestBig />
          </div>

          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="he-line" />
              <span className="he-text">
                {loggedIn && firstName ? `Bem-vindo de volta, ${firstName}` : 'Sócios · Famílias · Convidados'}
              </span>
              <span className="he-line" />
            </div>

            <h1 className="hero-title">
              Um clube<br />
              <em>pequeno</em>,<br />
              uma família<br />
              <span className="hero-title-big">grande.</span>
            </h1>

            <p className="hero-sub">
              Desde 1978, recebendo gente de Jandaia do Sul para um sábado que vale por uma
              semana: piscina, quadra, salão e churrasqueira.
            </p>

            <div className="hero-cta">
              {loggedIn ? (
                <>
                  <Link to="/reservas" className="btn-primary">
                    <span>Reservar quadra</span>
                  </Link>
                  <Link to="/campeonato" className="btn-ghost">Ver o campeonato</Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn-primary">
                    <span>Entre na família</span>
                    <span className="btn-arrow">→</span>
                  </Link>
                  <a href="#esportes" className="btn-ghost">Conheça os esportes</a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="pennants" aria-hidden="true">
          {['blue', 'gold', 'cream', 'blue', 'red', 'gold', 'blue', 'cream', 'gold', 'red', 'blue', 'gold', 'cream', 'blue', 'red', 'gold'].map((c, i) => (
            <div key={i} className={`pennant pennant--${c}`} />
          ))}
        </div>
      </section>

      {/* ─────────── ESPORTES ─────────── */}
      <section className="sports" id="esportes">
        <div className="sash" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              <span>Departamento de Esportes</span><span>·</span>
              <span>AABB Jandaia</span><span>·</span>
              <span>Sócios e família</span><span>·</span>
            </React.Fragment>
          ))}
        </div>

        <div className="wrap">
          <div className="sports-head">
            <div className="sports-eye">
              <span className="bn">01</span>
              <span>Modalidades · O clube em campo</span>
            </div>
            <h2 className="sports-title">Quatro esportes,<br /><em>uma só</em> torcida.</h2>
            <p className="sports-sub">
              Cada modalidade tem o seu horário e a sua turma. Sem cobrança por esporte —
              o sócio escolhe quantas quiser, e a família toda treina junta.
            </p>
          </div>

          <div className="jerseys">
            <article className="jersey jersey--blue">
              <div className="j-back" />
              <div className="j-num">07</div>
              <div className="j-name">Natação</div>
              <div className="j-info">
                <span className="j-courts">Piscinas adulto e infantil</span>
                <span className="j-coach">Escolinha · todas as idades</span>
              </div>
              <div className="j-meta">
                <span>Ter · Qui · Sáb</span>
                <span>A partir dos 3 anos</span>
              </div>
            </article>

            <article className="jersey jersey--gold">
              <div className="j-back" />
              <div className="j-num">10</div>
              <div className="j-name">Beach Tennis</div>
              <div className="j-info">
                <span className="j-courts">Três quadras de areia</span>
                <span className="j-coach">Aulas e jogos livres</span>
              </div>
              <div className="j-meta">
                <span>Ter a Dom</span>
                <span>Reserva online</span>
              </div>
            </article>

            <article className="jersey jersey--blue">
              <div className="j-back" />
              <div className="j-num">09</div>
              <div className="j-name">Futebol Suíço</div>
              <div className="j-info">
                <span className="j-courts">Campo oficial gramado</span>
                <span className="j-coach">Peladas e campeonato</span>
              </div>
              <div className="j-meta">
                <span>Sáb pelada · Dom oficial</span>
                <span>Campeonato anual</span>
              </div>
            </article>

            <article className="jersey jersey--cream">
              <div className="j-back" />
              <div className="j-num">06</div>
              <div className="j-name">Vôlei de Areia</div>
              <div className="j-info">
                <span className="j-courts">Quadra coberta e areia</span>
                <span className="j-coach">Treinos e amistosos</span>
              </div>
              <div className="j-meta">
                <span>Seg · Qua · Sex</span>
                <span>Indoor & areia</span>
              </div>
            </article>
          </div>

          <div className="sports-foot">
            <Link to="/esportes" className="btn-ghost">Ver todas as modalidades →</Link>
          </div>
        </div>
      </section>

      {/* ─────────── ESTRUTURA ─────────── */}
      <section className="estrutura" id="estrutura">
        <div className="wrap est-grid">
          <div className="est-text">
            <div className="est-eye">
              <span className="bn bn--gold">02</span>
              <span>Estrutura do clube</span>
            </div>
            <h2 className="est-title">Vinte mil metros<br />de <em>tradição</em>.</h2>
            <p className="est-lede">
              Mais de 20.000m² de área verde, piscinas, quadras, salão de festas e o bosque
              com as churrasqueiras — tudo no mesmo terreno, do jeito que o sócio gosta.
            </p>

            <div className="plate-stack">
              <div className="plate">
                <span className="plate-num">I</span>
                <span className="plate-label">Conjunto aquático</span>
                <span className="plate-desc">Piscina adulto · piscina infantil rasa · solário</span>
              </div>
              <div className="plate">
                <span className="plate-num">II</span>
                <span className="plate-label">Quadras de beach tennis</span>
                <span className="plate-desc">Três quadras de areia · iluminadas à noite</span>
              </div>
              <div className="plate">
                <span className="plate-num">III</span>
                <span className="plate-label">Campo de futebol suíço</span>
                <span className="plate-desc">Gramado natural · medidas oficiais · holofotes</span>
              </div>
              <div className="plate">
                <span className="plate-num">IV</span>
                <span className="plate-label">Quadra poliesportiva</span>
                <span className="plate-desc">Piso para vôlei e futsal · cobertura</span>
              </div>
              <div className="plate">
                <span className="plate-num">V</span>
                <span className="plate-label">Salão de festas</span>
                <span className="plate-desc">Para eventos do clube e dos sócios · cozinha</span>
              </div>
              <div className="plate">
                <span className="plate-num">VI</span>
                <span className="plate-label">Bosque & churrasqueiras</span>
                <span className="plate-desc">Churrasqueiras numeradas · área verde · caminhada</span>
              </div>
              <div className="plate">
                <span className="plate-num">VII</span>
                <span className="plate-label">Salão dos sócios</span>
                <span className="plate-desc">Sinuca · mesas de jogos · convivência</span>
              </div>
            </div>

            <div className="est-foot">
              <Link to="/estrutura" className="btn-ghost">Conheça a estrutura completa →</Link>
            </div>
          </div>

          <div className="est-map">
            <ClubMap />
          </div>
        </div>
      </section>

      {/* ─────────── CAMPEONATO (dados reais) ─────────── */}
      <section className="campeonato" id="campeonato">
        <div className="wrap">
          <div className="champ-head">
            <div className="champ-eye">
              <span className="bn bn--gold">03</span>
              <span>Departamento de futebol · Edição {year}</span>
            </div>
            <h2 className="champ-title">O campeonato<br /><em>do clube</em>.</h2>
          </div>

          <div className="champ-grid">
            <ChampSide data={tournamentData} loading={tournamentLoading} year={year} />
          </div>
        </div>
      </section>

      {/* ─────────── HISTÓRIA ─────────── */}
      <section className="historia" id="historia">
        <div className="wrap">
          <div className="hist-head">
            <div className="hist-eye">
              <span className="bn">04</span>
              <span>Memória do clube</span>
            </div>
            <h2 className="hist-title">{year - 1978} anos<br />no <em>mesmo terreno</em>.</h2>
          </div>

          <div className="timeline">
            <div className="tl-line" aria-hidden="true" />

            <article className="tl-item">
              <div className="tl-year">1978</div>
              <div className="tl-card">
                <div className="tl-tag">Fundação</div>
                <p>Nasce a Associação Atlética Banco do Brasil em Jandaia do Sul, reunindo
                funcionários e famílias em torno do esporte e do lazer.</p>
              </div>
            </article>

            <article className="tl-item">
              <div className="tl-year">Anos 80</div>
              <div className="tl-card">
                <div className="tl-tag">Sede própria</div>
                <p>O clube fixa raízes na sede definitiva e ergue o salão de festas, ponto de
                encontro das famílias até hoje.</p>
              </div>
            </article>

            <article className="tl-item">
              <div className="tl-year">Anos 90</div>
              <div className="tl-card">
                <div className="tl-tag">Bola na rede</div>
                <p>O campo ganha gramado e o futebol suíço vira tradição de fim de semana, com
                o campeonato interno reunindo os times do clube.</p>
              </div>
            </article>

            <article className="tl-item">
              <div className="tl-year">2010s</div>
              <div className="tl-card">
                <div className="tl-tag">Areia chegou</div>
                <p>Inauguram as quadras de beach tennis e a modalidade vira a queridinha do
                sócio, ocupando a agenda da semana inteira.</p>
              </div>
            </article>

            <article className="tl-item">
              <div className="tl-year">2020s</div>
              <div className="tl-card">
                <div className="tl-tag">Renovação</div>
                <p>O conjunto aquático e os espaços de convivência se modernizam, mantendo o
                coração do clube: a família reunida.</p>
              </div>
            </article>

            <article className="tl-item tl-item--now">
              <div className="tl-year">Hoje</div>
              <div className="tl-card">
                <div className="tl-tag tl-tag--now">{year} · Em curso</div>
                <p>Reserva de quadras pelo app, campeonato acompanhado online e o calendário de
                festas a todo vapor. O clube de sempre, agora digital.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ─────────── SER SÓCIO (carteirinha) ─────────── */}
      <section className="socio" id="socio">
        <div className="socio-stripes" aria-hidden="true" />

        <div className="wrap socio-grid">
          <div className="socio-text">
            <div className="socio-eye">
              <span className="bn bn--gold">05</span>
              <span>{loggedIn ? 'Você já é do clube' : 'Tornar-se sócio'}</span>
            </div>
            <h2 className="socio-title">Uma carteirinha,<br /><em>o ano inteiro</em><br />de clube.</h2>
            <p className="socio-lede">
              Mensalidade única, sem cobrança por modalidade. Vale para a família — e o clube
              inteiro fica à disposição, do mergulho de sábado ao forró à noite.
            </p>
            <ul className="socio-bullets">
              <li><span className="sb-check">✓</span> Piscina, quadras e salão liberados.</li>
              <li><span className="sb-check">✓</span> Reserva digital de quadra pelo app.</li>
              <li><span className="sb-check">✓</span> Participação no campeonato interno.</li>
              <li><span className="sb-check">✓</span> Convite para as festas do calendário.</li>
            </ul>

            {loggedIn ? (
              <Link to="/reservas" className="btn-primary btn-primary--large">
                <span>Reservar minha quadra</span>
                <span className="btn-arrow">→</span>
              </Link>
            ) : (
              <Link to="/register" className="btn-primary btn-primary--large">
                <span>Quero ser sócio</span>
                <span className="btn-arrow">→</span>
              </Link>
            )}
            <span className="socio-fine">
              {loggedIn
                ? 'Bom te ver por aqui. Sua quadra favorita está te esperando.'
                : 'Cadastro rápido. Depois é só escolher o horário e jogar.'}
            </span>
          </div>

          <div className="socio-card-wrap">
            <div className="socio-card">
              <div className="sc-top">
                <CrestMini className="sc-crest" />
                <div className="sc-id">
                  <div className="sc-name">Associação Atlética<br />Banco do Brasil</div>
                  <div className="sc-loc">Jandaia do Sul · Paraná</div>
                </div>
                <div className="sc-issue">
                  <div className="sc-issue-label">Emissão</div>
                  <div className="sc-issue-val">{year}</div>
                </div>
              </div>

              <div className="sc-portrait">
                <div className="sc-photo" />
                <div className="sc-mono">{(firstName?.[0] || 'J')}{(user?.name?.split(' ').slice(-1)[0]?.[0] || 'S')}</div>
              </div>

              <div className="sc-fields">
                <div className="sc-field"><span className="sc-fl">Sócio Nº</span><span className="sc-fv">A-0001247</span></div>
                <div className="sc-field"><span className="sc-fl">Nome</span><span className="sc-fv">{cardName}</span></div>
                <div className="sc-field"><span className="sc-fl">Categoria</span><span className="sc-fv">Familiar · Plena</span></div>
                <div className="sc-field"><span className="sc-fl">Sócio desde</span><span className="sc-fv">Clube de sempre</span></div>
              </div>

              <div className="sc-foot">
                <div className="sc-sig">
                  <span className="sc-sig-line" />
                  <span className="sc-sig-label">Diretoria do Clube</span>
                </div>
                <div className="sc-stamp">
                  <svg viewBox="0 0 60 60" className="stamp-svg" aria-hidden="true">
                    <circle cx="30" cy="30" r="28" fill="none" stroke="#a73022" strokeWidth="2" opacity="0.85" />
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#a73022" strokeWidth="1" opacity="0.85" />
                    <text x="30" y="28" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="9" textAnchor="middle" fill="#a73022" opacity="0.9">VÁLIDA</text>
                    <text x="30" y="40" fontFamily="Big Shoulders Display" fontWeight="800" fontSize="13" textAnchor="middle" fill="#a73022" opacity="0.9">{year}</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="socio-card socio-card--back">
              <div className="scb-strip" />
              <div className="scb-bar" />
              <div className="scb-text">
                A carteirinha é pessoal e intransferível. Apresentar na portaria junto com
                documento com foto. Validade até dezembro do ano impresso.
              </div>
              <div className="scb-serial">A-0001247 · {year} · AABB · JDS</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
