// contracts/Account.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Wallet.sol";

contract Account {
    // the associated multisignature wallet
    Wallet private wallet;

    string public firstName;
    string public lastName;

    // deploy the account before setting the associated wallet
    constructor (string memory _first, string memory _last){
        firstName = _first;
        lastName = _last;
    }

    // function initiateWallet(address[] calldata _owners) external {
    //     wallet = new Wallet(_owners);
    // }


    // forward funds to the associated Wallet if it has been initiated, 
    // else hold funds, then send when the wallet has been created
    receive() external payable {
        
    }



}