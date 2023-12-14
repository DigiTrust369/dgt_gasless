const Contract = require('web3-eth-contract');
const bluebird = require('bluebird'); // eslint-disable-line no-global-assign
const redis = require("redis");
const Web3 = require('web3')
const {redisUrl, fxceCfg, contractParams} = require("../config/vars");
let redisClient = redis.createClient(redisUrl);
bluebird.promisifyAll(redis);

//contract config 
const {getNonce, getLatestPrice} = require('./priceFeed_service')
const {setAdminToken} = require('./token.service')
const orderAbi = require("../abi/orderAbi.json");
const orderByteCode = require('../abi/orderByteCode.json');
const {provider, contractProvider} = require('../utils/provider')

const web3 = new Web3(fxceCfg.providerUrl)

Contract.setProvider(provider)

const depositOrder = async(req) =>{
    let contract = new contractProvider(orderAbi, req.orderContractAddress)
    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    try {
        let receipt = await contract.methods.depositOrder(req.owner).send(Object.assign(contractParams, {nonce: nonce}));
        return receipt
    } catch (err) {
        return err.message
    }
}

exports.createOrder = async (req) =>{
    // let contract = new Contract(orderAbi, orderContractAddress);
    //set key - orderaddress 
    let deployContract = new web3.eth.Contract(orderAbi)
    let payload = {
        data: orderByteCode.object,
        arguments: [
            fxceCfg.fxceTokenAddress,
            fxceCfg.contractOwnerAddr, //fee wallet address
            [req.assetAddress ,req.symbol, req.startPrice, req.endPrice, 0, 0,req.amount, req.duration], //order info
            fxceCfg.contractOwnerAddr, //price feed
        ]
    }
    let deployTx =deployContract.deploy(payload)
    const createTransaction = await web3.eth.accounts.signTransaction(
        {
            from: fxceCfg.contractOwnerAddr,
            data: deployTx.encodeABI(),
            gasPrice: 25000000000,
            gasLimit: 8500000,
        },
        fxceCfg.contractOwnerPriv
    );
    const createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
    );
    console.log('Contract deployed at address', createReceipt.contractAddress);
    // return createReceipt.contractAddress
    let orderInfo = {
        orderId: createReceipt.contractAddress,
        symbol: req.symbol,
        createdAt: Date.now(),
        status: 0
    }
    if(orderInfo.orderId == ''){
        return 'Error missing orderId'
    }
    let request = {
        orderContractAddress: createReceipt.contractAddress,
        owner: req.owner,
        admin: createReceipt.contractAddress,
    }

    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    let respSetAdmin = await setAdminToken(request)
    console.log("Resp set admin token: ", respSetAdmin.transactionHash, " -s: ", respSetAdmin.status)

    let receipt = await redisClient.zadd(req.assetAddress, nonce, JSON.stringify(orderInfo));
    return receipt
}

exports.setPriceOrder = async (req) => {
    let orderContract = new Contract(orderAbi, req.orderContractAddress);
    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    try {
        let receipt = await orderContract.methods.setPriceOrder(req.price, req.symbol).send(Object.assign(contractParams, {nonce: nonce}));
        return receipt
    } catch (err) {
        return err.message
    }
}

exports.scanPendingOrder = async (req) =>{
    let listOrder = await redisClient.zrangeAsync(req, 0, -1);
    return listOrder
}

exports.addWhiteListAddress = async(req) =>{
    let orderContract = new contractProvider(orderAbi, req.orderContractAddress)
    let nonce = await getNonce(req.adminAddress)
    try {
        let receipt = await orderContract.methods.addWhiteListAddress(req.adminAddress).send(Object.assign(contractParams, {nonce: nonce}))
        return receipt
    } catch (err) {
        return err.message
    }
}

exports.claimProfit = async(req) =>{
    let orderContract = new contractProvider(orderAbi, req.orderAdr)
    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    try {
        let receipt = await orderContract.methods.withDraw(req.receiver).send(Object.assign(contractParams, {nonce: nonce}))
        return receipt
    } catch (err) {
        return err.message
    }
}

exports.payToPool = async(req) =>{
    let orderContract = new contractProvider(orderAbi, req.orderContractAddress)
    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    try {
        let receipt = await orderContract.methods.payToPool(req.amount).send(Object.assign(contractParams, {nonce: nonce}))
        return receipt
    } catch (err) {
        return err.message
    }
}

exports.confirmResult = async(req) =>{
    let orderContract = new contractProvider(orderAbi, req.orderContractAddress)
    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    let price = await getLatestPrice(req.symbol)
    // //get order info 
    // let orderInfo
    // try {
    //     orderInfo = await orderContract.methods.getOrderInfo(req.orderContractAddress).call();
    // } catch (err) {
    //     return err.message
    // }

    // console.log("Duration: ", Date.now() - orderInfo.openAt, " -n: ", Date.now(), " -open: ", orderInfo.openAt)

    try {
        let receipt = await orderContract.methods.confirmResult(req.price, parseInt(Date.now()/1000)).send(Object.assign(contractParams, {nonce: nonce}))
        console.log("Confirm txHash: ", receipt.transactionHash)
        return receipt
    } catch (err) {
        return err.message
    }
}

exports.getOrderByAddress = async(req) =>{
    let contract = new Contract(orderAbi, req.orderAdr)
    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    try {
        let receipt = await contract.methods.getOrderInfo(req.orderAdr).call()
        console.log("Asset info: ", receipt)
        return receipt
    } catch (err) {
        console.log("Error get asset: ", err.message)
        return err.message
    }
}

exports.getOrderBalance = async(req) =>{
    let contract = new Contract(orderAbi, req.orderAdr)
    let nonce = await getNonce(fxceCfg.contractOwnerAddr)
    try {
        let resp = await contract.methods.getBalance().call()
        return resp
    } catch (err) {
        console.log("Error get asset: ", err.message)
        return err.message
    }
}