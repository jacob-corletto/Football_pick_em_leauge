import { useState, useEffect } from "react";
import axios from "axios";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }
                const response = await axios.get('/api/leaderboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (Array.isArray(response.data)) {
                    setLeaderboard(response.data);
                } else {
                    console.error('Unexpected response data:', response.data);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Leaderboard</h2>
            <ul>
                {leaderboard.map(user => (
                    <li key={user._id}>
                        {user.username} - Score: {user.score}
                    </li>
                ))}
            </ul>
        </div>
    );
}