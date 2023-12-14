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
      fxceTokenAddress: process.env.FXCE_TOKEN_ADDRESS || '0xee42Cf6E3E575b5aBC2B3Ae760BA1AF2c05791df',
      fxceWalletAddress: process.env.FXCE_WALLET_ADDRESS || '0x0D0Df554db5623Ba9A905D0bE4C6bAc48144841E',
      fxcePriceFeedAddress: process.env.FXCE_PRICE_FEED_ADDRESS || '0xeCb4F77EB12224435D49c8d67446E821fDe7cD7f',
      fxceAdminAddress: process.env.FXCE_ADMIN_ADDRESS || '0xF7FCCFc3DE0789362B5B998782992a27b12040c8',
      fxceAdminPriv: process.env.FXCE_ADMIN_PRIV || '6ee44874d355c054c138a417c5a725cccf7353460892125e028e60ebc8c77129',
      fxceChallengeAddress: process.env.FXCE_CHALLENGE_ADDRESS || '0x24F3F152Bfb4C6C14e7c09053eDef984C2Fc5709',
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
