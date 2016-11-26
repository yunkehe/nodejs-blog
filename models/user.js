var mongodb = require('./db.js');

function User(user) {
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
};

// 注册存储信息
User.prototype.save = function(callback) {
	var user = {
		name: this.name,
		password: this.password,
		email: this.email
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
			}, function(err, user){
				mongodb.close();

				if(err){
					return callback(err);
				}

				callback(null, user);
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