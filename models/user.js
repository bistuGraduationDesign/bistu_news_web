var mongodb = require('./db');

function User(user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
  var date = new Date(Date.now() + (8 * 60 * 60 * 1000));

  var user = {
    name: this.name, //用户名
    email: this.email, //用户邮箱
    password: this.password, //密码，md5加密后
    time: date, //注册时间
    authority: 0 //0:普通用户、1:普通管理员、2:超级管理员
  };
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //将用户数据插入 users 集合
      collection.insert(user, {
        safe: true
      }, function(err, user) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null, user.ops[0]); //成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

User.get = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function(err, user) {
        mongodb.close();
        if (err) {
          return callback(err); //失败！返回 err
        }
        callback(null, user); //成功！返回查询的用户信息
      });
    });
  });
};

User.getAll = function(authority, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err); //错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.find({
        authority: authority
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

User.delete = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('users', function(err, collection) {
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

User.giveAdmin = function(name, callback) {
  //打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('users', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.findOne({
        name: name
      }, function(err, users) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        //更新内容
        collection.update({
          name: name
        }, {
          $set: {
            authority: 1//0:普通用户、1:普通管理员、2:超级管理员
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
