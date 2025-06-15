import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());

const PARAMS = `?sellerCountry=10&language=1`;
const PARAMS2 = `&sellerType=1,2`;
const IS_FOIL = `&isFoil=Y`;

const GAME_URL = {
  lorcana: 'Lorcana',
  starwars: 'StarWarsUnlimited',
  dragonball: 'DragonBallSuper',
  mtg: 'Magic',
  pokemon: 'Pokemon',
};

class CardMarketAPI {
  async checkMkmPrizes(params) {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    let result = null;
    try {
      result = await this._scrapUrl(params, page);
      if (!result?.sellMean) {
        console.error(`Not found, retry cause 429`);
        await new Promise(r => setTimeout(r, 60000));
        await page.close();
        page = await browser.newPage();
        result = await this._scrapUrl(params, page);
      }
    } catch (error) {
      if (
        !['Protocol error: Connection closed.', 'Wrong URL'].includes(
          error?.message
        )
      ) {
        await new Promise(r => setTimeout(r, 60000));
      }
      await page.close();
      page = await browser.newPage();
      try {
        result = await this._scrapUrl(params, page);
      } catch (error) {
        await page.close();
        await browser.close();
        return result;
      }
    }
    await page.close();
    await browser.close();
    return result;
  }

  _scrapUrl = async (params, page) => {
    const url =
      params.version === 2
        ? this._getCardUrl({ ...params, useVersion: true, version: 2 })
        : this._getCardUrl(params);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    let articleRows = await page.$$('.article-row');
    if (!articleRows.length) {
      const url = this._getCardUrl({ ...params, useVersion: true });
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      articleRows = await page.$$('.article-row');
    }
    if (!articleRows.length) {
      console.error(`articleRows not found! ${url}`);
      const container = await page.$$('#AlertContainer');
      if (container.length > 0) {
        throw { message: 'Wrong URL' };
      }
      throw { message: `Too many requests` };
    }
    const avgInfo = await page.$$('.info-list-container dl dd');
    const result = await this._scrapPriceFromRows(articleRows, avgInfo);
    return result;
  };

  _scrapPriceFromRows = async (articleRows, avgInfo) => {
    let best1 = null;
    let best2 = null;
    let best3 = null;
    let stock = 0;
    let sellPrize = null;
    let dailyAvg = avgInfo.pop();
    dailyAvg = await dailyAvg.$eval('span', e =>
      parseFloat(e.innerHTML.split(' ')[0].replace(',', '.'))
    );
    let weeklyAvg = avgInfo.pop();
    weeklyAvg = await weeklyAvg.$eval('span', e =>
      parseFloat(e.innerHTML.split(' ')[0].replace(',', '.'))
    );
    let monthlyAvg = avgInfo.pop();
    monthlyAvg = await monthlyAvg.$eval('span', e =>
      parseFloat(e.innerHTML.split(' ')[0].replace(',', '.'))
    );
    let sellMean = parseFloat(
      ((dailyAvg + weeklyAvg + monthlyAvg) / 3).toFixed(2)
    );

    for (const row of articleRows) {
      const seller = await row.$eval('.me-1 a', e => e.innerHTML.split(' ')[0]);
      const amount = await row.$eval(
        '.amount-container span',
        e => e.innerHTML.split(' ')[0]
      );
      const price = await row.$eval('.price-container span', e =>
        parseFloat(e.innerHTML.split(' ')[0].replace(',', '.'))
      );
      if (seller === 'SimonVtcg') {
        stock += parseInt(amount);
        if (!sellPrize) sellPrize = price;
      }
      const powerseller = await row.$$eval(
        '.fonticon-users-powerseller',
        els => els
      );
      const profesional = await row.$$eval(
        '.fonticon-users-professional',
        els => els
      );
      if (!powerseller.length && !profesional.length && price < 0.25) continue;
      if (best2 && best3 && stock > 3) break;
      if (best2 && best3) continue;
      const condition = await row.$eval(
        '.article-condition span',
        e => e.innerHTML.split(' ')[0]
      );
      if (condition != 'NM') continue;

      if (amount < 3 && best2) continue;
      if (amount < 2 && best1) continue;

      const option = { amount, price };
      if (!best1) best1 = option;
      if (amount >= 2 && !best2) best2 = option;
      if (amount >= 3 && !best3) best3 = option;
    }

    let profMean = Infinity;
    if (best1?.price > 10) {
      profMean = best1?.price;
    } else if (best3) {
      profMean = (best2?.price + best3.price) / 2;
    } else {
      profMean = best2 ? best2.price : best1 ? best1.price : Infinity;
    }
    if (!profMean) console.error(`mean not found! ${URL}`);

    return { sellMean, profMean, stock, sellPrize, err: null };
  };

  _getBaseUrl = game =>
    `https://www.cardmarket.com/en/${GAME_URL[game]}/Products/Singles`;

  _getExpansionUrl = (game, expansion) =>
    `${this._getBaseUrl(game)}/${expansion}`;

  _getCardUrl = ({
    game,
    expansion,
    card,
    profVendor = false,
    onlyFoil = false,
    useVersion = false,
    version = 1,
  }) =>
    `${this._getExpansionUrl(game, expansion)}/${card}${
      useVersion ? `-V${version}` : ''
    }${PARAMS}${profVendor ? PARAMS2 : ''}${onlyFoil ? IS_FOIL : ''}`;
}

export default CardMarketAPI;
