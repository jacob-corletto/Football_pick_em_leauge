const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define your Mongoose models (User, Game, Pick)

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    score: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

const gameSchema = new mongoose.Schema({
    homeTeam: String,
    awayTeam: String,
    week: Number,
    winner: String
});

const Game = mongoose.model('Game', gameSchema);

const pickSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    winner: String,
    week: Number // Add week field
});

const Pick = mongoose.model('Pick', pickSchema);

// Generate JWT tokens
const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send('Username and password are required');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {    
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).send('Invalid credentials');
        }
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        res.send({ accessToken, refreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Refresh token route
app.post('/api/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send('Refresh token required');
    }
    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = { _id: payload.userId };
        const newAccessToken = generateAccessToken(user);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error(error);
        res.status(403).send('Invalid refresh token');
    }
});

// Middleware to authenticate access tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// Middleware to authenticate admin
const authenticateAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.sendStatus(403); // Forbidden
    }
    next();
};

// Route to grant or revoke admin privileges
app.put('/api/admin/user/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin } = req.body;
        const user = await User.findByIdAndUpdate(id, { isAdmin }, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Fetch games
app.get('/api/games', authenticateToken, async (req, res) => {
    try {
        const games = await Game.find();
        res.send(games);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Check if picks have been submitted for a specific week
app.get('/api/picks/week/:week', authenticateToken, async (req, res) => {
    try {
        const { week } = req.params;
        const picks = await Pick.find({ user: req.user.userId, week });
        res.send(picks);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Submit pick
app.post('/api/picks', authenticateToken, async (req, res) => {
    try {
        const { gameId, winner } = req.body;
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).send('Game not found');
        }
        const existingPick = await Pick.findOne({ user: req.user.userId, week: game.week });
        if (existingPick) {
            return res.status(400).send('Picks for this week have already been submitted');
        }
        const pick = new Pick({ user: req.user.userId, game: gameId, winner, week: game.week });
        await pick.save();
        res.status(201).send('Pick submitted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Create game (admin only)
app.post('/api/admin/createGame', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const { homeTeam, awayTeam, week } = req.body;
        const game = new Game({ homeTeam, awayTeam, week });
        await game.save();
        res.status(201).send('Game created');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Update game result (admin only)
app.put('/api/admin/games/:id', authenticateToken, authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { winner } = req.body;
        const game = await Game.findByIdAndUpdate(id, { winner }, { new: true });
        res.send(game);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const users = await User.find().sort({ score: -1 }).select('username score');
        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});