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

    // Vendors
    uint public numVendors = 0;
    mapping (address => bool) vendors;
    mapping (address => string) vendorData;

    // Events
    event vendorRegistered(address indexed vendorAddr, string vendorData);
    event vendorDeleted(address indexed vendorAddr);
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

    function registerVendor(string _data) returns (bool success) {
        if (!vendors[msg.sender]) {
            vendors[msg.sender] = true;
            vendorData[msg.sender] = _data;
            numVendors = numVendors + 1;
            vendorRegistered(msg.sender, _data);
            return true;
        } else {
            return false;
        }
    }

    function deleteVendor(address _vendorAddr) returns (bool success) {
        if (organizers[msg.sender] && vendors[_vendorAddr]) {
            delete vendors[_vendorAddr];
            delete vendorData[_vendorAddr];
            numVendors = numVendors - 1;
            vendorDeleted(_vendorAddr);
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
