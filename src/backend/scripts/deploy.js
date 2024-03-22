async function main() {

  // const [deployer] = await ethers.getSigners();
  const deployer = "0x522Eca2Ba84f98355684aA3335A81cf9126adBE8";

  console.log("Deploying contracts with the account:", deployer);
  // console.log("Account balance:", (await deployer.getBalance()).toString());

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  const MarketPlace = await ethers.getContractFactory("MarketPlace");
  const marketPlace = await MarketPlace.deploy(1);

  console.log("NFT Contract Address is:", nft.address);
  console.log("MarketPlace Contract Address is:", marketPlace.address);

  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(nft, "NFT");
  saveFrontendFiles(marketPlace, "MarketPlace");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
