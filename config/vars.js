const path = require('path');
const env = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config();
console.log("Provider url: ",process.env.FXCE_API_URL)


module.exports = Object.freeze({
  env                 : process.env.NODE_ENV || 'production',
  port                : process.env.PORT || 3001,
  logs                : process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  logLevels           : {
    file              : process.env.FILE_LOG_LEVEL || 'info',
    console           : process.env.CONSOLE_LOG_LEVEL || 'debug',
    sentry            : process.env.SENTRY_LOG_LEVEL || 'error'
  },
  redisUrl            : process.env.REDIS_URL || "redis://127.0.0.1:6379",
  redisTopics         : {
    priceRequest : process.env.REDIS_PRICE_REQUEST || 'binaryoption-price-request',
    priceResult  : process.env.REDIS_PRICE_RESULT  || 'pblock-price-response'
  },
  sentryDsn           : process.env.SENTRY_DSN,
  fxceCfg:{
      name: 'fxce',
      network: process.env.FXCE_NETWORK || 'testnet',
      contractOwnerPriv: process.env.FXCE_CONTRACT_OWNER_PRIV || 'eedddc0cdc167430de9383d213a9b53c67aefd61bf3c277e3dbe01ee206f9230',
      contractOwnerAddr: process.env.FXCE_CONTRACT_OWNER_ADDR || '0x0D0Df554db5623Ba9A905D0bE4C6bAc48144841E',
      providerUrl: process.env.FXCE_API_URL || 'https://replicator-01.pegasus.lightlink.io/rpc/v1',
      fxceTokenAddress: process.env.FXCE_TOKEN_ADDRESS || '0xeC8ba8C87Ff5D3e8BdBDb63E572a8669C1e16068',
      fxceWalletAddress: process.env.FXCE_WALLET_ADDRESS || '0x0D0Df554db5623Ba9A905D0bE4C6bAc48144841E',
      fxcePriceFeedAddress: process.env.FXCE_PRICE_FEED_ADDRESS || '0xa809e42a7E0930e1C0499C170505c3B2484D1483',
      fxceAdminAddress: process.env.FXCE_ADMIN_ADDRESS || '0xF7FCCFc3DE0789362B5B998782992a27b12040c8',
      fxceAdminPriv: process.env.FXCE_ADMIN_PRIV || '6ee44874d355c054c138a417c5a725cccf7353460892125e028e60ebc8c77129',
      fxceChallengeAddress: process.env.FXCE_CHALLENGE_ADDRESS || '0xbD49c68105d0Eda51466E7eCD543082e654B8b4e',
      gasPrice: process.env.FXCE_GAS_PRICE
  },
  fxcePriceURL: process.env.FXCE_PRICE_URL || "https://fxce-dbank-monitor-api.fxce-dbank-monitor-dev.vncdevs.com/hook/mt5_pricings/price?symbol=",
  contractParams:{
    from    : process.env.FXCE_CONTRACT_OWNER_ADDR || '0x0D0Df554db5623Ba9A905D0bE4C6bAc48144841E',
    gasPrice: 25000000000,
    gasLimit: 8500000,
  },
  contractPriceFeedParams:{
    from: process.env.FXCE_ADMIN_ADDRESS || '0xF7FCCFc3DE0789362B5B998782992a27b12040c8',
    gasPrice: 25000000000,
    gasLimit: 8500000,
  }
});
