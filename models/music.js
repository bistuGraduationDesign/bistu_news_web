var mongodb = require('./db');
var comment = require('./comment');

function News(news) {
  this.name = news.name;
  this.time = news.time;
  this.type = news.type;
  this.comments=news.comments;
};

module.exports = News;

//存储用户信息
News.prototype.save = function(callback) {
  var date = new Date(Date.now() + (8 * 60 * 60 * 1000));

  var news = {
    name: this.name, //音乐名
    type: this.type, //音乐类型
    commentCount: 0, //音乐播放次数，用以统计热度
    time: this.time, //首次上传时间
    comments:this.comments
  };
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 musics 集合
    db.collection('musics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //将用户数据插入 musics 集合
      collection.insert(news, {
        safe: true
      }, function(err, news) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, news.ops[0]); //成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

Music.getByName = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 musics 集合
    db.collection('musics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function(error, news) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, news);
      });
    });

  });
};

Music.getByName_more = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 musics 集合
    db.collection('musics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.find({
        name: new RegExp(name)
      }, {
        limit: 12
      }).toArray(function(err, musics) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, musics);
      });
    });
  });
};

Music.getByType = function(type, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    db.collection('musics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({
        "type": type
      }, {
        limit: 12
      }).toArray(function(err, musics) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, musics);
      });
    });
  });
};

Music.getByHot = function(callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 musics 集合
    db.collection('musics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      collection.find({}, {
        limit: 12
      }).sort({
        times: -1
      }).toArray(function(err, musics) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, musics);
      });
    });
  });
};

Music.getByTime = function(callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 musics 集合
    db.collection('musics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      collection.find({}, {
        limit: 12
      }).sort({
        time: -1
      }).toArray(function(err, musics) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, musics);
      });
    });
  });
};

//更新一篇文章及其相关信息
Music.addTimes = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('musics', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.findOne({
        name: name
      }, function(err, news) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //更新文章内容
        collection.update({
          name: name
        }, {
          $set: {
            times: news.times+1
          }
        }, function(err) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(null);
        });
      });
    });
  });
}
