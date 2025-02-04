import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PickSubmission() {
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState({});

  useEffect(() => {
    const fetchGames = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/games', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setGames(response.data);
    };
    fetchGames();
  }, []);

  const handlePick = (gameId, team) => {
    setPicks(prevPicks => ({ ...prevPicks, [gameId]: team }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      for (const [gameId, winner] of Object.entries(picks)) {
        await axios.post('/api/picks', { gameId, winner }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      alert('Picks submitted');
    } catch (error) {
      console.error('Error submitting picks:', error);
      alert('Error submitting picks');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {games.map(game => (
        <div key={game._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <button type="button" onClick={() => handlePick(game._id, game.homeTeam)}>
            {game.homeTeam}
          </button>
          <span>vs</span>
          <button type="button" onClick={() => handlePick(game._id, game.awayTeam)}>
            {game.awayTeam}
          </button>
        </div>
      ))}
      <button type="submit">Submit Picks</button>
    </form>
  );
}