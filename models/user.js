var mongodb = require('./db.js');
var crypto = require('crypto');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

// 注册存储信息
User.prototype.save = function(callback) {
	var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
		head = 'http://www.gravatar.com/avatar/'+email_MD5+'?s=48';
	
	// console.log('=========================================注册头像', head);
	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		head: head
	};


	// 打开数据库
	mongodb.open(function(err, db) {
		if(err){
			return callback(err);
		}

		db.collection('users', function (err, collection) {
			if(err){
				mongodb.close();
				return callback(err);
			}

			// 将用户插入user集合
			collection.insert(user, {
				safe: true
			}, function(err, results){
				mongodb.close();

				if(err){
					return callback(err);
				}

				callback(null, results.ops[0]);
			})
		})
	})
};

// 读取用户信息
User.get = function(name, callback){
	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('users', function (err, collection) {
			if(err) return callback(err);

			collection.findOne({
				name: name
			}, function (err, user) {
				mongodb.close();

				if(err) return callback(err);

				callback(null, user);
			})
		})
	})
}

module.exports = User;