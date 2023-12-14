const bluebird = require('bluebird'); // eslint-disable-line no-global-assign
const axios = require('axios');
const {fxceCfg, fxcePriceURL, contractPriceFeedParams} = require('../config/vars')
const redis = require("redis");
bluebird.promisifyAll(redis);
//contract info
const contractAbi = require("../abi/contractAbi.json");
const {adminProvider} = require('../utils/provider')

const Web3 = require('web3')
const web3 = new Web3(adminProvider)
let contract = new web3.eth.Contract(contractAbi, fxceCfg.fxcePriceFeedAddress);

exports.getNonce = async (address) => {
    let config = {
    method  : 'post',
    url     : fxceCfg.providerUrl,
    headers : { 'Content-Type': 'application/json' },
    data    : JSON.stringify({
        "jsonrpc" : "2.0",
        "method"  : "eth_getTransactionCount",
        "params"  : [ address, "latest" ],
        "id"      : 1
    })
    };

    let response = await axios(config);
    if (!response.data || !response.data.result) throw new Error(`Failed to get address ${address} nonce.`);
    return parseInt(response.data.result, 16);
}

exports.setPriceFeed = async (symbol) =>{
    let nonce = await this.getNonce(fxceCfg.fxceAdminAddress);
    let pricePair;
    // pricePair = 1
    try {
        let priceResp = await axios.get(
            fxcePriceURL+symbol,
            {headers:{
                "X-API-VERSION": "v1",
                "X-API-TOKEN": 'c95fee921a4743aa9bdef26e730b4857'
            }}
        );
        console.log("Real price: ", priceResp.data.data.price, " -symbol: ", symbol)
        pricePair =  (priceResp.data.data.price) * Math.pow(10, 5);

    } catch (err) {
        console.log("Get MT5 price Error: ", err.message)
    }

    //set price feed
    try {
        // console.log("Contract param: ", contractPriceFeedParams)
        // pricePair = Math.round(pricePair)
        let priceFeedResp = await contract.methods.setPrice(symbol, 12, 0).send(Object.assign(contractPriceFeedParams))
        return priceFeedResp
    } catch (err) {
        return err.message
    }
}

exports.getLatestPrice = async(req) =>{
    try {
        let price = await contract.methods.getLatestPrice(req).call();
        return price
    } catch (err) {
        return err.message
    }
}