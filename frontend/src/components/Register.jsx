import {useState} from 'react';
import axios from 'axios';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/register', { username, password});
            console.log(response.data);
            alert('Registration successful');
        }
        catch (error) {
            console.error(error);
            alert('Registration failed');
        }
    }

        return (
            <div>
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
        )
}