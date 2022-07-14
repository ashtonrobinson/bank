// THIS IS A TEST SCRIPT TO DEPLOY ONLY THE WALLET CONTRACT
// DO NOT USE THIS TO DEPLOY CONTRACTS TO MAINNET
// THIS SCRIPT HAS BEEN USED TO DEPLOY A WALLET INSTANCE ON GOERLI

const hre = require('hardhat');
const ethers = hre.ethers;

async function main() {
    const WalletContractFactory = await ethers.getContractFactory("Wallet");
    const provider = ethers.provider;
   
    // create various wallets from private keys
    const deployerKey = process.env.DEPLOYER;
    const devAccount = new ethers.Wallet(deployerKey, provider);

    const approverOneKey = process.env.APPROVER_ONE;
    const appOneAcc = new ethers.Wallet(approverOneKey, provider);

    const approverTwoKey = process.env.APPROVER_TWO;
    const appTwoAcc = new ethers.Wallet(approverTwoKey, provider);

    const approverThreeKey = process.env.APPROVER_THREE;
    const appThreeAcc = new ethers.Wallet(approverThreeKey, provider);

    const connectedFactory = WalletContractFactory.connect(devAccount);
    const wallet = await connectedFactory.deploy([appOneAcc.address, appTwoAcc.address, appThreeAcc.address]);
    await wallet.deployed();

    console.log("Wallet address:", wallet.address);
    console.log("Approver One address:", appOneAcc.address);
    console.log("Approver Two address:", appTwoAcc.address);
    console.log("Approver Three address:", appThreeAcc.address);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });