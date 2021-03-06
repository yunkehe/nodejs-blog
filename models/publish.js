var mongodb = require('./db.js');
var markdown = require('markdown').markdown;
var ObjectId = require('mongodb').ObjectId;
var setting = require('../settings.js');
var crypto = require('crypto');

// 获取创建时间
function getCreateTime(){
	var date = new Date();
	var time = {
		year: date.getFullYear(),
		month: date.getMonth()+1,
		day: date.getDate(),
		hour: date.getHours(),
		minute: date.getMinutes(),
		localString: date.toLocaleString()
	};

	return time;
}

// 发表数据
var queryFun = {
	// 获取简单信息
	getDocs: function(query, callback){
		mongodb.open(function(err, db){
			if(err) return callback(err);

			db.collection('blogs', function(err, collection){
				if(err){
					mongodb.close();
					return callback(err);	
				}
				// 匹配查询
				collection.find(query, {
					author: 1,
					time: 1,
					title: 1
				}).sort({
					time: -1
				}).toArray(function(err, data){
					// console.log('--------------------------------------------model get data', data)
					mongodb.close();
					if(err) return callback(err);
					callback(null, data);
				});
			});
		});
	},
};

function Publish(data) {
	this.author = data.author;
	this.title = data.title;
	this.article = data.article;
	this.tags = data.tags;
	this.head = data.head;
};

Publish.prototype.save = function(callback){
	var tags = this.tags;
	var blog = {
		author: this.author,
		title: this.title,
		article: this.article,
		comments: [],
		tags: this.tags,
		head: this.head,
		// 转载信息
		reprint_info: {}
	};

	// 存储时间
	// var date = new Date();
	blog.time = getCreateTime();
	// blog.time = {
	// 	year: date.getFullYear(),
	// 	month: date.getMonth()+1,
	// 	day: date.getDate(),
	// 	hour: date.getHours(),
	// 	minute: date.getMinutes(),
	// 	localString: date.toLocaleString()
	// };

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
// Publish.getAll = function(author, callback){
// 	// 打开数据库
// 	mongodb.open(function (err, db) {
// 		if(err) return callback(err);
// 		// 打开文档
// 		db.collection('blogs', function(err, collection){

// 			if(err){
// 				mongodb.close();
// 				return callback(err);
// 			}

// 			var query = {};
// 			if(author) query.author = author;

// 			collection.find(query)
// 			.sort({time: -1})
// 			.toArray(function(err, blogs){
// 				mongodb.close();
// 				if(err) return callback(err);

// 				blogs.forEach(function(blog){
// 					blog.article = markdown.toHTML(blog.article);
// 				});
				
// 				callback(null, blogs);
// 			});
// 		});
// 	});
// };

// 获取特定标签的所有博客
Publish.getBlogsByTags = function(tags, callback){
	var query = {tags: {$all: tags}};
	queryFun.getDocs(query, callback);
};

// 搜索
Publish.search = function(keyword, callback){
	var pattern = new RegExp('^.*'+keyword+'.*$', 'i'); 
	var query = {title: pattern};

	queryFun.getDocs(query, callback);
	
};

// 存档
Publish.getArchive = function(callback){
	var query = {};
	queryFun.getDocs({}, callback);

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
				if(err){
					return callback(err);	
				} 

				// 不增加pv统计

				// if(!params.notAddPv){
					// 每访问一次增加一次pv统计
					collection.update({_id: query._id}, {
						$inc: {pv: 1}
					}, function(err){
						mongodb.close();
						if(err) return callback(err);
					});
				// }

				blog.articleS = blog.article;
				blog.article = markdown.toHTML(blog.article);

				callback(null, blog);
			})
		})
	})
}

// 分页
Publish.getPagination = function(params, callback){
	var limit_page = setting.pagination.limit;
	var params = params || {};

	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			var query = {};

			if(params.author) query.author = params.author;
			if(params.tags) query.tags = params.tags;
			// count查询总记录条数
			collection.count(query, function(err, total){

				collection.find(query, {
					skip: (params.page-1)*limit_page,
					limit: limit_page
				}).sort({
					time: -1
				}).toArray(function(err, blogs){
					mongodb.close();
					if(err) return callback(err);
					
					blogs.forEach(function(v){
						v.articleS = v.article;
						v.article = markdown.toHTML(v.article);
					});
					// 传回文档详情和总页数
					callback(null, blogs, total);
				});
			});
		});
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
				article: params.article,
				tags: params.tags
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

			// 删除转载信息
			collection.findOne({
				_id: ObjectId(params.id)
			}, function(err, blog){
				if(err){
					mongodb.close();
					return callback(err);
				}

				if(blog.reprint_info.reprint_from){
					var reprint_from = blog.reprint_info.reprint_from;
				}

				if(reprint_from){
					collection.update({
						_id: ObjectId(reprint_from.id)
					}, {
						$pull: {
							'reprint_info.reprint_to': {
								author: blog.author,
								localString: reprint_from.localString
							}
						}
					}, function(err){
						if(err){
							mongodb.close();
							return callback(err);
						}
					})
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
	});
};


// 获取标签
Publish.getTags = function(callback){
	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			// 找出给定键的所有不同值
			collection.distinct('tags', function(err, tags){
				mongodb.close();
				if(err) return callback(err);
				callback(null, tags);
			});
		})
	})
}


// 转载一篇文章
// 转载来源信息
// Publish.reprint = function(reprint_from, reprint_to, callback){
// 	mongodb.open(function(err, db){
// 		if(err) return callback(err);

// 		db.collection('blogs', function(err, collection){
// 			if(err){
// 				mongodb.close();
// 				return callback(err);
// 			}

// 			collection.findOne({
// 				'_id': ObjectId(reprint_from.id)
// 			}, function(err, blog){
// 				if(err){
// 					mongodb.close();
// 					return callback(err);
// 				}

// 				var time = getCreateTime();
// 				reprint_from.localString = time.localString;

// 				var new_blog = {
// 					author: reprint_to.author,
// 					time: time,
// 					article: blog.article,
// 					title: blog.title.search(/[转载]/) > -1 ? blog.title : '[转载]'+blog.title,
// 					comments: [],
// 					pv: 0,
// 					reprint_info: {reprint_from: reprint_from}
// 				};

// 				// 存储转载的文档 并返回存储后的文档
// 				collection.insert(new_blog, {
// 					safe: true
// 				}, function(err, blogs){
// 					mongodb.close();
// 					if(err){
// 						return callback(err);	
// 					} 

// 					// console.log('转载文档存储成功!, blogs.ops[0])
// 					return callback(err, blogs.ops[0]);
// 				});

// 				// 更新被转载的原文档
// 				collection.update({
// 					_id: ObjectId(reprint_from.id)
// 				}, {
// 					$push: {
// 						"reprint_info.reprint_to": {
// 							"author": reprint_to.author,
// 							"title": new_blog.title,
// 							"localString": reprint_from.localString
// 						}
// 					}
// 				}, function(err){
// 					if(err){
// 						mongodb.close();
// 						return callback(err);
// 					}
// 					console.log('被转载文档更新成功!')
// 				});
// 			})
// 		});
// 	});
// }

Publish.reprint = function(params, callback){
	var user = params.user,
		reprint_from = {
			author: params.author,
			id: params.id},
		reprint_to = {
			author: user.name,
			head: user.head
		};

	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}

			collection.findOne({
				'_id': ObjectId(reprint_from.id)
			}, function(err, blog){
				if(err){
					mongodb.close();
					return callback(err);
				}

				var time = getCreateTime();
				reprint_from.localString = time.localString;

				var new_blog = {
					author: reprint_to.author,
					time: time,
					article: blog.article,
					title: blog.title.search(/[转载]/) > -1 ? blog.title : '[转载]'+blog.title,
					comments: [],
					pv: 0,
					reprint_info: {reprint_from: reprint_from}
				};

				// 存储转载的文档 并返回存储后的文档
				collection.insert(new_blog, {
					safe: true
				}, function(err, blogs){
					mongodb.close();
					if(err){
						return callback(err);	
					} 

					// console.log('转载文档存储成功!, blogs.ops[0])
					return callback(err, blogs.ops[0]);
				});

				// 更新被转载的原文档
				collection.update({
					_id: ObjectId(reprint_from.id)
				}, {
					$push: {
						"reprint_info.reprint_to": {
							"author": reprint_to.author,
							"title": new_blog.title,
							"localString": reprint_from.localString
						}
					}
				}, function(err){
					if(err){
						mongodb.close();
						return callback(err);
					}
					console.log('被转载文档更新成功!')
				});
			})
		});
	});

}

module.exports = Publish;