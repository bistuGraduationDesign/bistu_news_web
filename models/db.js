var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
module.exports = new Db("newsWeb", new Server("localhost", 27017), {
	safe: true
});