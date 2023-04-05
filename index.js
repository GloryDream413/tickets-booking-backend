import express from 'express';
import pkg from 'body-parser';
import user_router from './routes/users.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql';
import cors from 'cors';
import updateMarketData from './jobs/update-market-data.js';
import cron from 'node-cron';
import payment_router from './routes/payments.js';
import tickets_router from './routes/tickets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { json } = pkg;
const app = express();
const port = 2479;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'alek_db',
    password: '(&zjn$#2Z',
    database: 'tickets'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});

app.use(json());
app.use(cors());

app.use('/api/users', user_router);
app.use('/api/payment', payment_router);
app.use('/api/ticket', tickets_router);

cron.schedule('0 * * * *', () => {
    updateMarketData();
});

app.listen(
    port,
    () => console.log(`app listening at http://localhost:${port}`)
);