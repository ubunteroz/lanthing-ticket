pragma solidity ^0.4.4;

import './ERC20Basic.sol';
import './SafeMath.sol';

/**
 * Standard ERC20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 * Based on code by FirstBlood:
 * https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20Basic, SafeMath {
    mapping(address => uint) balances;

    function transfer(address _to, uint _value) {
        balances[msg.sender] = safeSub(balances[msg.sender], _value);
        balances[_to] = safeAdd(balances[_to], _value);
        Transfer(msg.sender, _to, _value);
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }
}
