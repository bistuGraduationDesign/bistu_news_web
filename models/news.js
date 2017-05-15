var mongodb = require('./db');

function news(news) {
  this.name = news.name;
  this.time = news.time;
  this.type = news.type;
  this.content = news.content;
};

module.exports = news;

//存储新闻信息
news.prototype.save = function(callback) {
  let timeStr = this.time;
  let timeArr = new Array(3);
  timeArr = timeStr.split('-');
  var time = new Date(timeArr[0], timeArr[1] - 1, timeArr[2]);
  console.log(time);
  var news = {
    name: this.name, //新闻名
    type: this.type, //新闻类型
    count: 0, //新闻播放次数，用以统计热度
    time: time, //首次上传时间
    content: this.content,
    tongguo: 0 //0:待审核，1：通过
  };
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('news', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //将新闻数据插入 news 集合
      collection.insert(news, {
        safe: true
      }, function(err, news) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, news.ops[0]); //成功！err 为 null，并返回存储后的新闻文档
      });
    });
  });
};

news.accurate = function(name, tongguo, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('news', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找新闻名（name键）值为 name 一个文档
      collection.findOne({
        name: name,
        tongguo: tongguo
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

news.hazy = function(name, tongguo, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('news', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找新闻名（name键）值为 name 一个文档
      collection.find({
        name: new RegExp(name),
        tongguo: tongguo
      }, {
        limit: 12
      }).toArray(function(err, news) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, news);
      });
    });
  });
};

news.gainType = function(type, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    db.collection('news', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //返回只包含 name、time、title 属性的文档组成的存档数组
      collection.find({
        type: type,
        tongguo: 1
      }, {
        limit: 12
      }).toArray(function(err, news) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, news);
      });
    });
  });
};

news.lastest = function(callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 news 集合
    db.collection('news', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      collection.find({
        tongguo: 1
      }, {
        limit: 4
      }).sort({
        time: -1
      }).toArray(function(err, news) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, news);
      });
    });
  });
};

news.remove = function(name, callback) {
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
        name: name
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