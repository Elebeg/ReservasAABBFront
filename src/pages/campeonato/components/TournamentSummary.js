import TeamLogo from './TeamLogo';
import { teamForm } from './campHelpers';

const fmtDay  = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const fmtTime = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function FormDots({ form }) {
  if (!form.length) return null;
  return (
    <span className="rs-form">
      {form.map((r, i) => (
        <span key={i} className={`cs-form-dot cs-form-${r.toLowerCase()}`}>
          {r === 'W' ? 'V' : r === 'D' ? 'E' : 'D'}
        </span>
      ))}
    </span>
  );
}

export default function TournamentSummary({ standings, matches = [], players = [], onTab, onTeamClick }) {
  // Líder: melhor por pontos (depois saldo) entre todos os grupos
  const allRows = (standings || []).flatMap(g => (g.standings || []));
  const leader = [...allRows].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff)[0] || null;

  // Artilheiro
  const scorer = [...(players || [])].sort((a, b) => b.goals - a.goals)[0];
  const topScorer = scorer && scorer.goals > 0 ? scorer : null;

  const next = (matches || [])
    .filter(m => m.status === 'SCHEDULED')
    .sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return new Date(a.scheduledAt) - new Date(b.scheduledAt);
      if (a.scheduledAt) return -1;
      if (b.scheduledAt) return 1;
      return a.id - b.id;
    })
    .slice(0, 4);

  const last = (matches || [])
    .filter(m => m.status === 'FINISHED')
    .sort((a, b) => new Date(b.scheduledAt || 0) - new Date(a.scheduledAt || 0))
    .slice(0, 4);

  return (
    <div className="rs-wrap">

      {/* Destaques */}
      <div className="rs-highlights">
        {leader && (
          <button className="rs-hl rs-hl--leader" onClick={() => onTab && onTab('standings')}>
            <span className="rs-hl-tag">Líder</span>
            <div className="rs-hl-main">
              <TeamLogo name={leader.team} logoUrl={leader.teamLogo} size={56} shape="shield" />
              <div className="rs-hl-info">
                <span className="rs-hl-name">{leader.team}</span>
                <span className="rs-hl-sub">{leader.points} pts · {leader.wins}V {leader.draws}E {leader.losses}D</span>
                <FormDots form={teamForm(leader.team, matches)} />
              </div>
            </div>
          </button>
        )}

        {topScorer && (
          <button className="rs-hl rs-hl--scorer" onClick={() => onTab && onTab('players')}>
            <span className="rs-hl-tag">Artilheiro</span>
            <div className="rs-hl-main">
              {topScorer.team && <TeamLogo name={topScorer.team.name} logoUrl={topScorer.team.logoUrl} size={56} shape="shield" />}
              <div className="rs-hl-info">
                <span className="rs-hl-name">{topScorer.name}</span>
                <span className="rs-hl-sub">{topScorer.team?.name || '—'}</span>
              </div>
              <div className="rs-hl-goals">
                <span className="rs-hl-goals-num">{topScorer.goals}</span>
                <span className="rs-hl-goals-lbl">gols</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Próximos jogos + últimos resultados */}
      <div className="rs-cols">
        <section className="rs-block">
          <div className="rs-block-head">
            <h3>Próximos jogos</h3>
            <button className="rs-link" onClick={() => onTab && onTab('matches')}>Ver agenda →</button>
          </div>
          {next.length > 0 ? (
            <ul className="rs-mini">
              {next.map(m => (
                <li key={m.id} className="rs-mini-row">
                  <span className="rs-mini-when">
                    {m.scheduledAt ? `${fmtDay(m.scheduledAt)} · ${fmtTime(m.scheduledAt)}` : 'A definir'}
                  </span>
                  <span className="rs-mini-game">
                    <strong>{m.homeTeam?.name || 'A definir'}</strong>
                    <em>vs</em>
                    <strong>{m.awayTeam?.name || 'A definir'}</strong>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rs-empty">Sem jogos agendados.</p>
          )}
        </section>

        <section className="rs-block">
          <div className="rs-block-head">
            <h3>Últimos resultados</h3>
            <button className="rs-link" onClick={() => onTab && onTab('matches')}>Ver todos →</button>
          </div>
          {last.length > 0 ? (
            <ul className="rs-mini">
              {last.map(m => {
                const homeWon = m.homeScore > m.awayScore;
                const awayWon = m.awayScore > m.homeScore;
                const sc = homeWon ? 'ag-score--home' : awayWon ? 'ag-score--away' : 'ag-score--draw';
                return (
                  <li
                    key={m.id}
                    className="rs-mini-row rs-mini-row--result"
                    onClick={() => onTeamClick && m.homeTeam && onTeamClick({ name: m.homeTeam.name, logoUrl: m.homeTeam.logoUrl })}
                  >
                    <span className={`rs-mini-team${homeWon ? ' won' : ''}`}>{m.homeTeam?.name || '—'}</span>
                    <span className={`rs-mini-score ${sc}`}>{m.homeScore}<i>–</i>{m.awayScore}</span>
                    <span className={`rs-mini-team ta-right${awayWon ? ' won' : ''}`}>{m.awayTeam?.name || '—'}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rs-empty">Nenhum jogo finalizado ainda.</p>
          )}
        </section>
      </div>
    </div>
  );
}
