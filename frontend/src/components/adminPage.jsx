import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPage() {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [week, setWeek] = useState('');
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [winner, setWinner] = useState('');

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

  const handleCreateGame = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/admin/createGame', { homeTeam, awayTeam, week }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Game created');
      setHomeTeam('');
      setAwayTeam('');
      setWeek('');
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game');
    }
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/admin/games/${selectedGame}`, { winner }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Game updated');
      setSelectedGame('');
      setWinner('');
    } catch (error) {
      console.error('Error updating game:', error);
      alert('Error updating game');
    }
  };

  return (
    <div>
      <h2>Create Game</h2>
      <form onSubmit={handleCreateGame}>
        <input
          type="text"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          placeholder="Home Team"
          required
        />
        <input
          type="text"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          placeholder="Away Team"
          required
        />
        <input
          type="number"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          placeholder="Week"
          required
        />
        <button type="submit">Create Game</button>
      </form>

      <h2>Update Game Result</h2>
      <form onSubmit={handleUpdateGame}>
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          required
        >
          <option value="">Select Game</option>
          {games.map(game => (
            <option key={game._id} value={game._id}>
              {game.homeTeam} vs {game.awayTeam} (Week {game.week})
            </option>
          ))}
        </select>
        <input
          type="text"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          placeholder="Winner"
          required
        />
        <button type="submit">Update Game</button>
      </form>
    </div>
  );
}