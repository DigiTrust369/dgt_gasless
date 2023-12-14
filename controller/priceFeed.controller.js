const{
    setPriceFeed, 
    setPendingOrder, 
    confirmResult,
    claimProfit,
    payToPool,
    createChallenge,
    createOrder
} = require('../service/priceFeed_service')
const { logger } = require('../config/logger');

exports.setPrice = async(req, res, next) =>{
    try {
        let resp = await setPriceFeed("GBPUSD")
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.error("Set price error: ", err.message)
        next(err)
    }
}

exports.setPendingOrder = async(req, res, next) =>{
    try {
        let resp = await setPendingOrder(req)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.error("Set pending order error: ", err.message)
        next(err)
    }
}

exports.createChallenge = async(req, res, next) =>{
    try {
        let resp = await createChallenge(req)
        res.json({
            code: 0,
            data: resp
        })
    } catch (err) {
        logger.info("Create challenge erorr: ", err.message)
        next(err)
    }
}