var mongodb = require('./db.js');
var markdown = require('markdown').markdown;
var ObjectId = require('mongodb').ObjectId;

function Comment(params){
	var params = params || {};
	this._id = params.id ? ObjectId(params.id) : '';
	// 评论内容
	this.comment = params.comment || {};
}

Comment.prototype.save = function(callback){
	var comment = this.comment;
	var query = {_id: this._id};

	comment.localString = (new Date()).toLocaleString();

	mongodb.open(function(err, db){
		if(err) return callback(err);

		db.collection('blogs', function(err, collection){
			if(err){
				mongodb.close();
				callback(err);
			}

			collection.update(query, {$push: {comments: comment}}, function(err){
				mongodb.close();
				if(err) return callback(err);
				callback(err);
			});
		});
	});
};

module.exports = Comment;

