// contracts/Account.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Account {
    //defines the parameters for multisignature wallets
    uint constant private MAX_OWNERS = 3;   
    uint constant private NUM_CONFIRMATIONS_REQUIRED = 2;

    // each transaction will have the following format
    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    
    address[] public owners;
    mapping(address => bool) isOwner;

    
    Transaction[] public transactions;
    // mapping that uses the index of each transaction in transactions
    mapping(uint => mapping (address => bool)) public confirmations;
    
    

    //modifiers
    modifier checkOwners(uint len){
        require(len == 3);
        _;
    }


    // create a contract 
    constructor (address[] memory _owners)
        checkOwners(_owners.length)
    {
        for (uint i = 0; i < _owners.length; i++){
            address owner = _owners[i];

            // require address to not be the zero address
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");


            isOwner[owner] = true;
            owners.push(owner);
        }
    }

    // function to allow the contract to recieve funds
    receive() external payable {}

}