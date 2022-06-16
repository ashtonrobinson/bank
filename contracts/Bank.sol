// contracts/Bank.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Account.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// this is a multisignature account generator contract
contract Bank is Ownable {
    Account[] private accounts;

    // backup keys associated with the account used for account creation
    address private approver;
    address private fallbackApprover;

    // inherits function owner() from Ownable to determine owner(deployer) of contract
    constructor() {}

    function addSigners(address one, address two) public onlyOwner{
        approver = one;
        fallbackApprover = two;
    }


}