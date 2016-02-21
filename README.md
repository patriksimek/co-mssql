# co-mssql [![Dependency Status](https://david-dm.org/patriksimek/co-mssql.png)](https://david-dm.org/patriksimek/co-mssql) [![NPM version](https://badge.fury.io/js/co-mssql.png)](http://badge.fury.io/js/co-mssql)

[node-mssql](https://github.com/patriksimek/node-mssql) wrappers for [co](https://github.com/visionmedia/co)

There is only one difference from original module - all methods that accepts callback as last argument are thunkified and compatible with [co](https://github.com/visionmedia/co). This module doesn't change anything in original module, so you can use them side by side.

## Installation

    npm install co-mssql

## Quick Example

```javascript
var co = require('co'); 
var sql = require('co-mssql'); 

co(function * () {
    var connection = new sql.Connection({
        user: '...',
        password: '...',
        server: 'localhost',
        database: '...'
    });

    try {
    
        yield connection.connect();
        
        // Query

        var request = new sql.Request(connection);
        var recordset = yield request.query('select 1 as number');
        
        console.dir(recordset);
        
        // Stored Procedure
        
        var request = new sql.Request(connection);
        request.input('input_parameter', sql.Int, 10);
        request.output('output_parameter', sql.Int);
        var recordsets = yield request.execute('procedure_name');
        
        console.dir(recordsets);
        
    } catch (ex) {
        // ... error checks
    }
})();
```

<a name="license" />
## License

Copyright (c) 2014-2016 Patrik Simek

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
