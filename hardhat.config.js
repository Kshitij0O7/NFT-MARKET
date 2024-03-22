require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
module.exports = {
  // defaultNetwork: 'matic',
  networks: {
    hardhat: {
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  }
};