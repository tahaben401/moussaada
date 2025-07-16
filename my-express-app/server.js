import 'dotenv/config';
import express from 'express';
import cors from 'cors'; 
import morgan from 'morgan';
import authRoute from './routes/authRoute.js';
import ticketRoute from './routes/ticketRoute.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
const app = express();
const PORT = process.env.PORT || 3000 ;
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true, // Allow cookies
};
// Middleware
app.use(express.json()); 
app.use(cors(corsOptions)); 
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_KEY, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, 
    sameSite: 'none'
  },
}));
// Routes
app.use('/auth', authRoute);
app.use('/tickets', ticketRoute);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app; 