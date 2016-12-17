var mongodb = require('./db.js');
var markdown = require('markdown').markdown;
var ObjectId = require('mongodb').ObjectId;

// 发表数据
function Publish(data) {
	this.author = data.author;
	this.title = data.title;
	this.article = data.article;
};

Publish.prototype.save = function(callback){
	var blog = {
		author: this.author,
		title: this.title,
		article: this.article
	};

	// 存储时间
	var date = new Date();
	blog.time = {
		year: date.getFullYear(),
		month: date.getMonth()+1,
		day: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		localString: date.toLocaleString()
	};

	mongodb.open(function(err, db){
		if(err) return callback(err); 

		// 打开文档出错 关闭mongdb
		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			
			// 存储博客
			collection.insert(blog, {safe: true}, function(err, blog){
				// 操作完成后关闭数据库
				mongodb.close();
				if(err) return callback(err);
				callback(null);
			});
		});
	});
};

// 获取博客内容
Publish.getAll = function(author, callback){
	// 打开数据库
	mongodb.open(function (err, db) {
		if(err) return callback(err);
		// 打开文档
		db.collection('blogs', function(err, collection){

			if(err){
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if(author) query.author = author;

			collection.find(query)
			.sort({time: -1})
			.toArray(function(err, blogs){
				mongodb.close();
				if(err) return callback(err);

				blogs.forEach(function(blog){
					blog.article = markdown.toHTML(blog.article);
				});
				
				callback(null, blogs);
			});
		});
	});
};

// 获取一篇博客
Publish.getOne = function(params, callback){
	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			
			var query = {};

			// 单独用_id查询
			if(params.id){
				query._id = ObjectId(params.id);
			}else{
				query = {
					author: params.author || '',
					title: params.title || '',
					'time.localString': params.localString || '',
				};
			}
			// if(params.id) query._id = ObjectId("5854a2b346736725e0f5143a");
			if(params.id) query._id = ObjectId(params.id);

			// 查询一篇博客
			collection.findOne(query, function(err, blog){
				mongodb.close();
				if(err) return callback(err);
				blog.articleS = blog.article;
				blog.article = markdown.toHTML(blog.article);
				callback(null, blog);
			})
		})
	})
}

// 保存修改
Publish.update = function(params, callback){
	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			var query = {
				_id: ObjectId(params.id)
			};

			var updateParams = {
				article: params.article
			};

			collection.update(query, {$set: updateParams}, function(err){
				mongodb.close();
				if(err) return callback(err);
				callback(null); 
			});
		})
	})
}

// 删除博客
Publish.remove = function(params, callback){
	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.remove({
				_id: ObjectId(params.id)
			}, {w: 1}, function(err){
				mongodb.close();
				if(err) return callback(err);
				callback(null);
			});

		});
	});
};



module.exports = Publish;