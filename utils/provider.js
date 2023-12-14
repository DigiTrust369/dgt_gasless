const HDWalletProvider = require("@truffle/hdwallet-provider");
const {fxceCfg} = require('../config/vars');
exports.contractProvider = require('web3-eth-contract');

exports.provider = new HDWalletProvider({ 
    privateKeys: [fxceCfg.contractOwnerPriv], 
    providerOrUrl: fxceCfg.providerUrl,
    pollingInterval: 8000
});

exports.adminProvider = new HDWalletProvider({
    privateKeys: [fxceCfg.fxceAdminPriv],
    providerOrUrl: fxceCfg.providerUrl,
    pollingInterval: 8000,
    networkCheckTimeout: 1000000,
    timeoutBlocks: 200
})

this.contractProvider.setProvider(this.provider)
