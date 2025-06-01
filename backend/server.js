const express = require('express');
const cors = require('cors'); // Allow mobile app to connect
const dotenv = require('dotenv'); // To store secrets safely
const connectDB = require('./config/db'); // ✅ Import connectDB function
const authRoutes = require('./routes/auth'); 

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB(); // ✅ Call the connectDB function

app.use(cors());
app.use(express.json()); // to parse JSON body

// Routes
app.use('/api/auth', authRoutes);

const salonsRoutes = require('./routes/salons');
app.use('/api/salons', salonsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
