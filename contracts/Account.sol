// contracts/Account.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Wallet.sol";


contract Account {
    // the associated multisignature wallet
    Wallet public wallet;

    string public firstName;
    string public lastName;


    // deploy the account before setting the associated wallet
    constructor (string memory _first, string memory _last){
        firstName = _first;
        lastName = _last;
    }

    function initiateWallet(address[] calldata _owners) external {
        // call the constructor passing the
        wallet = new Wallet(_owners);
    }



}