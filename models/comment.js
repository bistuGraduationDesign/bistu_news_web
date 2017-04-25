var mongodb = require('./db');


function Comments(comment) {
	this.news = comment.news
	this.user = comment.user;
	this.time = comment.time;
	this.content = comment.content;
};

module.exports = Comments;

//存储评论信息
Comments.prototype.save = function(callback) {
	var date = new Date(Date.now() + (8 * 60 * 60 * 1000));

	var comments = {
		news: this.news,
		user: this.user,
		time: this.time, //首次上传时间
		content: this.content
	};
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err); //错误，返回 err 信息
		}
		//读取 comments 集合
		db.collection('comments', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err); //错误，返回 err 信息
			}
			//将评论数据插入 comments 集合
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

Comments.getByNewsName = function(name, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err); //错误，返回 err 信息
		}
		//读取 comments 集合
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

Comments.delete = function(id, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('news', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.remove({
        _id: id
      }, {
        safe: true
      }, function(err, result) {

        if (err) {
          mongodb.close();
          return callback(err);
        }
        callback(null);
      });

    });
  });
}