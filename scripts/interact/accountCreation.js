// THIS FILE IS FOR CREATING ACCOUNTS USING THE BANK CONTRACT THAT HAS ALREADY BEEN DEPLOYED
// WE RECCCOMEND ONLY USING THIS FILE TO INTERACT WITH THE GOELRI TESTNET

const hre = require('hardhat');
const ethers = hre.ethers;

async function main() {
    const provider = ethers.provider;

    //  keys to use for the creation of accounts on goerli
    const devKey = process.env.DEPLOYER;
    const bankAppOneKey = process.env.BANK_APPROVER_ONE;

    // this key is not neccesarily needed if the first approver is avaiable
    const bankAppTwoKey = process.env.BANK_APPROVER_TWO;

    // these keys will be used to create the wallet of the new account that is created
    const walletOneKey = process.env.APPROVER_ONE;
    const walletTwoKey = process.env.APPROVER_TWO;
    const walletThreeKey = process.env.APPROVER_THREE;

    // create signer instances to interact with the network
    const devAcct = new ethers.Wallet(devKey, provider);
    const bankAppOneAcct = new ethers.Wallet(bankAppOneKey, provider);
    const bankAppTwoAcct = new ethers.Wallet(bankAppTwoKey, provider);
    const walletOneAcct = new ethers.Wallet(walletOneKey, provider);
    const walletTwoAcct = new ethers.Wallet(walletTwoKey, provider);
    const walletThreeAcct = new ethers.Wallet(walletThreeKey, provider);

    // pull network
    let network = hre.hardhatArguments.network;
    //console.log(network);
    let bankContract;

    // this is the contract address on goerli retrieved from the deploy script
    if (network == 'goerli'){
        bankContract = '0xc1a946e7150e5A7c096feCFd5F74D48b2b793e30';
    } else if (network == 'hardhat' || network == 'localhost' || network == undefined){
        // this is inefficient as it creates an instance to simply retrieve the address
        // but no concern as this is the local or hardhat network
        const BankContractFactory = await ethers.getContractFactory('Bank', devAcct);
        const bank = await BankContractFactory.deploy();
        await bank.deployed();
        // add the approvers to the bank
        await bank.addSigners(bankAppOneAcct.address, bankAppTwoAcct.address);

        bankContract = bank.address;
    }
    
    const bankABI = (await hre.artifacts.readArtifact('Bank')).abi;
    
    const bankDev = new ethers.Contract(bankContract, bankABI, devAcct);
    const bankAppOne = bankDev.connect(bankAppOneAcct);

    let txn = await bankDev.createAccount('Ashton', 'Robinson');
    await txn.wait();

    // then approve the account and add the signers
    txn = await bankAppOne.deployAccount([walletOneAcct.address, walletTwoAcct.address, walletThreeAcct.address]);
    await txn.wait();

    let newAcct = (await bankDev.getAccountAddresses())[0];

    console.log('Account posted to: ', newAcct);
    console.log('With signers: ', walletOneAcct.address, walletTwoAcct.address, walletThreeAcct.address);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });