

import express, { json } from 'express';
import cors from 'cors';
import CardTraderAPI from './services/cardTrader.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Enable CORS for all routes

const ctApi = new CardTraderAPI();

app.get("/", (req, res) => res.json({hello: 'world'}));

app.get("/api/ct/games", async (req, res) => {
  const games = await ctApi.getGames();
  return res.json(games)
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
