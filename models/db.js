var	settings = require('../settings.js');
var mongodb = require('mongodb');

var Db = mongodb.Db,
	Connection = mongodb.Connection,
	mServer = mongodb.Server;


// module.exports = new Db(settings.db, new mServer(settings.host, Connection.DEFAULT_PORT), {safe: true}); 
module.exports = new Db(settings.db, new mServer(settings.host, 27017), {safe: true}); 
