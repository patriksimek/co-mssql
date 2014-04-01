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

class Transaction extends mssql.Transaction
	###
	Create new Transaction.
	
	@param {Transaction} connection If ommited, global connection is used instead.
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
	Thunkified version of query method.
	
	@returns {Function}
	###
	
	query: (command) ->
		(callback) => super command, (err, result) -> callback err, result # we are dropping returnValue here, so we're compatible with generator based flow controllers
	
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

module.exports.Connection = Connection
module.exports.Transaction = Transaction
module.exports.Request = Request
module.exports.Table = mssql.Table

module.exports.ISOLATION_LEVEL = mssql.ISOLATION_LEVEL
module.exports.DRIVERS = mssql.DRIVERS
module.exports.TYPES = mssql.TYPES
module.exports.MAX = mssql.MAX
module.exports.map = mssql.map

Object.defineProperty module.exports, "fix",
	get: -> mssql.fix
	set: (value) -> mssql.fix = value

# append datatypes to this modules export

for key, value of mssql.TYPES
	module.exports[key] = value
	module.exports[key.toUpperCase()] = value