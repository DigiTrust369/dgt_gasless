const cronPriceFeed = require('node-cron');
const { setPriceFeed } = require('../service/priceFeed_service')

cronPriceFeed.schedule('*/10 * * * * *', async function() {
    let symbols = ['AUDUSD', 'GBPUSD', 'USDJPY', 'EURUSD', 'XAUUSD', 'USDCAD', 'NZDUSD']
    console.log("running a price feed cron every 10 second"); 
    for(let i = 0; i < symbols.length; i++){
        let resp = await setPriceFeed(symbols[i]);
        if(resp.transactionHash == undefined){
            console.log("Error price feed: ", resp)
        }else{
            console.log("Resp set price feed: ", resp.transactionHash);    
        }
    }
})