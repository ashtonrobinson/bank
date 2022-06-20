// contracts/Wallet.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Wallet is Ownable{
    //defines the parameters for multisignature wallets
    uint constant private MAX_APPROVERS = 3;   

    // each transaction will have the following format
    struct Transaction {
        address destination;
        uint value;
        bytes data;
        address creator;
        bool approved;
    }

    // list of addresses associted with this wallet
    address[3] public approvers;
    mapping(address => bool) public isApprover;

    // only allows a single transaction to be queued,
    Transaction public pendingTransaction;
    bool public hasPendingTransaction;

    // the list of transactions that have been confirmed
    Transaction[] public confirmedTransactions;

    event Deposit(address indexed from, uint amount);
    event SubmitTransaction(
        address indexed creator,
        address indexed to, 
        uint value,
        bytes data
    );
    event RevokePendingTransaction(address indexed creator);

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

    // check if the approver who is revoking the transaction is the one who created it and that a transaction exists
    modifier canRevokeTransaction(){
        require(hasPendingTransaction, "pending txn does not exist");
        require(pendingTransaction.creator == msg.sender, "only the creator can revoke the pending txn");
        _;
    }

    // do not allow another transaction to be queued if there exists one
    modifier noPendingTransaction(){
        require(!hasPendingTransaction, "pending txn exists already");
        _;
    }

    // check that the contract has enough funds to send
    modifier balanceExists(uint value){
        require(address(this).balance >= value, "contract needs more funds");
        require(value > 0 wei, "cannot send nothing");
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
        hasPendingTransaction = false;
    }

    // function to allow the contract to recieve funds
    receive() external payable {
        if (msg.value > 0 wei) {
            emit Deposit(msg.sender, msg.value);
        }  
    }

    // returns the approvers(addresses) of this specific wallet
    function getApprovers() external view returns (address[3] memory) {
        return approvers;
    }

    // create and confirm a transaction from one of the verified addresses
    // requires value < than acct balance and value > 0
    // address cannot be 0x0, the address of the contract itself, or the creator of the wallet
    function createTransaction(address _dest, uint _value, bytes memory _data) 
        public
        onlyApprover
        noPendingTransaction
        balanceExists(_value)
        validAddress(_dest)
    {
        pendingTransaction = Transaction({
            destination: _dest,
            value: _value,
            data: _data,
            creator: msg.sender,
            approved: false
        });

        hasPendingTransaction = true;

        emit SubmitTransaction(msg.sender, _dest, _value, _data);
    }


    // revoke the pending txn, checks that the approver making this request created the pending txn 
    function revokePendingTransaction()
        public
        onlyApprover
        canRevokeTransaction
    {
        hasPendingTransaction = false;
        emit RevokePendingTransaction(msg.sender);
    }

}