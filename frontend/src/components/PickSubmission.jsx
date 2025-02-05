import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PickSubmission() {
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState({});
  const [submittedWeeks, setSubmittedWeeks] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/games', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setGames(response.data);

      // Check if picks have already been submitted for the current weeks
      const weeks = [...new Set(response.data.map(game => game.week))];
      const submittedWeeks = [];
      for (const week of weeks) {
        const pickResponse = await axios.get(`/api/picks/week/${week}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (pickResponse.data.length > 0) {
          submittedWeeks.push(week);
        }
      }
      setSubmittedWeeks(submittedWeeks);
    };
    fetchGames();
  }, []);

  const handlePick = (gameId, team) => {
    setPicks(prevPicks => ({ ...prevPicks, [gameId]: team }));
  };

  const handleSubmit = async (e, week) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const weekPicks = Object.entries(picks).filter(([gameId]) => {
        const game = games.find(game => game._id === gameId);
        return game && game.week === week;
      });
      console.log('Submitting picks for week', week, ':', weekPicks); // Log the picks being submitted
      for (const [gameId, winner] of weekPicks) {
        await axios.post('/api/picks', { gameId, winner }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      setSubmittedWeeks(prevSubmittedWeeks => [...prevSubmittedWeeks, week]);
      alert(`Picks for week ${week} submitted`);
    } catch (error) {
      console.error('Error submitting picks:', error);
      alert('Error submitting picks');
    }
  };

  const groupedGames = games.reduce((acc, game) => {
    if (!acc[game.week]) {
      acc[game.week] = [];
    }
    acc[game.week].push(game);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(groupedGames).map(([week, weekGames]) => (
        <div key={week}>
          <h2>Week {week}</h2>
          <form onSubmit={(e) => handleSubmit(e, week)}>
            {weekGames.map(game => (
              <div key={game._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label>
                  <input
                    type="radio"
                    name={`pick-${game._id}`}
                    value={game.homeTeam}
                    onChange={() => handlePick(game._id, game.homeTeam)}
                    disabled={submittedWeeks.includes(game.week)}
                    checked={picks[game._id] === game.homeTeam}
                  />
                  {game.homeTeam}
                </label>
                <span>vs</span>
                <label>
                  <input
                    type="radio"
                    name={`pick-${game._id}`}
                    value={game.awayTeam}
                    onChange={() => handlePick(game._id, game.awayTeam)}
                    disabled={submittedWeeks.includes(game.week)}
                    checked={picks[game._id] === game.awayTeam}
                  />
                  {game.awayTeam}
                </label>
              </div>
            ))}
            <button type="submit" disabled={submittedWeeks.includes(parseInt(week))}>Submit Picks for Week {week}</button>
          </form>
        </div>
      ))}
    </div>
  );
}