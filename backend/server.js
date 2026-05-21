require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid'); 
const bcrypt = require('bcryptjs'); // Import encryption tool

// Import our schemas
const Url = require('./models/Url');
const User = require('./models/User'); // Import User schema

const app = express();

app.use(cors());
app.use(express.json());

// --- OPTIMIZED SERVERLESS MONGODB CONNECTION POOL ---
let isConnected = false; // Track connection state globally

const connectToDatabase = async () => {
    if (isConnected) {
        console.log('=> Using existing database connection pool.');
        return;
    }

    console.log('=> Creating new database connection pool...');
    try {
        const db = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000, // Fail quickly if connection stalls instead of hanging
            socketTimeoutMS: 45000,        // Close inactive sockets smoothly
        });
        
        isConnected = db.connections[0].readyState;
        console.log('MongoDB Cloud Database connected successfully! 🎉');
    } catch (err) {
        console.error('Database connection error ❌:', err);
        throw err;
    }
};

// Middleware to ensure database connection is established before processing any API requests
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Database handshake connection failure' });
    }
});

// --- API ROUTES ---

// Route 1: Base Test Route
app.get('/', (req, res) => {
    res.send('SwiftLink Backend Server is running successfully!');
});

// Route 2: User Registration (Signup)
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please fill in all fields' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Secure password handling: Encrypt/Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully! Please log in.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error during registration' });
    }
});

// Route 3: User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please enter all fields' });
        }

        // Verify user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Return user data (In a full scale app, you'd send a token here)
        return res.json({
            message: 'Login successful! Welcome back.',
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error during login' });
    }
});

// Route 4: Create a short URL (Updated to track logged-in users)
app.post('/api/shorten', async (req, res) => {
    try {
        const { originalUrl, userId } = req.body; 

        // 1. Validation check: Ensure a URL is actually provided
        if (!originalUrl) {
            return res.status(400).json({ error: 'Please provide a valid URL' });
        }

        // 2. STRICT SECURITY CHECK: Block request if no userId is attached
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. You must be logged in to shorten URLs.' });
        }

        // 3. Double-check if this user has already shortened this exact link before
        let alreadyExists = await Url.findOne({ originalUrl, user: userId });
        if (alreadyExists) {
            return res.json(alreadyExists);
        }

        // 4. Generate the short code and save it linked to the user account
        const shortCode = nanoid(6);
        const newUrl = new Url({
            originalUrl,
            shortCode,
            user: userId // Securely binds the URL to the user's ID
        });

        await newUrl.save();
        return res.status(201).json(newUrl);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error encountered' });
    }
});

// Route 5: Get All URLs belonging to a specific user (For Dashboard)
app.get('/api/urls/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userUrls = await Url.find({ user: userId });
        return res.json(userUrls);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error fetching user history' });
    }
});

// Route 6: Redirecting short code to original URL
app.get('/:code', async (req, res) => {
    try {
        const { code } = req.params; 
        const urlEntry = await Url.findOne({ shortCode: code });

        if (urlEntry) {
            urlEntry.clicks++;
            await urlEntry.save(); 
            return res.redirect(urlEntry.originalUrl);
        } else {
            return res.status(404).json({ error: 'URL Short Code not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error encountered during redirection' });
    }
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is happily running on port: ${PORT}`);
});

module.exports = app; // Export for Vercel Serverless hosting