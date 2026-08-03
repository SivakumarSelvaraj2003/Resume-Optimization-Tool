import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST']
}));
app.use(express.json());

app.use('/api/resume', resumeRoutes);

app.get('/', (req, res) => {
  res.send('ATS Resume Pro API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});