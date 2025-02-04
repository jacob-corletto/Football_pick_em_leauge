import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { username, password });
      localStorage.setItem('token', response.data.accessToken);
      setIsLoggedIn(true);
      navigate('/leaderboard');
      alert('User logged in');
    } catch (error) {
      console.error('Error logging in:', error);
    }
    
    Login.propTypes = {
      setIsLoggedIn: PropTypes.func.isRequired,
    };
    }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}