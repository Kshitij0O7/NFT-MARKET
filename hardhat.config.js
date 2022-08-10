require("@nomiclabs/hardhat-waffle");
module.exports = {
  // defaultNetwork: 'matic',
  // networks: {
  //   hardhat: {
  //   },
  //   matic: {
  //     url: "https://polygon-mumbai.g.alchemy.com/v2/u6BkPZO36a94O_-G3MH3-72ontYgrkQk",
  //     accounts: ["2407d2a5851f4166d9a909deb312c288691eb7afbba62004f09920662fbcebcc"]
  //   }
  // },
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  }
};