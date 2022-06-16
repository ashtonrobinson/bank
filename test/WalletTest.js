const { expect } = require('chai');

// testing suite for Account.sol
describe("Wallet Contract Testing Suite", function () {
    // variables used in testing suite created in before and beforeEach 
    let WalletFactory;
    let Wallet; 
    let owner;
    let signers;
    let addresses;

    //redeploy the contract before each test
    beforeEach(async function () {
        WalletFactory = await ethers.getContractFactory('Wallet');

        // pull out owners to test contract with
        [owner, ...signers] = await ethers.getSigners();

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

        const indicies = chooseThree(signers.length);
        for(const index of indicies) {
            const addr = signers[index].address
            addresses.push(addr);
        }

        Wallet = await WalletFactory.deploy(addresses);
        await Wallet.deployed();
    });

    describe("Deployment", function () {
        //test 1, correct owners
        it('correct address owners', async function () {
            // only three owners allowed
            expect(await Wallet.getOwners()).to.have.members(addresses);
        });
    });

});