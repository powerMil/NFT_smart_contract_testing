require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    /*hardhat:{
      forking: {
        url: process.env.MAINNET_RPC_URL,
        blocknumber: 17001797
      }
    },*/
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.MAIN_ACCOUNT]
    }
  },
  solidity: "0.8.18",
};
