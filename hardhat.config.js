require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
module.exports = {
  // defaultNetwork: 'matic',
  networks: {
    hardhat: {
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/qsmBqL-17wbolk3wYM-Lw4QkMhZzinqb`,
      accounts: ['1efa61372264b615f88b5c77935a43b074a66dd68a43ccb5c3eaf917918e6d44']
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