const express = require('express');
const mongoose = require('mongoose'); // To connect to MongoDB
const cors = require('cors'); // Allow mobile app to connect
const dotenv = require('dotenv');// To store secrets safely
const authRoutes = require('./routes/auth'); 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // to parse JSON body

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error(err));