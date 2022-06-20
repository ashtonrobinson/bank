const { expect, assert } = require('chai');
const { ethers, waffle} = require("hardhat");

// testing suite for Account.sol
describe("Wallet Contract Testing Suite", function () {
    let provider;
    // variables used in testing suite created in before and beforeEach 
    let WalletFactory;
    let Wallet; 
    let owner;
    // list of signer objects
    let signers;
    // list of 3 signer objects that are the approvers of the wallet
    let approvers;
    // addresses of the 3 approvers
    let addresses;

    // the balance after ether has been recieved to the wallet
    let balanceAfter;

    // create the contract factory before anything runs
    before(async function () {
        provider = waffle.provider;

        WalletFactory = await ethers.getContractFactory('Wallet');
        // pull out owners to test contract with
        [owner, ...signers] = await ethers.getSigners();

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

        addresses = new Array();
        approvers = new Array();

        const indicies = chooseThree(signers.length);
        for(const index of indicies) {
            const appr = signers[index]
            approvers.push(appr);
            addresses.push(appr.address);
        }

        Wallet = await WalletFactory.deploy(addresses);
        await Wallet.deployed();
    });

    // correctly check that approvers is of length 3 and has the correct addresses
    describe("Deployment", function () {
        //test 1, correct approvers
        it('correct address approvers', async function () {
            // only three approvers allowed
            expect(await Wallet.getApprovers()).to.have.members(addresses);
            expect(await Wallet.getApprovers()).to.have.length(3);
        });

        //correct owner(deployer of the contract)
        it('correct deployer of the contract', async function () {
            expect(await Wallet.owner()).to.equal(owner.address);
        })

        //test 2, correct balance of zero on deployment
        it('correct balance', async function () {
            expect(await provider.getBalance(Wallet.address)).to.equal(0);
        });
    });

    describe("Incorrect Deployment", function () {
        // test invalid creation
        it('zero approvers', async function () {
            await expect(WalletFactory.deploy()).to.be.reverted;
        });

        // length of approvers is smaller
        it('one signer', async function () {
            let signer = signers[0];
            let address = signer.address;

            await expect(WalletFactory.deploy([address])).to.be.revertedWith("only 3 signers allowed");
        });

        // length of approvers is larger
        it('five signers', async function () {
            let addresses = signers.slice(5).map(sign => sign.address);

            await expect(WalletFactory.deploy(addresses)).to.be.revertedWith("only 3 signers allowed");
        });

        //duplicate approvers
        it('duplicate approvers', async function () {
            let signerOne = signers[0];
            let signerTwo = signers[1];

            let addr1 = signerOne.address;
            let addr2 = signerTwo.address;

            await expect(WalletFactory.deploy([addr2, addr1, addr2])).to.be.revertedWith("approver not unique");
        });

        // cannot use the zero address to create a wallet
        it('approver is the zero address', async function () {
            let signerOne = signers[0];
            let signerTwo = signers[1];

            let addr1 = signerOne.address;
            let addr2 = signerTwo.address;

            await expect(WalletFactory.deploy([addr1, addr2, "0x0000000000000000000000000000000000000000"]))
                .to.be.revertedWith("invalid approver");
        })
    });

    // recieve ether and emit an event
    describe("Receiving Ether", function () {
        let walletAddr;
        let balanceBefore;

        before(async function () {
            walletAddr = Wallet.address;
        });

        beforeEach(async function () {
            balanceBefore = await provider.getBalance(walletAddr);
        });

        // asserts that the balance is non zero before attempting to create transactions
        after(async function () {
            balanceAfter = await provider.getBalance(Wallet.address);
            assert(balanceAfter > 0);
        });

        //test 1, recieving ether from owner, no ether in contract
        it('deployer sent 1 ether to contract', async function () {
            let txn = {to: walletAddr, value: ethers.utils.parseEther('1.0')};

            // confirm the event was recieved
            await expect(owner.sendTransaction(txn)).to.emit(Wallet, "Deposit")
                .withArgs(owner.address, ethers.utils.parseEther('1.0'));

            //check that the balance of the account is correct
            expect(await provider.getBalance(walletAddr)).to.equal(balanceBefore.add(ethers.utils.parseEther('1.0')));
        });

        //test 2, approver sent zero eth
        it('approver sent 0 ether to contract', async function () {
            txn = {to: walletAddr, value: 0};

            const approverOne = approvers[0];

            //no event should be triggered
            await approverOne.sendTransaction(txn);
            expect(await provider.getBalance(walletAddr)).to.equal(balanceBefore);
        });

        //test 3, multiple random addresses sending ether repeatedly
        it('recieve from random addresses', async function () {
            value1 = ethers.utils.parseEther('0.009');
            value2 = ethers.utils.parseEther('0.8');
            value3 = ethers.utils.parseEther('20.0');
            txn1 = {to: walletAddr, value: value1};
            txn2 = {to: walletAddr, value: value2};
            txn3 = {to: walletAddr, value: value3};

            const randomSingers = signers.filter(sign => !approvers.includes(sign) && sign != owner);

            await expect(randomSingers[0].sendTransaction(txn1)).to.emit(Wallet, "Deposit")
                .withArgs(randomSingers[0].address, value1);
            await expect(randomSingers[1].sendTransaction(txn2)).to.emit(Wallet, "Deposit")
                .withArgs(randomSingers[1].address, value2);
            await expect(randomSingers[2].sendTransaction(txn3)).to.emit(Wallet, "Deposit")
                .withArgs(randomSingers[2].address, value3);

            expect(await provider.getBalance(walletAddr)).to.equal(balanceBefore.add(value1).add(value2).add(value3));
        });   
    });

    // correctly create a transaction
    describe("Transaction Creation", function () {
        let approver;
        let connection;
    
        // assign an approver to initiate the transaction
        beforeEach(async function () {
            approver = approvers[Math.floor(Math.random()*3)];
            connection = await Wallet.connect(approver);
        });

        // reset after each test so that there is no pending txn
        afterEach(async function () {
            await connection.revokePendingTransaction();
        });

        //test 1, transaction request from the approver when wallet has a balance
        it('correct creation, no double requests', async function () {
            //randomly pick an address
            to = signers[Math.floor(Math.random()*(signers.length))].address;
            // send a small amount
            value = ethers.utils.parseEther('1');
            data = "0x";

            await expect(connection.createTransaction(to, value, "0x")).to.emit(Wallet, "SubmitTransaction")
                .withArgs(approver.address, to, value, data);
            
            expect(await Wallet.hasPendingTransaction()).to.be.true;

            //attempt to create the same transaction again, should revert
            await expect(connection.createTransaction(to, value, "0x")).to.be.revertedWith("pending txn exists already");
        });

    });

    

});