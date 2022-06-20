// contracts/Bank.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Account.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// this is a multisignature account generator contract
contract Bank is Ownable {
    Account[] public accounts;

    // backup keys associated with the bank(issuer of accounts) used for account creation
    address private approver;
    address private fallbackApprover;
    
    bool public initiated;

    // inherits function owner() from Ownable to determine owner(deployer) of contract
    // this contract will need to be deployed from an key pair account
    constructor() {
        initiated = false;
    }

    // signers must be added before accounts can be created
    function addSigners(address one, address two) public onlyOwner{
        approver = one;
        fallbackApprover = two;

        // ensure that the extra signers have been added before any account creation
        initiated = true;
    }

    

    


}