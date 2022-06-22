require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

require('dotenv').config();

//create a task that can deploy to testnet and save the metadata associated with the deployment

extendEnvironment((hre) => {
  // choose three random addresses to create the wallet with
  function chooseThree(upperBound) {
    chosen = new Set();
    for (let i = 0; i < 3; i++) {
        let value = Math.floor(Math.random() * upperBound);
        if (!chosen.has(value)){
            chosen.add(value);
        } else {
            i--;
        }
    }
    return Array.from(chosen);
  } 
  hre.chooseThree = chooseThree;
});

const alchemyKey = process.env.ALCHEMY;
const devKey = `0x`+ process.env.DEPLOYER;

const appKeyOne = `0x`+ process.env.APPROVER_ONE;
const appKeyTwo = `0x`+ process.env.APPROVER_TWO;
const appKeyThree = `0x`+ process.env.APPROVER_THREE;


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${alchemyKey}`,
      chainId: 5,
      accounts: [devKey, appKeyOne, appKeyTwo, appKeyThree],
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  
};
