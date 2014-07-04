var co = require('co');
var sql = require('../../');
var assert = require('assert');
var config = require('./_connection')('tedious')

describe('tedious prepared statements test suite', function() {
	before(function(done) {
		co(function * () {
			yield sql.connect(config());

			done();
		})();
	});
	
	it('prepared statement', function(done) {
		co(function * () {
			var ps = new sql.PreparedStatement();
			ps.input('param', sql.Int);
			yield ps.prepare('select @param as value');
			var recordset = yield ps.execute({param: 12345});

			assert.equal(recordset.length, 1);
			assert.equal(recordset[0].value, 12345);
				
			yield ps.unprepare();

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