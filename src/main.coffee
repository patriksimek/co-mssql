mssql = require 'mssql'

class Connection extends mssql.Connection
	###
	Create new Connection.
	
	@param {Object} config Connection configuration.
	###
	
	constructor: (config) ->
		super config
	
	###
	Initializes driver for this connection.
	
	@param {Function} driver Loaded driver.
	
	@returns {Connection}
	###
	
	initializeDriver: (driver) ->
		driver Connection, Transaction, Request, mssql.ConnectionError, mssql.TransactionError, mssql.RequestError
	
	###
	Thunkified version of connect method.
	
	@returns {Function}
	###
	
	connect: ->
		(callback) => super callback
	
	###
	Returns new request using this connection.
	
	@returns {Request}
	###
	
	request: ->
		new Request @
	
	###
	Returns new transaction using this connection.
	
	@returns {Transaction}
	###
	
	transaction: ->
		new Transaction @

class PreparedStatement extends mssql.PreparedStatement
	###
	Create new PreparedStatement.
	
	@param {Connection|Transaction} connection If ommited, global connection is used instead.
	###
	
	constructor: (connection) ->
		super connection
	
	###
	Thunkified version of prepare method.
	###
	
	prepare: (statement) ->
		(callback) => super statement, callback
		
	###
	Thunkified version of execute method.
	###
	
	execute: (values) ->
		(callback) => super values, (err, result) -> callback err, result # we are dropping returnValue here, so we're compatible with generator based flow controllers
		
	###
	Thunkified version of rollback method.
	###
		
	unprepare: ->
		(callback) => super callback

class Transaction extends mssql.Transaction
	###
	Create new Transaction.
	
	@param {Connection} connection If ommited, global connection is used instead.
	###
	
	constructor: (connection) ->
		super connection
	
	###
	Thunkified version of begin method.
	###
	
	begin: ->
		(callback) => super callback
		
	###
	Thunkified version of commit method.
	###
	
	commit: ->
		(callback) => super callback
	
	###
	Returns new request using this transaction.
	
	@returns {Request}
	###
	
	request: ->
		new Request @
		
	###
	Thunkified version of rollback method.
	###
		
	rollback: ->
		(callback) => super callback

class Request extends mssql.Request
	###
	Create new Request.
	
	@param {Request|Transaction} connection If ommited, global connection is used instead.
	###

	constructor: (connection) ->
		super connection
	
	###
	Thunkified version of bulk method.
	
	@returns {Function}
	###
	
	bulk: (table) ->
		(callback) => super table, (err, result) -> callback err, result
	
	###
	Thunkified version of batch method.
	
	@returns {Function}
	###
	
	batch: (batch) ->
		(callback) => super batch, (err, result) -> callback err, result
	
	###
	Thunkified version of query method.
	
	@returns {Function}
	###
	
	query: (command) ->
		(callback) => super command, (err, result) -> callback err, result
	
	###
	Thunkified version of execute method.
	
	@returns {Function}
	###
	
	execute: (procedure) ->
		(callback) => super procedure, (err, result) -> callback err, result # we are dropping returnValue here, so we're compatible with generator based flow controllers

###

###

module.exports.connect = (config) ->
	(callback) -> mssql.connect config, callback

###

###

module.exports.close = ->
	mssql.close()

module.exports.on = ->
	mssql.on arguments...

module.exports.Connection = Connection
module.exports.Transaction = Transaction
module.exports.Request = Request
module.exports.Table = mssql.Table
module.exports.PreparedStatement = PreparedStatement

module.exports.ConnectionError = mssql.ConnectionError
module.exports.TransactionError = mssql.TransactionError
module.exports.RequestError = mssql.RequestError
module.exports.PreparedStatementError = mssql.PreparedStatementError

module.exports.ISOLATION_LEVEL = mssql.ISOLATION_LEVEL
module.exports.DRIVERS = mssql.DRIVERS
module.exports.TYPES = mssql.TYPES
module.exports.MAX = mssql.MAX
module.exports.map = mssql.map

Object.defineProperty module.exports, "fix",
	get: -> mssql.fix
	set: (value) -> mssql.fix = value

Object.defineProperty module.exports, 'Promise',
	get: -> mssql.Promise
	set: (value) -> mssql.Promise = value

# append datatypes to this modules export

for key, value of mssql.TYPES
	module.exports[key] = value
	module.exports[key.toUpperCase()] = value