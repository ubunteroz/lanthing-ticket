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

    it('Check initial values', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.mainAccount.call({
                from: account1
            });
        }).then(function(mainAccount) {
            assert.equal(mainAccount, account1, 'mainAccount does not match!');
            return ticket.numVendors.call({
                from: account1
            });
        }).then(function(numVendors) {
            assert.equal(numVendors.toNumber(), 0, 'Initial numVendors must be equal to 0!');
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

    it('Register account2 and account3 as vendors', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.registerVendor('VENDOR #2', {
                from: account2
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('registerVendor from account2', tx.receipt.gasUsed));
            return ticket.numVendors.call({
                from: account1
            });
        }).then(function(numVendors) {
            assert.equal(numVendors.toNumber(), 1, 'numVendors must be equal to 1!');
            return ticket.registerVendor.call('VENDOR', {
                from: account2
            });
        }).then(function(status) {
            assert.equal(status, false, 'vendor recreation should not possible!');
            return ticket.registerVendor('VENDOR #3', {
                from: account3
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('registerVendor from account3', tx.receipt.gasUsed));
            return ticket.numVendors.call({
                from: account1
            });
        }).then(function(numVendors) {
            assert.equal(numVendors.toNumber(), 2, 'numVendors must be equal to 1!');
            done();
        }).catch(done);
    });

    it('Delete an account from vendor list', function(done) {
        var ticket;

        LanthingTicket1.deployed().then(function(meta) {
            ticket = meta;
            return ticket.deleteVendor(account3, {
                from: account1
            });
        }).then(function(tx) {
            mlog.log(eventFired(tx.logs));
            mlog.log(gasUsed('deleteVendor account3 from account1', tx.receipt.gasUsed));
            return ticket.numVendors.call({
                from: account1
            });
        }).then(function(numVendors) {
            assert.equal(numVendors.toNumber(), 1, 'remaining vendor must be equal to 1!');
            return ticket.deleteVendor.call(account3, {
                from: account1
            });
        }).then(function(status) {
            assert.equal(status, false, 'deleting non-existed vendor should not be possible!');
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
