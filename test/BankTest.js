const { expect } = require('chai');

// testing suite for Account.sol
describe("Bank Contract Testing Suite", function () {
    // variables used in testing suite created in before and beforeEach 
    let BankFactory;
    let Bank; 
    let owner;

    //redeploy the contract before each test
    beforeEach(async function () {
        BankFactory = await ethers.getContractFactory('Bank');
        owner = await ethers.getSigner();

        Bank = await BankFactory.deploy();
        await Bank.deployed();
    });

    describe("Deployment", function () {
        //test 1, correct owners
        it('correct owner', async function () {
            // only three owners allowed
            expect(await Bank.owner()).to.equal(owner.address);
        });
    });
});