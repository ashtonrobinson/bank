// contracts/Wallet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable{
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

    address[3] public owners;
    mapping(address => bool) isOwner;
    
    // uses the index of each transaction in transactions as key
    mapping(uint => mapping (address => bool)) public confirmations;
    Transaction[] public transactions;

    //event for deposit into this address
    event Deposit(address indexed from, uint amount, uint balance);
    
    // only three keys are allowed to be associated with this wallet
    modifier checkOwnersLength(uint len){
        require(len == MAX_OWNERS, "only 3 signers allowed");
        _;
    }

    // check if the interaction with this contract is valid
    modifier onlyApprover(){
        require(isOwner[msg.sender], "not owner");
        _;
    }

    // check that the contract has enough funds to send
    modifier balanceExists(uint value){
        require(address(this).balance > value, "contract needs more funds");
        require(value > 0, "cannot send 0 ether");
        _;
    }

    // check that the address is valid
    modifier validAddress(address addr) {
        require(address(this) != addr, "cannot send to contract's address");
        require(addr != address(0), "cannot send to null address");
        require(addr != owner(), "cannot send to creator of this wallet");
        _;
    }

    // create a contract 
    constructor (address[] memory _owners) 
        checkOwnersLength(_owners.length)
    {
        for (uint i = 0; i < _owners.length; i++){
            address owner = _owners[i];

            // require address to not be the zero address
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");

            isOwner[owner] = true;
            owners[i] = owner;
        }
    }

    // function to allow the contract to recieve funds
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    // returns the owners(addresses) of this specific wallet
    function getOwners() external view returns (address[3] memory) {
        return owners;
    }

    // returns the balance of this speicific wallet
    function getValue() external view returns (uint value){
        return address(this).balance;
    }

    // create a transaction, sending value to dest
    // requires value > than acct balance and value > 0
    // address cannot be 0x0, the address of the contract itself, or the creator of the wallet
    function createTransaction(address dest, uint value) 
        public
        onlyApprover
        balanceExists(value)
        validAddress(dest)
    {
        
    }

    

}