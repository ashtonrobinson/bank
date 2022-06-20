// contracts/Wallet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable{
    //defines the parameters for multisignature wallets
    uint constant private MAX_APPROVERS = 3;   
    uint constant private NUM_CONFIRMATIONS_REQUIRED = 2;

    // each transaction will have the following format
    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    address[3] public approvers;
    mapping(address => bool) isApprover;

    // each approver is allowed to have one pending txn
    mapping(address => bool) hasPendingTxn;

    // uses the index of each transaction in transactions as key
    mapping(uint => mapping (address => bool)) public confirmations;
    Transaction[] public transactions;

    event Deposit(address indexed from, uint amount);
    event SubmitTransaction(
        address indexed approver,
        address indexed to, 
        uint indexed txnNumber,
        uint value,
        bytes data
    );

    // only three keys are allowed to be associated with this wallet
    modifier checkApproversLength(uint len){
        require(len == MAX_APPROVERS, "only 3 signers allowed");
        _;
    }

    // check if the interaction with this contract is valid
    modifier onlyApprover(){
        require(isApprover[msg.sender], "not approver");
        _;
    }

    // do not allow the same approver to have more than one pending txn
    modifier previousTxnNotApproved(){
        require(!hasPendingTxn[msg.sender], "pending txn exists for this approver");
        _;
    }

    // check that the contract has enough funds to send
    modifier balanceExists(uint value){
        require(address(this).balance > value, "contract needs more funds");
        require(value > 0, "cannot send nothing");
        _;
    }

    // check that the address is valid
    modifier validAddress(address addr) {
        require(address(this) != addr, "cannot send to contract's address");
        require(addr != address(0), "cannot send to null address");
        // the function owner() is inhereited from Ownable and returns the address that deployed this contract
        require(addr != owner(), "cannot send to creator of this wallet");
        _;
    }

    // create a contract 
    constructor (address[] memory _approvers) 
        checkApproversLength(_approvers.length)
    {
        for (uint i = 0; i < _approvers.length; i++){
            address approver = _approvers[i];

            // require address to not be the zero address
            require(approver != address(0), "invalid approver");
            require(!isApprover[approver], "approver not unique");

            isApprover[approver] = true;
            approvers[i] = approver;
        }
    }

    // function to allow the contract to recieve funds
    receive() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }  
    }

    // returns the approvers(addresses) of this specific wallet
    function getApprovers() external view returns (address[3] memory) {
        return approvers;
    }

    // returns the balance of this speicific wallet
    function getValue() external view returns (uint value){
        return address(this).balance;
    }

    // create and confirm a transaction from one of the verified addresses
    // requires value > than acct balance and value > 0
    // address cannot be 0x0, the address of the contract itself, or the creator of the wallet
    function createTransaction(address _dest, uint _value, bytes memory _data) 
        public
        onlyApprover
        previousTxnNotApproved
        balanceExists(_value)
        validAddress(_dest)
    {
        uint txnNumber = transactions.length;

        //add the transaction data
        transactions.push(Transaction({
            destination: _dest,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 1
        }));

        // mark the creator of the transaction as confirmed to save gas
        confirmations[txnNumber][msg.sender] = true;

        // mark the sender as having a pending txn to prevent replay attack
        hasPendingTxn[msg.sender] = true;

        emit SubmitTransaction(msg.sender, _dest, txnNumber, _value, _data);
    }

}