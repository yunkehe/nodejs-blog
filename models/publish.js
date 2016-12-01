var mongodb = require('./db.js');
var markdown = require('markdown').markdown;

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

			var query = {
				author: params.author || '',
				title: params.title || '',
				'time.localString': params.localString || ''
			};

			// 查询一篇博客
			collection.findOne(query, function(err, blog){
				mongodb.close();
				if(err) return callback(err);
				blog.article = markdown.toHTML(blog.article);
				callback(null, blog);
			})
		})
	})
}

module.exports = Publish;