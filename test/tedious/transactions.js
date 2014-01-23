var co = require('co');
var sql = require('../../');
var assert = require('assert');

describe('tedious transactions test suite', function() {
	before(function(done) {
		co(function * () {
			yield sql.connect({
				user: 'xsp_test',
				password: 'sweet',
				server: '192.168.2.2',
				database: 'xsp'
			});
			
			var req = new sql.Request();
			yield req.query('delete from tran_test');

			done();
		})();
	});
	
	it('transaction with rollback', function(done) {
		co(function * () {
			var tran = new sql.Transaction();
			yield tran.begin();

			var req = tran.request()
			yield req.query('insert into tran_test values (\'test data\')');

			req = new sql.Request();
			var recordset = yield req.query('select * from tran_test with (nolock)');
			assert.equal(recordset.length, 1);
			assert.equal(recordset[0].data, 'test data');
				
			yield tran.rollback();

			req = new sql.Request();
			recordset = yield req.query('select * from tran_test');
			assert.equal(recordset.length, 0);

			done()
		})();
	});
	
	it('transaction with commit', function(done) {
		co(function * () {
			var tran = new sql.Transaction();
			yield tran.begin();

			var req = tran.request()
			yield req.query('insert into tran_test values (\'test data\')');

			yield tran.commit();

			req = new sql.Request();
			recordset = yield req.query('select * from tran_test');
			assert.equal(recordset.length, 1);
			assert.equal(recordset[0].data, 'test data');

			done()
		})();
	});

	after(function(done) {
		co(function * () {
			sql.close();
			
			done();
		})();
	});
});