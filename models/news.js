var mongodb = require('./db');

function News(news) {
  this.name = news.name;
  this.time = news.time;
  this.type = news.type;
  this.content = news.content;
};

module.exports = News;

//存储新闻信息
News.prototype.save = function(callback) {
  var date = new Date(Date.now() + (8 * 60 * 60 * 1000));

  var news = {
    name: this.name, //新闻名
    type: this.type, //新闻类型
    commentCount: 0, //新闻播放次数，用以统计热度
    time: this.time, //首次上传时间
    content: this.content,
    pass: 0 //0:待审核，1：通过
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

News.getByName = function(name, pass, callback) {
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
        pass: pass
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

News.getByName_more = function(name, pass, callback) {
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
        pass: pass
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

News.getByType = function(type, callback) {
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
        pass: 1
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

News.getByHot = function(callback) {
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
        pass: 1
      }, {
        limit: 13
      }).sort({
        times: -1
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

News.getByTime = function(callback) {
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
        pass: 1
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

//更新一篇文章及其相关信息
News.addTimes = function(name, callback) {
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
            times: news.times + 1
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

News.passOrNot = function(name, pass, callback) {
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
            pass: pass
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

News.delete = function(name, callback) {
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

        if (err) {
          mongodb.close();
          return callback(err);
        }
        callback(null);
      });

    });
  });
}
