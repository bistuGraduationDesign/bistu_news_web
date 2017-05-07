var crypto = require("crypto"); //加密算法

var multipart = require("connect-multiparty");
var async = require("async");

var settings = require("../settings");
var User = require("../models/user");
var news = require("../models/news");
var comment = require("../models/comment");

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
      if (!user||req.body.authority.indexOf(user.authority.toString())==-1) {
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
        info: "sussess",
        user: user
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

  app.get("/search",function(req,res){
    let key=req.query.search;
    let user = req.session.user?req.session.user:{null:true};
    async.waterfall([
      function(callback) {
        news.getByName_more(key,1,function(err, n) {
          if (err) {
            callback("请重试", null);
          } else {
            callback(null, n);
          }
        });
      }
    ], function(err,news) {
      if (err) {
        var msg = {
          state: false,
          info: err
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        res.render("search-result", {
          news: news,
          user: user,
          typeList:["考研","工作","留学","校园活动","社会热点","爱豆"]
        });
      }
    });
  });

  app.get("/news",function(req,res){
    let newsname=req.query.name;
    let user = req.session.user?req.session.user:{null:true};
    async.waterfall([
      function(callback) {
        news.getByName(newsname,1,function(err, n) {
          if (err) {
            callback("请重试", null);
          } else {
            callback(null, n);
          }
        });
      },function(thenews,callback) {
        comment.getByNewsName(newsname,function(err, c) {
          if (err) {
            callback("请重试", null);
          } else {
            callback(null,thenews,c);
          }
        });
      }
    ], function(err,thenews,comments) {
      if (err) {
        var msg = {
          state: false,
          info: err
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        news.addTimes(newsname,function(err){
          if (err) {
          var msg = {
            state: false,
            info: err
          };
          return res.send(msg);
        }else{
          res.render("news", {
            news: thenews,
            comments: comments,
            user: user,
            typeList:["考研","工作","留学","校园活动","社会热点","爱豆"]
          });
        }
        });
      }
    });
  });

  /*
    admin
  */
  app.get("/admin-sign",function(req,res){
    res.render("admin-sign", {});
  });

  app.post("/getUser",function(req,res){
    let user=req.session.user;
    let authority=parseInt(req.body.authority);
    if(!user){
      var msg = {
        state: false,
        info: '没有权限'
      }; //注册失败返回主册页
      return res.send(msg);
    }else if (user.authority!=2&&user.authority!=1){
      var msg = {
        state: false,
        info: '没有权限'
      }; //注册失败返回主册页
      return res.send(msg);
    }else{
      User.getAll(authority,function(err,users){
        if(err){
          var msg = {
            state: false,
            info: err
          }; //注册失败返回主册页
          return res.send(msg);
        }
        var msg = {
          state: false,
          info: users
        }; //注册失败返回主册页
        return res.send(msg);
      });
    }
  });

  app.get("/upload", function(req, res) {
    let user=req.session.user;
    if(!user){
      res.redirect('/');
    }else if (user.authority!=1){
      res.redirect('/');
    }else(
      res.render("upload", {
        user:user
      })
    )
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

  app.post('/delete', function(req, res) {
    let user=req.session.user;
    let type=req.body.type;
    if(!user||user.authority==0){
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    }else{
      if(type=="news"){
        var dename=req.body.name;
        news.delete(dename,function(err){
          if(err){
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          }else{
            var msg = {
              state: true,
              info: "已删除该新闻！"
            };
            return res.send(msg);
          }
        })
      }else if (type=="comment") {
        var deid=req.body.id;
        console.log(deid);
        comment.delete(deid,function(err){
          if(err){
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          }else{
            var msg = {
              state: true,
              info: "已删除该评论！"
            };
            return res.send(msg);
          }
        })
      }else if (type=="user") {
        var dename=req.body.name;
        User.delete(dename,function(err){
          if(err){
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          }else{
            var msg = {
              state: true,
              info: "已删除！"
            };
            return res.send(msg);
          }
        });
      }
    }
  });

  app.post("/addAdmin",function(req,res){
    let user=req.session.user;
    if(!user||user.authority!=2){
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    }else{
      User.giveAdmin(req.body.name,function(err){
        if(err){
          var msg = {
            state: false,
            info: "error"
          };
          return res.send(msg);
        }else{
          var msg = {
            state: true,
            info: "已添加！"
          };
          return res.send(msg);
        }
      })
    }
  });

  app.get("/admin", function(req, res) {
    let user=req.session.user;
    if(!user){
      res.redirect('/');
    }else if (user.authority!=1){
      res.redirect('/');
    }else{
      async.waterfall([
        function(callback) {
          news.getByName_more('',1,function(err, n) {
            if (err) {
              callback("请重试", null);
            } else {
              callback(null, n);
            }
          });
        },
        function(thenews,callback){
          User.getAll(0,function(err, n) {
            if (err) {
              callback("请重试", null);
            } else {
              callback(null,thenews,n);
            }
          });
        },
        function(thenews,users,callback){
          comment.getAll(function(err, c) {
            if (err) {
              callback("请重试", null);
            } else {
              callback(null,thenews,users,c);
            }
          });
        }
      ], function(err,thenews,users,comments) {
        if (err) {
          var msg = {
            state: false,
            info: err
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
            res.render("admin", {
              user: user,
              news: thenews,
              users: users,
              comments: comments,
              typeList:["考研","工作","留学","校园活动","社会热点","爱豆"]
            });
        }
      });
    }
  });


  app.get("/examine", function(req, res) {
    let user=req.session.user;
    if(!user){
      res.redirect('/');
    }else if (user.authority!=2){
      res.redirect('/');
    }else{
      async.waterfall([
        function(callback) {
          news.getByName_more('',0,function(err, n) {
            if (err) {
              callback("请重试", null);
            } else {
              callback(null, n);
            }
          });
        }
      ], function(err,thenews) {
        if (err) {
          var msg = {
            state: false,
            info: err
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
            res.render("examine", {
              news: thenews,
              typeList:["考研","工作","留学","校园活动","社会热点","爱豆"]
            });
        }
      });
    }
  });

  app.post('/pass', function(req, res) {
    let user=req.session.user;
    if(!user||user.authority!=2){
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    }else{
      var dename=req.body.name;
      var pass=req.body.pass;
      if(pass==1){
        news.passOrNot(dename,1,function(err){
          if(err){
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          }else{
            var msg = {
              state: true,
              info: "已审核该新闻！"
            };
            return res.send(msg);
          }
        });
      }else{
        news.delete(dename,function(err){
          if(err){
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          }else{
            var msg = {
              state: true,
              info: "已删除该新闻！"
            };
            return res.send(msg);
          }
        });
      }
    }
  });

  app.post('/comment', function(req, res) {
    let user=req.session.user;
    if(!user){
      res.redirect('/sign');
    }else{
      //增加评论
      console.log(req.body);
      let newsname=req.body.name;
      let content=req.body.content;
      var newComment=new comment({
        news:newsname,
        user:user,
        content:content
      });
      newComment.save(function(err, comment) {
        if (err) {
          var msg = {
            state: false,
            info: err
          };
          return res.send(msg);
        }
        var msg = {
          state: true,
          info: '评论完成'
        };
        return res.send(msg);
      });
    }
  });

  // app.post('/getByName', checkStatus.checkLogin);
  // app.post("/getByName", function(req, res) {
  //   Music.getByName_more(req.body.name, function(err, musics) {
  //     if (err) {
  //       var msg = {
  //         state: false,
  //         info: err
  //       };
  //     } else {
  //       var msg = {
  //         state: true,
  //         info: musics
  //       };
  //       return res.send(msg);
  //     }
  //   });
  // });

  // app.get('/logout', checkStatus.checkLogin);
  app.get("/logout", function(req, res) {
    req.session.user = null;
    res.redirect("/");
  })
}
