// contracts/Bank.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Account.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// this is a multisignature account generator contract
contract Bank is Ownable {
    // store each Account
    // this needs to be optimized
    Account[] public accounts;
    
    // backup keys associated with the bank(issuer of accounts) used for account creation
    address private approver;
    address private fallbackApprover;
    
    // used to limit account creation until the approvers have been added
    bool public initiated;

    // used to determine if there is a pending account that needs to be create
    bool public hasPendingAccount; 
    string public pendingFirstName;
    string public pendingLastName;

    // disallow anyone from calling any methods until signers have been added
    modifier isInitiated(){
        require(initiated, "contract has not been initiated yet");
        _;
    }

    // only approver signers can make a call to createAccount
    modifier onlyApprovers(){
        require(msg.sender == approver || msg.sender == fallbackApprover, "only approvers");
        _;
    }

    // cannot create a new account if there is a pending account
    modifier pendingAccountDoesNotExist(){
        require(!hasPendingAccount, "pending account exists");
        _;
    }

    // cannot submit an account if there isnt a pending account
    modifier pendingAccountExists(){
        require(hasPendingAccount, "no pending account");
        _;
    }

    // cannot use signers that have been used in previous Accounts
    // this modifier is extremely space and time intensive as it is searching back through accounts
    // look into EVM ways to limit this in the future
    modifier correctSigners(address[3] memory signers){
        for(uint k = 0; k < 3; k++){
            address potentialSigner = signers[k];

            //check for obvious addressed
            require(potentialSigner != address(this), "cannot be this address");
            require(potentialSigner != address(0), "cannot be zero address");

            // iterate over all accounts, this takes too long
            for (uint i = 0; i < accounts.length; i++){
                Account acct = accounts[i];
                require(potentialSigner != address(acct), "cannot be account address");
                
                // loop over signers of existing wallets
                address[3] memory prevSigners = acct.getWalletSigners();
                for (uint j = 0; j < 3; j++){
                    require(potentialSigner != prevSigners[j], "cannot be a previos signer");
                }
            }
        }
        _;
    }

    //valid bank signers cannot be this address, the owner, or the burn address
    modifier validBankSigners(address one, address two) {
        require(one != address(this) && two != address(this), "approver cant be contract address");
        require(one != owner() && two != owner(), "deployer cannot be an approver");
        require(one != address(0) && two != address(0), "cannot use zero address");
        _;
    }

    // inherits function owner() from Ownable to determine owner(deployer) of contract
    // this contract will need to be deployed from an key pair account
    constructor() {
        initiated = false;
    }

    // signers must be added before accounts can be created
    function addSigners(address one, address two) 
        public 
        onlyOwner
        validBankSigners(one, two)
    {
        approver = one;
        fallbackApprover = two;

        // ensure that the extra signers have been added before any account creation
        initiated = true;
    }

    //create an account, the owner of the Bank passes the names of the account to create
    // these are temporarily held until one of the approvers passes the  addresses to use 
    // when the wallet is created
    function createAccount(string memory _first,  string memory _last) 
        public
        isInitiated
        onlyOwner
        pendingAccountDoesNotExist
    {
        pendingFirstName = _first;
        pendingLastName = _last;

        hasPendingAccount = true;
    }

    // revoke the pending accounnt so that a new one can be created
    function revokePendingAccount()
        public 
        isInitiated
        onlyOwner
        pendingAccountExists
    {
        // no need to change the string variables as this is uneccesary computation
        // they will automatically get rewritten when a new account is created
        hasPendingAccount = false;
    }

    //function to deploy the account that must come from one of the approvers
    function deployAccount(address[3] memory _signers)
        public 
        isInitiated
        onlyApprovers
        pendingAccountExists
        correctSigners(_signers)
    {
        Account newAcct = new Account(pendingFirstName, pendingLastName, _signers);
        accounts.push(newAcct);
        hasPendingAccount = false;
    }

}