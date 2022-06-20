const { expect } = require('chai');

// testing suite for Account.sol
describe("Account Contract Testing Suite", function () {
    // variables used in testing suite created in before and beforeEach 
    let AccountFactory;
    let Account; 
    let first;
    let last;  

    //redeploy the contract before each test
    beforeEach(async function () {
        AccountFactory = await ethers.getContractFactory('Account');

        first = 'Ashton';
        last = 'Robinson';

        Account = await AccountFactory.deploy(first, last);
        await Account.deployed();
    });

    describe("Deployment", function () {
        //test 1, correct owners
        it('correct account name', async function () {
            // only three owners allowed
            await expect(Account.firstName()).to.equal(first);
            await expect(Account.lastName()).to.equal(last);
        });
    });



});