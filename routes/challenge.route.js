const express = require('express');
const challengeController = require('../controller/challenge.controller')

const challengeRouter = express.Router();

challengeRouter.route('/createAsset').post(challengeController.createChallenge)
challengeRouter.route('/createAssetConfig').post(challengeController.createChallengeConfig)
challengeRouter.route('/withdraw').post(challengeController.withDrawAsset)
// challengeRouter.route('/').get(challengeController.getChallengeById)
challengeRouter.route('/').get(challengeController.getAssetByAddress)
challengeRouter.route('/assets').get(challengeController.getListAsset)

module.exports = challengeRouter;
