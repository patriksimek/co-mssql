var co = require('co');
var sql = require('../../');
var assert = require('assert');
var config = require('./_connection')('tedious')

describe('tedious test suite', function() {
	before(function(done) {
		co(function * () {
			yield sql.connect(config());
			
			var req = new sql.Request();
			yield req.query('delete from tran_test');

			done();
		})();
	});
	
	it('stored procedure', function(done) {
		co(function * () {
			var request = new sql.Request();
			request.input('in', sql.Int, null);
			request.input('in2', sql.BigInt, 0);
			request.input('in3', sql.NVarChar, 'ěščřžýáíé');
			request.output('out', sql.Int);
			request.output('out2', sql.Int);
		
			var recordsets = yield request.execute('__test');
		
			assert.equal(recordsets.returnValue, 11);
			assert.equal(recordsets.length, 3);
			
			assert.equal(recordsets[0].length, 2);
			assert.equal(recordsets[0][0].a, 1);
			assert.equal(recordsets[0][0].b, 2);
			assert.equal(recordsets[0][1].a, 3);
			assert.equal(recordsets[0][1].b, 4);
			
			assert.equal(recordsets[1].length, 1);
			assert.equal(recordsets[1][0].c, 5);
			assert.equal(recordsets[1][0].d, 6);
			
			// there should be 3 values - 0, 111, asdf - but there is a bug with bigint in tedious when 0 value is casted as null
			//assert.equal(recordsets[1][0].e.length, 3);
			//assert.equal(recordsets[1][0].e[0], 0);
			//assert.equal(recordsets[1][0].e[1], 111);
			//assert.equal(recordsets[1][0].e[2], 'asdf');
			
			assert.equal(recordsets[1][0].f, null);
			assert.equal(recordsets[1][0].g, 'ěščřžýáíé');
			assert.equal(recordsets[2].length, 0);

			assert.equal(request.parameters.out.value, 99);
			assert.equal(request.parameters.out2.value, null);
			
			done();
		})();
	});
	
	it('stored procedure with one empty recordset', function(done) {
		co(function * () {
			var request = new sql.Request();
			var recordsets = yield request.execute('__test2');
			
			assert.equal(recordsets.returnValue, 11);
			assert.equal(recordsets.length, 2);
			
			done();
		})();
	});
	
	it('empty query', function(done) {
		co(function * () {
			var request = new sql.Request();
			var recordset = yield request.query('');
			
			assert.equal(recordset, null);

			done();
		})();
	});
	
	it('query with no recordset', function(done) {
		co(function * () {
			var request = new sql.Request();
			var recordset = yield request.query('select * from sys.tables where name = \'______\'');
			
			assert.equal(recordset.length, 0);
			
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
	
	it('batch', function(done) {
		co(function * () {
			var request = new sql.Request();
			var recordset = yield request.batch('select 1 as num');
			
			assert.equal(recordset.length, 1);
			assert.equal(recordset[0].num, 1);
				
			done();
		})();
	});

	after(function(done) {
		co(function * () {
			sql.close();
			
			done();
		})();
	});
});