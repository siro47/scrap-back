

import express, { json } from 'express';
import CardTraderAPI from './services/cardTrader.js';

const app = express();
const port = process.env.PORT || 3001;

const ctApi = new CardTraderAPI();

app.get("/", (req, res) => res.json({hello: 'world'}));

app.get("/ct/games", async (req, res) => {
  const games = await ctApi.getGames();
  return res.json(games)
})

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
