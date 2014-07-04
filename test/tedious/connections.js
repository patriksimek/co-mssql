var co = require('co');
var sql = require('../../');
var assert = require('assert');
var config = require('./_connection')('tedious')

var connection1, connection2;

describe('tedious multiple connections test suite', function() {
	before(function(done) {
		co(function * () {
			connection1 = new sql.Connection(config.user2());
			yield connection1.connect();
				
			connection2 = new sql.Connection(config.user3());
			yield connection2.connect();

			yield sql.connect(config());

			done();
		})();
	});
	
	it('connection 1', function(done) {
		co(function * () {
			var request = connection1.request();
			var recordset = yield request.query('select SYSTEM_USER as u');
			assert.equal(recordset[0].u, 'xsp_test2');
			
			done()
		})();
	});
	
	it('connection 2', function(done) {
		co(function * () {
			var request = connection2.request();
			var recordset = yield request.query('select SYSTEM_USER as u');
			assert.equal(recordset[0].u, 'xsp_test3');
			
			done()
		})();
	});
	
	it('global connection', function(done) {
		co(function * () {
			var request = new sql.Request();
			var recordset = yield request.query('select SYSTEM_USER as u');
			assert.equal(recordset[0].u, 'xsp_test');
			
			done()
		})();
	});

	after(function(done) {
		co(function * () {
			connection1.close();
			connection2.close();
			sql.close();
			
			done();
		})();
	});
});