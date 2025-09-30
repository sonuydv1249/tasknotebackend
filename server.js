
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: '*', credentials: true })); 
app.use(express.json());

app.get('/', (req, res) => res.send('Hello worldsss'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server Running on http://localhost:${port}`));
