import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/database.js';
import apiRoutes from './routes/api.js';
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 8000);
const codespaceName = process.env.CODESPACE_NAME;
const baseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : `http://localhost:${PORT}`;
app.use(cors());
app.use(express.json());
app.get('/', (_req, res) => {
    res.json({
        message: 'OctoFit Tracker API Server',
        apiBaseUrl: `${baseUrl}/api`,
        routes: ['/api/users/', '/api/teams/', '/api/activities/', '/api/leaderboard/', '/api/workouts/'],
    });
});
app.use('/api', apiRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on ${baseUrl}`);
});
