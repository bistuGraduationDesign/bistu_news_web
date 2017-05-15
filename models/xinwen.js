var mongodb = require('./db');

function xinwen(xinwen) {
  this.name = xinwen.name;
  this.time = xinwen.time;
  this.type = xinwen.type;
  this.content = xinwen.content;
};

module.exports = xinwen;

//存储新闻信息
xinwen.prototype.baocun = function(callback) {
  let timeStr = this.time;
  let timeArr = new Array(3);
  timeArr = timeStr.split('-');
  var time = new Date(timeArr[0], timeArr[1] - 1, timeArr[2]);
  console.log(time);
  var xinwen = {
    name: this.name, //新闻名
    type: this.type, //新闻类型
    Count: 0, //新闻播放次数，用以统计热度
    time: time, //首次上传时间
    content: this.content,
    pass: 0 //0:待审核，1：通过
  };
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 xinwen 集合
    db.collection('xinwen', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //将新闻数据插入 xinwen 集合
      collection.insert(xinwen, {
        safe: true
      }, function(err, xinwen) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, xinwen.ops[0]); //成功！err 为 null，并返回存储后的新闻文档
      });
    });
  });
};

xinwen.mingcheng = function(name, pass, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 xinwen 集合
    db.collection('xinwen', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找新闻名（name键）值为 name 一个文档
      collection.findOne({
        name: name,
        pass: pass
      }, function(error, xinwen) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, xinwen);
      });
    });

  });
};

xinwen.mingcheng_1 = function(name, pass, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 xinwen 集合
    db.collection('xinwen', function(err, collection) {
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
      }).toArray(function(err, xinwen) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, xinwen);
      });
    });
  });
};

xinwen.leixing = function(type, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    db.collection('xinwen', function(err, collection) {
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
      }).toArray(function(err, xinwen) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, xinwen);
      });
    });
  });
};

xinwen.redu = function(callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 xinwen 集合
    db.collection('xinwen', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      collection.find({
        pass: 1
      }, {
        limit: 13
      }).sort({
        Count: -1
      }).toArray(function(err, xinwen) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, xinwen);
      });
    });
  });
};

xinwen.zuixin = function(callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 xinwen 集合
    db.collection('xinwen', function(err, collection) {
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
      }).toArray(function(err, xinwen) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, xinwen);
      });
    });
  });
};

//更新一篇文章及其相关信息
xinwen.zengredu = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('xinwen', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.findOne({
        name: name
      }, function(err, xinwen) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //更新文章内容
        collection.update({
          name: name
        }, {
          $set: {
            commentCount: xinwen.commentCount + 1
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

xinwen.tongguo = function(name, pass, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('xinwen', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.findOne({
        name: name
      }, function(err, xinwen) {
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

xinwen.shanchu = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('xinwen', function(err, collection) {
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