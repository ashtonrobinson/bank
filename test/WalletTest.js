const { expect } = require('chai');

// testing suite for Account.sol
describe("Wallet Contract Testing Suite", function () {
    // variables used in testing suite created in before and beforeEach 
    let WalletFactory;
    let Wallet; 
    let owner;
    let signers;
    let addresses;

    // create the contract factory before anything runs
    before(async function () {
        WalletFactory = await ethers.getContractFactory('Wallet');

        // pull out owners to test contract with
        [owner, ...signers] = await ethers.getSigners();

        // test invalid creation
        it('zero owners', async function () {
            await expect(WalletFactory.deploy()).to.be.reverted;
        });

        //
        it('one signer', async function () {
            let signer = signers[0];
            let address = signer.address;

            await expect(WalletFactory.deploy([address])).to.be.revertedWith("only 3 signers allowed");
        })
    })

    //redeploy the contract before each test
    beforeEach(async function () {
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

        const indicies = chooseThree(signers.length);
        for(const index of indicies) {
            const addr = signers[index].address
            addresses.push(addr);
        }

        Wallet = await WalletFactory.deploy(addresses);
        await Wallet.deployed();
    });

    // correctly check that owners is of length 3 and has the correct addresses
    describe("Deployment", function () {
        //test 1, correct owners
        it('correct address owners', async function () {
            // only three owners allowed
            await expect(Wallet.getOwners()).to.have.members(addresses);
            await expect(Wallet.getOwners().length).to.equal(3);
        });

        //test 2, correct balance of zero on deployment
        it('correct balance', async function () {
            await expect(Wallet.getValue()).to.equal(0);
        });
    });

    

});