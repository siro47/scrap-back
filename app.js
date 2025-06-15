import express, { json } from 'express';
import cors from 'cors';
import CardTraderAPI from './services/cardTrader.js';
import CardMarket from './services/cardMarket.js';

import { LORCANA_RARITIES, LOR_RARITIES_ORDER } from './services/constants.js';
const PREFIX = 'lorcana';
const LANGUAGES = ['en'];

const app = express();
const port = process.env.PORT || 3001;

app.use(cors()); // Enable CORS for all routes

const ctApi = new CardTraderAPI();
const mkmApi = new CardMarket();

app.get('/', (req, res) => res.json({ hello: 'world' }));

app.get('/api/ct/games', async (req, res) => {
  const games = await ctApi.getGames();
  return res.json(games);
});

app.get('/api/ct/expansions', async (req, res) => {
  const game = req.query.game;
  if (!game) return res.json({});

  const expansions = await ctApi.getExpansions(game);
  return res.json(expansions);
});

app.get('/api/scrap', async (req, res) => {
  const query = req.query;
  const game = query.game;
  if (!game) return Response.json({});
  const expansion = query.expansion;
  if (!expansion) return Response.json({});
  const prevCard = query.prevCard;
  const reqFilteredRarities = query.rarities;
  let filteredRarities = [];
  if (reqFilteredRarities) {
    filteredRarities = JSON.parse(reqFilteredRarities);
  }
  const data = await scrapExpansion(
    game,
    expansion,
    prevCard,
    filteredRarities
  );
  return res.json(data);
});

async function scrapExpansion(gameId, expId, prevCard, filteredRarities) {
  const start = process.hrtime();

  const expansions = await ctApi.getExpansions(gameId);
  const expansion = expansions.find(exp => exp.id.toString() === expId);

  const escapedExpansionName = _getParsedName(expansion.name);
  const allBlueprints = await ctApi.getBlueprints(expId);
  let rarity = LOR_RARITIES_ORDER.filter(
    r => !filteredRarities || filteredRarities.includes(r)
  )[0];
  if (prevCard) {
    const prevBp = allBlueprints.find(bp => bp.id.toString() === prevCard);
    rarity = prevBp.fixed_properties[`${PREFIX}_rarity`];
  }
  let blueprints = allBlueprints.filter(
    bp => bp.fixed_properties[`${PREFIX}_rarity`] === rarity
  );
  if (prevCard) {
    const startIndex = blueprints.findIndex(
      bp => bp.id.toString() === prevCard
    );
    if (startIndex < blueprints.length - 1) {
      blueprints = blueprints.splice(startIndex + 1);
    } else {
      const rarityIndex = LOR_RARITIES_ORDER.findIndex(r => r === rarity);
      rarity = LOR_RARITIES_ORDER[rarityIndex + 1];
      if (!rarity) return null;
      blueprints = allBlueprints.filter(
        bp => bp.fixed_properties[`${PREFIX}_rarity`] === rarity
      );
    }
  }

  for (const bp of blueprints) {
    let prods = await ctApi.getProducts(bp.id);
    prods = prods[bp.id];
    const simonv = prods.find(p => p.user.username === 'SimonVtcg');
    const stock = simonv?.quantity ?? 0;
    let sellPrize = null;
    if (simonv) {
      sellPrize = ((simonv?.price_cents - 9) / 100).toFixed(2);
    }
    const ctResult = ctApi.getProdPrice(prods, LANGUAGES, PREFIX);

    const escapedCardName = _getParsedName(bp.name);
    const ctDuration = process.hrtime(start);
    console.log(`CT scrap duration: ${ctDuration}`);
    const step2Start = process.hrtime();

    const mkmResult = await mkmApi.checkMkmPrizes({
      game: PREFIX,
      expansion: escapedExpansionName,
      card: escapedCardName,
      version:
        bp.fixed_properties[`${PREFIX}_rarity`] === LORCANA_RARITIES.ENCHANTED
          ? 2
          : 1,
    });
    const mkmDuration = process.hrtime(step2Start);
    console.log(`Mkm scrap duration: ${mkmDuration}`);

    return {
      info: {
        name: prods[0].name_en,
        id: bp.id,
        expansion: prods[0].expansion.name_en,
        expansionCode: prods[0].expansion.code,
        img: bp.image_url,
      },
      ct: {
        ...ctResult,
        stock,
        sellPrize,
      },
      mkm: {
        ...mkmResult,
      },
    };
  }
}

const _getParsedName = name =>
  name
    .replaceAll(' ', '-')
    .replaceAll('Variants', 'Extras') // SWU
    .replaceAll('Collectors', 'Extras') // Magic
    .replaceAll(/\'|\’|\!|\.|\,|\:|\"|\\|\//g, '')
    .replace('---', '-');

const server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
