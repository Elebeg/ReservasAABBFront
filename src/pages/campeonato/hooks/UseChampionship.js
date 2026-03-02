import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://reservasaabb-production.up.railway.app';

async function fetchJSON(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export function useChampionship() {
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings]   = useState([]);
  const [bracket, setBracket]       = useState(null);
  const [matches, setMatches]       = useState([]);
  const [players, setPlayers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const t = await fetchJSON('/championship/active');
      setTournament(t);

      const [s, b, m, p] = await Promise.allSettled([
        fetchJSON('/championship/active/standings'),
        fetchJSON('/championship/active/bracket'),
        fetchJSON('/championship/active/matches'),
        fetchJSON('/championship/active/players'),
      ]);

      if (s.status === 'fulfilled') setStandings(s.value || []);
      if (b.status === 'fulfilled') setBracket(b.value || null);
      if (m.status === 'fulfilled') setMatches(m.value || []);
      if (p.status === 'fulfilled') setPlayers(p.value || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { tournament, standings, bracket, matches, players, loading, error, reload: load };
}
