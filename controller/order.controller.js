const {
    createOrder,
    setPriceOrder,
    confirmResult,
    claimProfit,
    payToPool,
    getOrderByAddress,
    getOrderBalance
} = require('../service/order.service')
const { logger } = require('../config/logger');

exports.createOrder = async(req, res, next) =>{
    try {
        let request = {
            assetAddress: req.body.assetAddress,
            symbol: req.body.symbol,
            startPrice: req.body.startPrice,
            endPrice: req.body.endPrice,
            openAt: req.body.openAt, //int 
            closeAt: req.body.closeAt, //int
            amount: req.body.amount, //int 
            duration: req.body.duration, 
            owner: req.body.owner
        }
        let resp = await createOrder(request)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Create order error: ", err.message)
        next(err)
    }
}

exports.setPriceOrder = async(req, res, next) =>{
    try {
        let request = {
            price: req.body.price,
            symbol: req.body.symbol,
            orderContractAddress: req.body.orderContractAddress
        }
        let resp = await setPriceOrder(request)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Set price order error: ", err.message)
        next(err)
    }
}

exports.confirmResult = async(req, res, next) =>{
    try {
        let request = {
            orderContractAddress: req.body.orderContractAddress,
            symbol: req.body.symbol,
            price: req.body.price
        }
        let resp = await confirmResult(request)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Confirm result error: ", err.message)
        next(err)
    }
}

exports.claimProfit = async(req, res, next) =>{
    try {
        let request = {
            orderAdr: req.body.orderAdr,
            receiver: req.body.receiver,
        }
        let resp = await claimProfit(request)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Claim profit error: ", err.message)
        next(err)
    }
}

exports.payToPool = async(req, res, next) =>{
    try {
        let request = {
            orderContractAddress: req.body.orderContractAddress,
            amount: req.body.amount
        }
        let resp = await payToPool(request)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Pay to pool error: ", err.message)
        next(err)
    }
}

exports.getOrderByAddress = async(req, res, next) =>{
    try {
        let request = {
            orderAdr: req.query.orderAdr,
        }
        let resp = await getOrderByAddress(request)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Get asset by address error: ", err.message)
        next(err)
    }
}

exports.getOrderBalance = async(req, res, next) =>{
    try {
        let request = {
            orderAdr: req.query.orderAdr,
        }
        let resp = await getOrderBalance(request)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Get asset by address error: ", err.message)
        next(err)
    }
}