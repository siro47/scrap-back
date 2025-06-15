import axios from 'axios';
import {
  TOKEN,
  GAMES_URL,
  getExpansionsUrl,
  BLUEPRINT_URL,
  MKT_PRODUCT,
} from './constants.js';

class CardTraderAPI {
  constructor() {
    this.config = { headers: { Authorization: `Bearer ${TOKEN}` } };
  }

  async getGames() {
    const response = await axios.get(GAMES_URL, this.config);
    return response.data.array;
  }

  async getExpansions(game) {
    const response = await axios.get(getExpansionsUrl(game), this.config);
    const data = response.data.filter(
      (exp) => exp.game_id.toString() === game
    );
    return data;
  }

  async getBlueprints(expId) {
    const config = { ...this.config, params: { expansion_id: expId } };
    const response = await axios.get(BLUEPRINT_URL, config);
    return response.data;
  }

  async getProducts(bpId) {
    const config = { ...this.config, params: { blueprint_id: bpId } };
    const response = await axios.get(MKT_PRODUCT, config);
    return response.data;
  }

  getProdPrice(prods, langs, prefix) {
    const filteredProds = prods
      .filter(p => p.properties_hash.condition === 'Near Mint')
      .filter(p => langs.includes(p.properties_hash[`${prefix}_language`]))
      .filter(p => p?.user?.can_sell_via_hub);
    if (!filteredProds.length) return null;
    const prizes = filteredProds.map(p => p.price_cents / 100);
    const bestProd = filteredProds[0];
    const bestPrize = prizes[0];
    if (bestPrize < 0.15) return null;
    const available = bestProd?.quantity;
    const firstToSecondPercentage = prizes[1] / bestPrize;
    const firstToSecondDiff = prizes[1] - bestPrize;
    const isDeal =
      available < 4 &&
      firstToSecondPercentage > 1.3 &&
      firstToSecondDiff > 0.15;
    // Get stock max prize
    let stockAcc = 0;
    let stockAvPrize = 0;
    for (const prod of filteredProds) {
      stockAcc += prod.quantity;
      if (stockAcc >= 4) {
        stockAvPrize = prod.price_cents / 100;
        break;
      }
    }
    return {
      bestPrize,
      isDeal,
    };
  }
}

export default CardTraderAPI;
