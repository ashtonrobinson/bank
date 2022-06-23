const { expect, assert } = require('chai');
const hre = require('hardhat');

// testing suite for Account.sol
describe("Bank Contract Testing Suite", function () {
    // variables used in testing suite created in before and beforeEach 
    let BankFactory;
    let Bank; 
    let bankConnTwo;

    let owner;
    let signers;
    //list of two signer objects that are the verified approvers of the bank
    let bankApprovers;
    //list of three signer objects whose addresses will be used to create the internal wallet
    let walletApprovers

    //redeploy the contract before each test
    before(async function () {
        BankFactory = await ethers.getContractFactory('Bank');
        [owner, ...signers] = await ethers.getSigners();

        walletApprovers = new Array();
        bankApprovers = new Array();

        // generate random signers for the wallet instance to be created
        let indicies = hre.chooseThree(signers.length);
        for (index of indicies) {
            walletApprovers.push(signers[index]);
        }

        nonWalletApprovers = signers.filter(sign => !walletApprovers.includes(sign) && sign != owner);
        bankApprovers = nonWalletApprovers.slice(2);
        
        Bank = await BankFactory.deploy();
        await Bank.deployed();
    });

    describe("Deployment", function () {
        //test 1, correct owners
        it('correct owner', async function () {
            // only three owners allowed
            expect(await Bank.owner()).to.equal(owner.address);
        });

        //test 2, not iniated
        it('not initiated', async function () {
            // initiated should be set to false
            expect(await Bank.initiated()).to.equal(false);

            //all functions should revert
            await expect(Bank.createAccount('Ash', 'Rob')).to.be.revertedWith("contract has not been initiated yet");
            await expect(Bank.revokePendingAccount()).to.be.revertedWith("contract has not been initiated yet");
        });
    });

    //assert that the signers are added correctly
    describe("Add Signers", function () {
        //test 1, invalid addresses for signers
        it('incorrect addresses, non owner', async function() {
            await expect(Bank.addSigners(Bank.address, bankApprovers[0].address)).to.be.revertedWith("approver cant be contract address");
            await expect(Bank.addSigners(bankApprovers[1].address, owner.address)).to.be.revertedWith("deployer cannot be an approver");
            await expect(Bank.addSigners("0x0000000000000000000000000000000000000000", bankApprovers[0].address)).to.be.revertedWith("cannot use zero address");

            bankConnTwo = await Bank.connect(bankApprovers[0]);
            await expect(bankConnTwo.addSigners(owner.address, bankApprovers[1].address)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });  

    // correct addition of signers followed by account creation
    describe("Approvers Added, Account Creation/Approval tests", function () {
        //add the correct approvers
        before(async function () {
            await Bank.addSigners(bankApprovers[0].address, bankApprovers[1].address);
            assert(await Bank.initiated());
        });

        // revoke the pending account if it exists
        afterEach(async function () {
            if (await Bank.hasPendingAccount()){
                await Bank.revokePendingAccount();
                assert(!(await Bank.hasPendingAccount()));
            }
        });

        //test 1, incorrect account creation, no current accounts
        it('Incorrect Account creation, no current accounts', async function () {
            //account creation from someone other than an owner
            await expect(bankConnTwo.createAccount('Ash', 'Rob')).to.be.revertedWith("Ownable: caller is not the owner");
            
            //attempt to revoke the pending account when there is no pending account
            await expect(Bank.revokePendingAccount()).to.be.revertedWith("no pending account");

            // correctly create an account and then attempt to create another 
            await Bank.createAccount('Ash', 'Rob');
            await expect(Bank.createAccount('Other', 'Person')).to.be.revertedWith( "pending account exists");
        });
    }); 
});