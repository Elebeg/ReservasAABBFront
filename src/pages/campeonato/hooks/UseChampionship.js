import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://reservasaabb-production.up.railway.app';

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
      const res = await fetch(`${API_URL}/championship/active/all`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();

      setTournament(data.tournament  || null);
      setStandings(data.standings    || []);
      setBracket(data.bracket        || null);
      setMatches(data.matches        || []);
      setPlayers(data.players        || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { tournament, standings, bracket, matches, players, loading, error, reload: load };
}
