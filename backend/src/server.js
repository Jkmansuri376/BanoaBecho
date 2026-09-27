const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const { initDb } = require('./db');
const { initSocket } = require('./socket');

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const offersRoutes = require('./routes/offers');
const ordersRoutes = require('./routes/orders');
const ratingsRoutes = require('./routes/ratings');
const usersRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
// Security headers & CORS
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: (origin, callback) => {
    // Reflects incoming origin for seamless browser CORS & credentials support
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Initialize Socket handler
initSocket(io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'BanaoBecho API',
    tagline: 'Banao, Becho, Seedha',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initDb();
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 BanaoBecho Backend running on http://localhost:${PORT}`);
    console.log(`🌾 Tagline: "Banao, Becho, Seedha"`);
    console.log(`⚡ Socket.io Real-time Negotiation engine active`);
    console.log(`======================================================\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start BanaoBecho server:', err);
});
