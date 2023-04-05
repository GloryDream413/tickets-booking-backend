
import axios from 'axios';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({path:path.resolve(__dirname, '../.env')});
import { getMarketData, insertMarketData, updateMarketData } from '../models/market_data.js';

const COINMARKETCAP_BTC_ID = 1;
const COINMARKETCAP_CAP_ETH = 1027;
const COINMARKETCAP_CAP_SOL = 5426;
const COINMARKETCAP_CAP_BNB = 1839;
const COINMARKETCAP_CAP_ADA = 2010;
const COINMARKECAP_CAP_MATIC = 3890;

const COIN_ARRAYS = [
  // COINMARKETCAP_BTC_ID,
  COINMARKETCAP_CAP_ETH,
  // COINMARKETCAP_CAP_SOL,
  // COINMARKETCAP_CAP_BNB,
  // COINMARKETCAP_CAP_ADA,
  COINMARKECAP_CAP_MATIC
];

const updateMarketDataJob = () => {
  let response = null;
  COIN_ARRAYS.forEach(async capID => {
    try {
      response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=' + capID, {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        },
      });
    } catch (ex) {
      response = null;
      console.log(ex);
    }
    if (response) {
      const json = response.data.data;
      const data = json[capID.toString()];
      console.log('Updated ' + data.symbol + " data");
      updateMarketData(capID, data);
      // var market_data = await getMarketData(data.id);
      // if (market_data != undefined) {
      //   updateMarketData(capID, data);  
        
      // } else {
      //   insertMarketData(data);
      // }
    }
  })
}

export default updateMarketDataJob;
