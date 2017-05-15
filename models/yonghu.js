var mongodb = require('./db');

function yonghu(yonghu) {
  this.name = yonghu.name;
  this.email = yonghu.email;
  this.key = yonghu.key;
};

module.exports = yonghu;

//存储用户信息
yonghu.prototype.baocun = function(callback) {
  var date = new Date(Date.now() + (8 * 60 * 60 * 1000));

  var yonghu = {
    name: this.name, //用户名
    email: this.email, //用户邮箱
    key: this.key, //密码
    time: date, //注册时间
    quanxian: 0 //0:普通用户、1:普通管理员、2:超级管理员
  };
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 yonghu 集合
    db.collection('yonghu', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //将用户数据插入 yonghu 集合
      collection.insert(yonghu, {
        safe: true
      }, function(err, yonghu) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, yonghu.ops[0]); //成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

yonghu.xingming = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 yonghu 集合
    db.collection('yonghu', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function(err, yonghu) {
        mongodb.close();
        if (err) {
          return callback(err); //失败！返回 err
        }
        callback(null, yonghu); //成功！返回查询的用户信息
      });
    });
  });
};

yonghu.quanbu = function(quanxian, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 yonghu 集合
    db.collection('yonghu', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.find({
        quanxian: quanxian
      }).toArray(function(err, yonghu) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, yonghu);
      });
    });
  });
};

yonghu.shanchu = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('yonghu', function(err, collection) {
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

yonghu.zengquanxian = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('yonghu', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.findOne({
        name: name
      }, function(err, yonghu) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //更新内容
        collection.update({
          name: name
        }, {
          $set: {
            quanxian: 1 //0:普通用户、1:普通管理员、2:超级管理员
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