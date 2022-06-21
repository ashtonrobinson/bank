require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

require('dotenv').config();

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
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
