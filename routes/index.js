var crypto = require("crypto"); //加密算法

var multipart = require("connect-multiparty");
var async = require("async");

var settings = require("../settings");
var User = require("../models/user");
var news = require("../models/news");
var comments = require("../models/comment");

var upload = require("./upload");

module.exports = function(app) {

  //app.get('/', checkStatus.checkNotLogin);
  app.get("/", function(req, res) {
    var user = req.session.user?req.session.user:{null:true};
    // an example using an object instead of an array
    async.waterfall([
      function(callback) {
        news.getByHot(function(err, n) {
          if (err) {
            callback("请重试", null);
          } else {
            callback(null, n);
          }
        });
      },
      function( Hotnews, callback) {
        news.getByTime(function(err, n) {
          if (err) {
            callback("请重试", null);
          } else {
            callback(null, Hotnews, n);
          }
        });
      }
    ], function(err, Hotnews, Timenews) {
      if (err) {
        var msg = {
          state: false,
          info: err
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        res.render("index", {
          Hotnews: Hotnews,
          Timenews: Timenews,
          user: user,
          typeList:["考研","工作","留学","校园活动","社会热点","爱豆"]
        });
      }
    });
  });

  // app.get('/sign', checkStatus.checkNotLogin);
  app.get("/sign", function(req, res) {
    res.render("sign", {});
  });

  // app.post('/signin', checkStatus.checkNotLogin);
  app.post('/signin', function(req, res) {
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function(err, user) {
      if (!user) {
        var msg = {
          state: false,
          info: "用户不存在"
        };
        return res.send(msg);
        //用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        var msg = {
          state: false,
          info: "密码错误"
        };
        return res.send(msg);
        //密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      var msg = {
        state: true,
        info: "sussess"
      };
      return res.send(msg);
    });
  });

  // app.post('/reg', checkStatus.checkNotLogin);
  app.post('/reg', function(req, res) {
    var password = req.body.password;
    var password_re = req.body['passwordrepeat'];
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      var msg = {
        state: false,
        info: "两次输入的密码是不一致"
      };
      return res.send(msg);
    }
    // 生成密码的 md5 值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');

    var newUser = new User({
      name: req.body.name,
      password: password,
      email: req.body.email,
      authority: 0
    });

    //检查用户名是否已经存在
    User.get(newUser.name, function(err, user) {
      if (user) {
        var msg = {
          state: false,
          info: "用户已存在"
        };
        return res.send(msg);
      }
      //如果不存在则新增用户
      newUser.save(function(err, user) {
        if (err) {
          var msg = {
            state: false,
            info: "请重试"
          }; //注册失败返回主册页
          return res.send(msg);
        }
        req.session.user = user; //用户信息存入 session
        var msg = {
          state: true,
          info: "sussess"
        };
        return res.send(msg); //注册成功后返回主页
      });
    });
  });

  app.get("/category",function(req, res){
    let type=parseInt(req.query.type);
    if(type<1||type>6){
      res.render("404",{});
    }else{
      let user = req.session.user?req.session.user:{null:true};
      async.waterfall([
        function(callback) {
          news.getByType(type,function(err, n) {
            if (err) {
              callback("请重试", null);
            } else {
              callback(null, n);
            }
          });
        }
      ], function(err,Typenews) {
        if (err) {
          var msg = {
            state: false,
            info: err
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
          res.render("category", {
            Typenews: Typenews,
            user: user,
            typeList:["考研","工作","留学","校园活动","社会热点","爱豆"],
            type:type
          });
        }
      });
    }
  });

  // app.get('/upload', checkStatus.checkLogin);
  app.get("/upload", function(req, res) {
    let user=req.session.user;
    if(!user){
      res.redirect('/');
    }
    if(user.authority!=1){
      res.redirect('/');
    }
    res.render("upload", {});
  });

  // app.post('/upload-file', checkStatus.checkLogin);
  app.post("/upload-file", multipart(), function(req, res) {
    console.log(req.files.file_data.type);
    async.waterfall([
      function(callback) {
        news.getByName(req.body.name,0,function(err, music) {
          if (music) {
            callback("歌曲已存在");
          } else if (err) {
            callback("请重试");
          } else {
            callback(null);
          }
        })
      },
      function(callback) {
        var fileData = req.files.file_data;
          upload.select(req, 0, function(err) {
            if (err) {
              callback(err)
            } else {
              callback(null)
            }
          });
      },
      function(callback) {
        var type = 3;
        //摇滚1 民谣2 流行3
        switch (req.body.type) {
          case "考研":
            type = 1;
            break;
          case "工作":
            type = 2;
            break;
          case "留学":
            type = 3;
            break;
          case "校园活动":
            type = 4;
            break;
          case "社会热点":
            type = 5;
            break;
          case "爱豆":
            type = 6;
            break;
        }
        //音乐名、作者、类型、次数
        var newNews = new news({
          name: req.body.name,
          time: req.body.date,
          content: req.body.content,
          type: type
        });
        //如果不存在则新增用户
        newNews.save(function(err, music) {
          if (err) {
            callback("请重试");
          }
          callback(null); //成功后返回
        });
      }
    ], function(err, result) {
      if (err) {
        var msg = {
          error: err
        }; //注册失败返回主册页
      } else {
        var msg = {
          state: true,
          info: "sussess"
        };
      }
      return res.send(msg);
    });
  });

  // app.post('/play', checkStatus.checkLogin);
  app.post("/play", function(req, res) {

    async.waterfall([
      function(callback) {
        Music.addTimes(req.body.name, function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        });
      },
      function(callback) {
        User.changeType(req.session.user, req.body.type, function(err) {
          if (err) {
            callback(err);
          } else {
            callback(null);
          }
        })
      }
    ], function(err, result) {
      if (err) {
        var msg = {
          state: false,
          info: err
        };
      } else {
        var msg = {
          state: true,
          info: "sussess"
        };
      }
      return res.send(msg);
    });

  });

  // app.post('/getByName', checkStatus.checkLogin);
  app.post("/getByName", function(req, res) {
    Music.getByName_more(req.body.name, function(err, musics) {
      if (err) {
        var msg = {
          state: false,
          info: err
        };
      } else {
        var msg = {
          state: true,
          info: musics
        };
        return res.send(msg);
      }
    });
  });

  // app.get('/logout', checkStatus.checkLogin);
  app.get("/logout", function(req, res) {
    req.session.user = null;
    res.redirect("/");
  })
}
