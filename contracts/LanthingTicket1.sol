pragma solidity ^0.4.2;

import "./lib/StandardToken.sol";

contract LanthingTicket1 is StandardToken {
    // Token details
    string public name = "Lanthing Ticketing System";
    string public symbol = "LTGX";
    uint public decimals = 2;
    uint public INITIAL_SUPPLY = 0;

    // Organizers
    address public mainAccount = msg.sender;
    mapping (address => bool) organizers;

    // Users
    uint public numUsers = 0;
    mapping (address => bool) users;
    mapping (address => string) userData;

    // Events
    event userRegistered(address indexed userAddr, string userData);
    event userDeleted(address indexed userAddr);
    event balanceAdded(address indexed owner, uint amount, uint balance);
    event balanceRemoved(address indexed owner, uint amount, uint balance);

    // Constructor
    function LanthingTicket1() {
        organizers[msg.sender] = true;
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

    function changeMainAccount(address _account) returns (bool success) {
        if (organizers[msg.sender]) {
            mainAccount = _account;
            return true;
        } else {
            return false;
        }
    }

    function addOrganizer(address _account) returns (bool success) {
        if (organizers[msg.sender]) {
            organizers[_account] = true;
            return true;
        } else {
            return false;
        }
    }

    function deleteOrganizer(address _account) returns (bool success) {
        if (organizers[msg.sender] && organizers[_account] && _account != msg.sender) {
            delete organizers[_account];
        } else {
            return false;
        }
    }

    function registerUser(string _data) returns (bool success) {
        if (!users[msg.sender]) {
            users[msg.sender] = true;
            userData[msg.sender] = _data;
            numUsers = numUsers + 1;
            userRegistered(msg.sender, _data);
            return true;
        } else {
            return false;
        }
    }

    function deleteUser(address _userAddr) returns (bool success) {
        if (organizers[msg.sender] && users[_userAddr]) {
            delete users[_userAddr];
            delete userData[_userAddr];
            numUsers = numUsers - 1;
            userDeleted(_userAddr);
            return true;
        } else {
            return false;
        }
    }

    function addBalances(address _owner, uint _amount) returns (bool success) {
        if (organizers[msg.sender]) {
            balances[_owner] = safeAdd(balances[_owner], _amount);
            totalSupply = safeAdd(totalSupply, _amount);
            balanceAdded(_owner, _amount, balances[_owner]);
            return true;
        } else {
            return false;
        }
    }

    function removeBalances(address _owner, uint _amount) returns (bool success) {
        if (organizers[msg.sender]) {
            balances[_owner] = safeSub(balances[_owner], _amount);
            totalSupply = safeSub(totalSupply, _amount);
            balanceRemoved(_owner, _amount, balances[_owner]);
            return true;
        } else {
            return false;
        }
    }

    function destroy() {
        if (organizers[msg.sender]) {
            selfdestruct(mainAccount);
        }
    }
}
