const { expect, assert } = require('chai');
const hre = require('hardhat');
const { ethers, waffle } = require('hardhat');

// testing suite for Account.sol
describe("Account Contract Testing Suite", function () {
    // variables used in testing suite created in before and beforeEach 
    let provider;
    let AccountFactory;
    let Account; 
    let first;
    let last;  
    let owner;
    let signers;
    let approvers;
    let associatedWalletAddr;

    //deploy the account once
    before(async function () {
        provider = waffle.provider;
        AccountFactory = await ethers.getContractFactory('Account');

        // pull out owner of the contract and associated signers
        [owner, ...signers] = await ethers.getSigners();

        let addresses = new Array();
        approvers = new Array();

        // hre.chooseThree is defined in hardhat config
        const indicies = hre.chooseThree(signers.length);
        for(const index of indicies) {
            const appr = signers[index]
            approvers.push(appr);
            addresses.push(appr.address);
        }

        first = 'Ashton';
        last = 'Robinson';

        // deploy
        Account = await AccountFactory.deploy(first, last, addresses);
        await Account.deployed();
    });

    describe("Deployment", function () {
        //test 1, correct owners
        it('correct account name', async function () {
            // only three owners allowed
            expect(await Account.firstName()).to.equal(first);
            expect(await Account.lastName()).to.equal(last);
        });

        //test 2, return an a wallet address
        it('correct wallet address', async function () {
            associatedWalletAddr = await Account.getWalletAddress();
            assert(associatedWalletAddr != null);
        });
    });


    describe("funds sent to account", function () {
        let sign;
        let value;
        let balanceBefore;

        before(async function () {
            // value
            sign = signers[Math.floor(Math.random()*(signers.length))];
            value = ethers.utils.parseEther('1.0');
        });

        beforeEach(async function () {
            balanceBefore = await provider.getBalance(associatedWalletAddr);
        })

        //test 1, funds sent to account are > 0
        it('funds > 0', async function () {
            // send transction and ensure that an event was triggered
            await expect(sign.sendTransaction({to: Account.address, value: value}))
                .to.emit(Account, 'DepositForwarded').withArgs(sign.address, value);

            expect(await provider.getBalance(associatedWalletAddr)).to.equal(balanceBefore.add(value));
        });

        //test two, no funds sent
        it('funds = 0', async function () {
            await sign.sendTransaction({to: Account.address, value: 0});
            expect(await provider.getBalance(associatedWalletAddr)).to.equal(balanceBefore);
        });
    });
});