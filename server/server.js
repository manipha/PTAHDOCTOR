import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import mongoose from 'mongoose';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Routers
import PatientRouter from './routes/PatientRouter.js';
import authRouter from './routes/authRouter.js';
import userRouter from './routes/userRouter.js';
import PostureRouter from './routes/PostureRouter.js';
import DoctorRouter from './routes/DoctorRouter.js';
import PostRouter from './routes/PostRouter.js';
import QuestionsRouter from './routes/QuestionsRouter.js';
import AnswersRouter from './routes/AnswersRouter.js';
import EvaluatesRouter from './routes/EvaluatesRouter.js';
import FeedbacksRouter from './routes/FeedbacksRouter.js';
import MianRouter from './routes/MianRouter.js';

// Middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import { authenticateUser } from './middleware/authMiddleware.js';

// Cloudinary Config
import cloudinary from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Initialize Express and HTTP Server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins, change in production
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(path.resolve(__dirname, './public')));

// API Routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'test route' });
});

app.use('/api/v1/allusers', authenticateUser, PatientRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', authenticateUser, userRouter);
app.use('/api/v1/postures', authenticateUser, PostureRouter);
app.use('/api/v1/doctors', authenticateUser, DoctorRouter);
app.use('/api/v1/posts', PostRouter);
app.use('/api/v1/questions', QuestionsRouter);
app.use('/api/v1/evaluates', EvaluatesRouter);
app.use('/api/v1/feedbacks', FeedbacksRouter);
app.use('/api/v1/answers', AnswersRouter);
app.use('/api/v1/main', MianRouter);

// Handle 404 Routes
app.use('*', (req, res) => {
  res.status(404).json({ msg: 'Not Found' });
});

// Error Handler Middleware
app.use(errorHandlerMiddleware);

// Handle Socket.IO Events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for comment events
  socket.on('comment', (comments) => {
    console.log('Received comments:', comments);
    io.emit('new-comment', comments); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and Start Server
const port = process.env.PORT || 5100;

const connectDBAndStartServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    server.listen(port, () => {
      console.log(`Server running on PORT ${port}...`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

connectDBAndStartServer();
