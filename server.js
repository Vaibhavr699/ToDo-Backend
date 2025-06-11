import dotenv from 'dotenv';
dotenv.config();
console.log('Loaded MONGO_URI from .env:', process.env.MONGO_URI);

import app from './app.js';
import http from 'http';
import { scheduleDueDateNotifications } from './utils/scheduler.js';

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  // Schedule notifications
  scheduleDueDateNotifications();
});

export default server;