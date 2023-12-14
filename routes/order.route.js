const express = require('express');
const priceFeedController = require("../controller/priceFeed.controller")
const orderController = require("../controller/order.controller")

const orderRouter = express.Router();

orderRouter.route('/getPrice').get(priceFeedController.setPrice);
orderRouter.route('/').get(orderController.getOrderByAddress);
orderRouter.route('/balance').get(orderController.getOrderBalance);

orderRouter.route('/createOrder').post(orderController.createOrder);
orderRouter.route('/setPriceOrder').post(orderController.setPriceOrder);
orderRouter.route('/confirmResult').post(orderController.confirmResult);
orderRouter.route('/claimProfit').post(orderController.claimProfit);
orderRouter.route('/payToPool').post(orderController.payToPool)

module.exports = orderRouter;
