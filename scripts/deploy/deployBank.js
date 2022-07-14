// THIS SCRIPT IS FOR DEPLOYING THE TOP LEVEL BANK CONTRACT 
// REFER TO THE DOCUMENTATION FOR INTERACTING WITH THE BANK CONTRACT ONCE DEPLOYED

const hre = require('hardhat');
const ethers = hre.ethers;

async function main() {
    const provider = ethers.provider;

    // create various wallets from private keys
    const deployerKey = process.env.DEPLOYER;
    const devAccount = new ethers.Wallet(deployerKey, provider);

    // two approvers to add to the contract once is deployed to the goerli testnet
    const bankAppKeyOne = process.env.BANK_APPROVER_ONE;
    const bankAppKeyTwo = process.env.BANK_APPROVER_TWO;

    const bankApproverOne = new ethers.Wallet(bankAppKeyOne, provider);
    const bankApproverTwo = new ethers.Wallet(bankAppKeyTwo, provider);

    const BankContractFactory = await ethers.getContractFactory('Bank', devAccount);
    
    const bank = await BankContractFactory.deploy();
    await bank.deployed();

    console.log('Bank successfully deployed to ', bank.address);

    // add the approvers to the bank
    await bank.addSigners(bankApproverOne.address, bankApproverTwo.address);
    // need a way to halt the execution of the deployment until the line above is 
    // confirmed to the network

    // determine if the bank is ready to deploy contracts
    if (await bank.initiated()){
        console.log('bank successfully intitiated, ready for account creation');
    } else {
        console.log('approvers not added');
    }
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });