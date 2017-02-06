var mlog = require('mocha-logger');
var LanthingTicket1 = artifacts.require('./LanthingTicket1.sol');

var avgGasPrice = 0.0000000226;
var ethPrice = 150000;
var currency = 'IDR';

function eventFired(logs) {
    return '\x1b[0mEvent \x1b[36m' + logs[0].event + '\x1b[0m: ' + JSON.stringify(logs[0].args);
}

function gasUsed(func, gas) {
    return '\x1b[0mGas used by \x1b[36m' + func + '\x1b[0m: ' + gas + ' (' + (gas * avgGasPrice) + ', \x1b[1m\x1b[33m~IDR' + (gas * avgGasPrice * ethPrice).toFixed(2) + '\x1b[0m\x1b[22m)';
}

contract('LanthingTicket1', function(accounts) {
    var account1 = accounts[0];
    var account2 = accounts[1];
    var account3 = accounts[2];
    var account4 = accounts[3];

    var initialSupply = 0;

    // NOTE: This test output is only valid on TestRPC
    it('Check contract deployment', function(done) {
        var blockNum = LanthingTicket1.web3.eth.blockNumber;
        var gas = LanthingTicket1.web3.eth.getBlock(blockNum).gasUsed;

        mlog.log(gasUsed('contract deployment', gas));

        done();
    });

    it('Check initial values', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.mainAccount.call({
                from: account1
            });
        }).then(function(mainAccount) {
            assert.equal(mainAccount, account1, 'mainAccount does not match!');
            return ticket.numUsers.call({
                from: account1
            });
        }).then(function(numUsers) {
            assert.equal(numUsers.toNumber(), 0, 'Initial numUsers must be equal to 0!');
            return ticket.totalSupply.call({
                from: account1
            });
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), initialSupply, 'Initial token supply must be equal to ' + initialSupply + '!');
            return ticket.balanceOf.call(account1, {
                from: account1
            });
        }).then(function(balances) {
            assert.equal(balances.toNumber(), initialSupply, 'Organizer\'s initial balances must be equal to ' + initialSupply + '!');
            done();
        }).catch(done);
    });

    it('Register account2 and account3 as users', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.registerUser('USER #2', {
                from: account2
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('registerUser from account2', tx.receipt.gasUsed));
            return ticket.numUsers.call({
                from: account1
            });
        }).then(function(numUsers) {
            assert.equal(numUsers.toNumber(), 1, 'numUsers must be equal to 1!');
            return ticket.registerUser.call('USER', {
                from: account2
            });
        }).then(function(status) {
            assert.equal(status, false, 'user reregistration should not possible!');
            return ticket.registerUser('USER #3', {
                from: account3
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('registerUser from account3', tx.receipt.gasUsed));
            return ticket.numUsers.call({
                from: account1
            });
        }).then(function(numUsers) {
            assert.equal(numUsers.toNumber(), 2, 'numUsers must be equal to 1!');
            done();
        }).catch(done);
    });

    it('Delete an account from user list', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.deleteUser(account3, {
                from: account1
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('deleteUser account3 from account1', tx.receipt.gasUsed));
            return ticket.numUsers.call({
                from: account1
            });
        }).then(function(numUsers) {
            assert.equal(numUsers.toNumber(), 1, 'remaining user must be equal to 1!');
            return ticket.deleteUser.call(account3, {
                from: account1
            });
        }).then(function(status) {
            assert.equal(status, false, 'deleting non-existed user should not be possible!');
            done();
        }).catch(done);
    });

    it('Add some balances to account1 and account2', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.addBalances(account1, 1000000, {
                from: account1
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('addBalances to account1', tx.receipt.gasUsed));
            return ticket.balanceOf.call(account1, {
                from: account1
            });
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 1000000, 'account1\'s balance must be equal to 1,000,000!');
            return ticket.addBalances(account2, 500000, {
                from: account1
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('addBalances to account2', tx.receipt.gasUsed));
            return ticket.balanceOf.call(account2, {
                from: account2
            });
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 500000, 'account2\'s balance must be equal to 500,000!');
            done();
        }).catch(done);
    });

    it('Remove some balances to account1 and account2', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.removeBalances(account1, 200000, {
                from: account1
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('removeBalances of account1', tx.receipt.gasUsed));
            return ticket.balanceOf.call(account1, {
                from: account1
            });
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 800000, 'account1\'s balance must be equal to 800,000!');
            return ticket.removeBalances(account2, 90000, {
                from: account1
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('removeBalances of account2', tx.receipt.gasUsed));
            return ticket.balanceOf.call(account2, {
                from: account2
            });
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 410000, 'account2\'s balance must be equal to 410,000!');
            done();
        }).catch(done);
    });

    it('Balance transfers simulation', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.transfer(account2, 100000, {
                from: account1
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('transfer from account1 to account2', tx.receipt.gasUsed));
            return ticket.balanceOf.call(account1, {
                from: account1
            });
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 700000, 'account1\'s balance must be equal to 900,000!');
            return ticket.balanceOf.call(account2, {
                from: account2
            });
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 510000, 'account2\'s balance must be equal to 510,000!');
            done();
        }).catch(done);
    });
});
