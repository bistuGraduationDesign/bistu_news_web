var mongodb = require('./db');


function comments(comments) {
	this.news = comments.news
	this.user = comments.user;
	this.content = comments.content;
};

module.exports = comments;

//存储评论信息
comments.prototype.save = function(callback) {
	var date = new Date(Date.now() + (8 * 60 * 60 * 1000));

	var comments = {
		news: this.news,
		user: this.user,
		time: date, //首次上传时间
		content: this.content
	};
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err); //错误，返回 err 信息
		}
		db.collection('comments', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err); //错误，返回 err 信息
			}
			collection.insert(comments, {
				safe: true
			}, function(err, comments) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, comments.ops[0]); //成功！err 为 null，并返回存储后的评论文档
			});
		});
	});
};

comments.get = function(name, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err); //错误，返回 err 信息
		}
		//读取 comments  集合
		db.collection('comments', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err); //错误，返回 err 信息
			}
			//查找评论名（name键）值为 name 一个文档
			collection.find({
				news: new RegExp(name)
			}, {
				limit: 12
			}).toArray(function(err, comments) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, comments);
			});
		});
	});
};

comments.remove = function(id, callback) {
	//打开数据库
	var BSON = require('bson');
	var obj_id = BSON.ObjectID.createFromHexString(id);
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('comments', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.remove({
				_id: obj_id
			}, {
				safe: true
			}, function(err, result) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});

		});
	});
}

comments.allComments = function(callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err); //错误，返回 err 信息
		}
		//读取 users 集合
		db.collection('comments', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err); //错误，返回 err 信息
			}
			//查找用户名（name键）值为 name 一个文档
			collection.find({}).sort({
				xinwen: -1
			}).toArray(function(err, users) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, users);
			});
		});
	});
};