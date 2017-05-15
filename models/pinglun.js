var mongodb = require('./db');


function pinglun(pinglun) {
	this.news = pinglun.news
	this.user = pinglun.user;
	this.content = pinglun.content;
};

module.exports = pinglun;

//存储评论信息
pinglun.prototype.baocun = function(callback) {
	var date = new Date(Date.now() + (8 * 60 * 60 * 1000));

	var pinglun = {
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
		db.collection('pinglun', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err); //错误，返回 err 信息
			}
			collection.insert(pinglun, {
				safe: true
			}, function(err, pinglun) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, pinglun.ops[0]); //成功！err 为 null，并返回存储后的评论文档
			});
		});
	});
};

pinglun.xinwenmingcheng = function(name, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err); //错误，返回 err 信息
		}
		//读取 pinglun  集合
		db.collection('pinglun', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err); //错误，返回 err 信息
			}
			//查找评论名（name键）值为 name 一个文档
			collection.find({
				xinwen: new RegExp(name)
			}, {
				limit: 12
			}).toArray(function(err, pinglun) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, pinglun);
			});
		});
	});
};

pinglun.shanchu = function(id, callback) {
	//打开数据库
	var BSON = require('bson');
	var obj_id = BSON.ObjectID.createFromHexString(id);
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('pinglun', function(err, collection) {
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

pinglun.quanbu = function(callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err); //错误，返回 err 信息
		}
		//读取 users 集合
		db.collection('pinglun', function(err, collection) {
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