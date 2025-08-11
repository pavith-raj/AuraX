const express = require('express');
const cors = require('cors'); // Allow mobile app to connect
const dotenv = require('dotenv'); // To store secrets safely
const morgan = require('morgan'); // Import morgan

dotenv.config();

const connectDB = require('./config/db'); // ✅ Import connectDB function
const authRoutes = require('./routes/auth'); 
const salonsRoutes = require('./routes/salons');
const appointmentRoutes = require('./routes/appointments');
const skinAnalysisRoutes = require('./skinAnalysis');
const queueRoutes = require('./routes/queue');
const productsRoutes = require('./routes/products');
const faceAnalysisRoutes = require('./routes/faceAnalysis');

const uploadRoutes = require('./routes/upload');



const app = express();

// A more robust CORS setup
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Add morgan logger
app.use(morgan('dev'));

app.use(express.json()); // To parse JSON body

// Then Routes
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonsRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/skin', skinAnalysisRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/face-analysis', faceAnalysisRoutes);

app.use('/api/upload', uploadRoutes);

// Serve static files from the uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
connectDB(); // ✅ Call the connectDB function

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
