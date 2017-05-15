var crypto = require("crypto"); //加密
var multipart = require("connect-multiparty"); //并行上传
var async = require("async"); //控制流

var users = require("../models/users"); //用户
var news = require("../models/news"); //新闻
var comments = require("../models/comments"); //评论

var shangchuan = require("./shangchuan"); //上传

module.exports = function(app) {
  //首页
  app.get("/", function(req, res) {
    //用户在会话中，则用户为会话中用户；用户不在会话中，用户为空
    var yonghu = req.session.yonghu ? req.session.yonghu : {
      null: true
    };

    news.lastest(function(e, n) {
      if (e) { //错了
        var msg = {
          state: false, //状态
          info: "请重试" //信息
        }; //注册失败返回主册页
        return res.send(msg); //返回信息
      } else { //对
        res.render("index", {
          Timenews: n,
          yonghu: yonghu,
          typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
        });
      }
    });
  });

  //登陆
  app.get("/sign", function(req, res) {
    res.render("sign", {});
  });
  //登陆请求
  app.post('/signin', function(req, res) {
    //检查用户是否存在
    var hmac = crypto.createHmac('sha1', "zhangyu");
    var key = hmac.update(req.body.password).digest('hex');

    users.search(req.body.name, function(e, yonghu) {
      if (!yonghu) {
        var msg = {
          state: false,
          info: "用户不存在"
        };
        return res.send(msg);
        //用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (yonghu.key != key) {
        var msg = {
          state: false,
          info: "密码错误"
        };
        return res.send(msg);
        //密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.yonghu = yonghu;
      var msg = {
        state: true,
        info: "sussess"
      };
      return res.send(msg);
    });
  });

  // 注册
  app.post('/reg', function(req, res) {
    //检验用户两次输入的密码是否一致
    if (req.body['passwordrepeat'] != req.body.password) {
      var msg = {
        state: false,
        info: "两次输入的密码是不一致"
      };
      return res.send(msg);
    }

    var hmac = crypto.createHmac('sha1', 'zhangyu');
    var key = hmac.update(req.body.password).digest('hex');

    var xin_yonghu = new users({
      name: req.body.name,
      key: key,
      email: req.body.email,
      quanxian: 0
    });

    //检查用户名是否已经存在
    users.search(xin_yonghu.name, function(e, yonghu) {
      if (yonghu) {
        var msg = {
          state: false,
          info: "用户已存在"
        };
        return res.send(msg);
      }
      //如果不存在则新增用户
      xin_youhu.save(function(e, yonghu) {
        if (e) {
          var msg = {
            state: false,
            info: "请重试"
          }; //注册失败返回主册页
          return res.send(msg);
        }
        req.session.yonghu = yonghu; //用户信息存入 session
        var msg = {
          state: true,
          info: "sussess"
        };
        return res.send(msg); //注册成功后返回主页
      });
    });
  });

  app.get("/category", function(req, res) {
    var type = parseInt(req.query.type); //接收类型参数
    if (type < 1 || type > 6) {
      res.render("404", {});
    } else {
      var yonghu = req.session.yonghu ? req.session.yonghu : {
        null: true
      };
      news.gainType(type, function(e, xinwen) {
        if (e) {
          var msg = {
            state: false,
            info: "请重试"
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
          res.render("category", {
            xinwen: xinwen,
            yonghu: yonghu,
            typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"],
            type: type
          });
        }
      });
    }
  });

  app.get("/search", function(req, res) {
    var yonghu = req.session.yonghu ? req.session.yonghu : {
      null: true
    };

    news.hazy(req.query.search, 1, function(e, xinwen) {
      if (e) {
        var msg = {
          state: false,
          info: "请重试"
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        console.log(xinwen);
        res.render("search-result", {
          xinwen: xinwen,
          yonghu: yonghu,
          typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
        });
      }
    });
  });

  app.get("/news", function(req, res) {
    var yonghu = req.session.yonghu ? req.session.yonghu : {
      null: true
    };
    async.waterfall([
      function(cb) {
        news.accurate(req.query.name, 1, function(e, x) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, x);
          }
        });
      },
      function(x, cb) {
        comments.get(req.query.name, function(e, p) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, x, p);
          }
        });
      }
    ], function(e, x, p) {
      if (e) {
        var msg = {
          state: false,
          info: e
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        console.log(p);
        res.render("news", {
          xinwen: x,
          pinglun: p,
          yonghu: yonghu,
          typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
        });
      }
    });
  });

  /*
    admin
  */
  app.get("/admin-sign", function(req, res) {
    res.render("admin-sign", {});
  });

  app.post("/getUser", function(req, res) {
    let user = req.session.yonghu;
    let authority = parseInt(req.body.authority);
    if (!user) {
      var msg = {
        state: false,
        info: '没有权限'
      }; //注册失败返回主册页
      return res.send(msg);
    } else if (user.authority != 2 && user.authority != 1) {
      var msg = {
        state: false,
        info: '没有权限'
      }; //注册失败返回主册页
      return res.send(msg);
    } else {
      user.allusers(authority, function(e, users) {
        if (e) {
          var msg = {
            state: false,
            info: e
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
    let user = req.session.yonghu;
    if (!user) {
      res.redirect('/');
    } else if (user.authority != 1) {
      res.redirect('/');
    } else {
      res.render("upload", {
        user: user
      })
    }
  });

  // app.post('/upload-file', checkStatus.checkLogin);
  app.post("/upload-file", multipart(), function(req, res) {
    async.waterfall([
      function(cb) {
        news.accurate(req.body.name, 0, function(e, xinwen) {
          if (xinwen) {
            cb("歌曲已存在");
          } else if (e) {
            cb("请重试");
          } else {
            cb(null);
          }
        })
      },
      function(cb) {
        var fileData = req.files.file_data;
        shangchuan.shangchuan(req, function(e) {
          if (e) {
            cb(e)
          } else {
            cb(null)
          }
        });
      },
      function(cb) {
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
        var xin_xinwen = new news({
          name: req.body.name,
          time: req.body.date,
          content: req.body.content,
          type: type
        });
        //如果不存在则新增用户
        xin_xinwen.save(function(e, xinwen) {
          if (e) {
            cb("请重试");
          }
          cb(null); //成功后返回
        });
      }
    ], function(e, result) {
      if (e) {
        var msg = {
          error: e
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

  app.get("/change", function(req, res) {
    let user = req.session.yonghu;
    if (!user) {
      res.redirect('/');
    } else if (user.authority != 1) {
      res.redirect('/');
    } else {
      news.accurate(req.query.name, 1, function(e, n) {
        if (e) {
          var msg = {
            state: false,
            info: e
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
          res.render("change", {
            news: n
          });
        }
      });
    }
  });

  app.post("/change", function(req, res) {
    async.waterfall([
      function(cb) {
        news.remove(req.body.name, function(e, xinwen) {
          if (e) {
            cb("请重试");
          } else {
            cb(null);
          }
        })
      },
      function(cb) {
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
        var xin_xinwen = new news({
          name: req.body.name,
          time: req.body.date,
          content: req.body.content,
          type: type
        });
        xin_xinwen.save(function(e, xinwen) {
          if (e) {
            cb("请重试");
          }
          cb(null); //成功后返回
        });
      }
    ], function(e, result) {
      if (e) {
        var msg = {
          error: e
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
    let user = req.session.yonghu;
    let type = req.body.type;
    if (!user || user.authority == 0) {
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    } else {
      if (type == "news") {
        news.removwe(req.body.name, function(e) {
          if (e) {
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          } else {
            var msg = {
              state: true,
              info: "已删除该新闻！"
            };
            return res.send(msg);
          }
        })
      } else if (type == "comment") {
        comments.remove(req.body.id, function(e) {
          if (e) {
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          } else {
            var msg = {
              state: true,
              info: "已删除该评论！"
            };
            return res.send(msg);
          }
        })
      } else if (type == "user") {
        users.remove(req.body.name, function(e) {
          if (e) {
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          } else {
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

  app.post("/addAdmin", function(req, res) {
    let user = req.session.yonghu;
    if (!user || user.authority != 2) {
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    } else {
      user.promote(req.body.name, function(e) {
        if (e) {
          var msg = {
            state: false,
            info: "error"
          };
          return res.send(msg);
        } else {
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
    let user = req.session.yonghu;
    if (!user) {
      res.redirect('/');
    } else if (user.authority != 1) {
      res.redirect('/');
    } else {
      async.waterfall([
        function(cb) {
          news.hazy('', 1, function(e, n) {
            if (e) {
              cb("请重试", null);
            } else {
              cb(null, n);
            }
          });
        },
        function(xinwen, cb) {
          user.allusers(0, function(e, n) {
            if (e) {
              cb("请重试", null);
            } else {
              cb(null, xinwen, n);
            }
          });
        },
        function(xinwen, yonghu, cb) {
          comments.allComments(function(e, c) {
            if (e) {
              cb("请重试", null);
            } else {
              cb(null, xinwen, yonghu, c);
            }
          });
        }
      ], function(e, xinwen, yonghu, pinglun) {
        if (e) {
          var msg = {
            state: false,
            info: e
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
          res.render("admin", {
            user: user,
            news: xinwen,
            users: yonghu,
            comments: pinglun,
            typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
          });
        }
      });
    }
  });


  app.get("/examine", function(req, res) {
    let user = req.session.yonghu;
    if (!user) {
      res.redirect('/');
    } else if (user.authority != 2) {
      res.redirect('/');
    } else {
      async.waterfall([
        function(cb) {
          news.hazy('', 0, function(e, n) {
            if (e) {
              cb("请重试", null);
            } else {
              cb(null, n);
            }
          });
        }
      ], function(e, xinwen) {
        if (e) {
          var msg = {
            state: false,
            info: e
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
          res.render("examine", {
            news: xinwen,
            typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
          });
        }
      });
    }
  });

  app.post('/pass', function(req, res) {
    let user = req.session.yonghu;
    if (!user || user.authority != 2) {
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    } else {
      var pass = req.body.pass;
      if (pass == 1) {
        news.accurate(req.body.name, 1, function(e) {
          if (e) {
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          } else {
            var msg = {
              state: true,
              info: "已审核该新闻！"
            };
            return res.send(msg);
          }
        });
      } else {
        news.remove(req.body.name, function(e) {
          if (e) {
            var msg = {
              state: false,
              info: "error"
            };
            return res.send(msg);
          } else {
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
    let user = req.session.yonghu;
    if (!user) {
      res.redirect('/sign');
    } else {
      //增加评论
      let newsname = req.body.name;
      let content = req.body.content;
      var xin_pinglun = new comments({
        news: newsname,
        user: user,
        content: content
      });
      xin_pinglun.save(function(e, pinglun) {
        if (e) {
          var msg = {
            state: false,
            info: e
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

  app.get("/logout", function(req, res) {
    req.session.yonghu = null;
    res.redirect("/");
  })
}