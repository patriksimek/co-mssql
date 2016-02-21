var co = require('co');
var sql = require('../../');
var assert = require('assert');

var config = function() {
	var cfg = JSON.parse(require('fs').readFileSync(__dirname +"/../.mssql.json"));
	cfg.driver = 'tedious';
	return cfg;
}

describe('tedious test suite', function() {
	before(function(done) {
		co(function * () {
			yield sql.connect(config());

			done();
		})();
	});
	
	it('query with one recordset', function(done) {
		co(function * () {
			var request = new sql.Request();
			var recordset = yield request.query('select \'asdf\' as text');
			
			assert.equal(recordset.length, 1);
			assert.equal(recordset[0].text, 'asdf');
			
			done();
		})();
	});
	
	it('query with multiple recordsets', function(done) {
		co(function * () {
			var request = new sql.Request();
			request.multiple = true;
			var recordsets = yield request.query('select 41 as test, 5 as num, 6 as num;select 999 as second');
			
			assert.equal(recordsets.length, 2);
			
			assert.equal(recordsets[0].length, 1);
			assert.equal(recordsets[0][0].test, 41);
			
			assert.equal(recordsets[0][0].num.length, 2);
			assert.equal(recordsets[0][0].num[0], 5);
			assert.equal(recordsets[0][0].num[1], 6);

			assert.equal(recordsets[1][0].second, 999);
			
			assert.equal(recordsets[0].columns.test.type, sql.Int);
			
			done();
		})();
	});
	
	it('query with input parameters', function(done) {
		co(function * () {
			var request = new sql.Request();
			request.input('id', 12);
			var recordset = yield request.query('select @id as id');
			
			assert.equal(recordset.length, 1);
			assert.equal(recordset[0].id, 12);
				
			done();
		})();
	});
	
	it('query with output parameters', function(done) {
		co(function * () {
			var request = new sql.Request();
			request.output('out', sql.VarChar)
			var recordset = yield request.query('select @out = \'test\'');
			
			assert.equal(recordset, null);
			assert.equal(request.parameters.out.value, 'test');
				
			done();
		})();
	});
	
	it('query with error', function(done) {
		co(function * () {
			var request = new sql.Request();
			
			try {
				var recordset = yield request.query('select * from notexistingtable');
			} catch (ex) {
				assert.equal(ex.message, 'Invalid object name \'notexistingtable\'.');
				return done();
			}

			throw new Error("Should throw error.");
		})();
	});

	after(function(done) {
		co(function * () {
			sql.close();
			
			done();
		})();
	});
});
