import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import Register from './components/Register';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';
import PickSubmission from './components/PickSubmission';
import AdminPage from './components/AdminPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.isAdmin);
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} isAdmin={isAdmin} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/submit-pick" element={<PickSubmission />} />
        {isAdmin && <Route path="/admin" element={<AdminPage />} />}
      </Routes>
    </Router>
  );
}

function Header({ isLoggedIn, setIsLoggedIn, isAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
          <li><Link to="/submit-pick">Submit Pick</Link></li>
          {isAdmin && <li><Link to="/admin">Admin</Link></li>}
          {isLoggedIn ? (
            <li><button onClick={handleLogout}>Logout</button></li>
          ) : (
            <li><Link to="/login">Login</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default App;