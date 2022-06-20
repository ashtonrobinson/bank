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
            expect(await Wallet.getValue()).to.equal(0);
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

            await expect(WalletFactory.deploy([addr1, addr2, "0x0000000000000000000000000000000000000000"])).to.be.revertedWith("invalid approver");
        })
    })

    // correctly create a transaction
    describe("Transaction Creation", function () {
        //test 1, 
    });

});