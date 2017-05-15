var multipart = require("connect-multiparty");
var async = require("async");

var yonghu = require("../models/yonghu");
var xinwen = require("../models/xinwen");
var pinglun = require("../models/pinglun");

var shangchuan = require("./shangchuan");

module.exports = function(app) {

  //app.get('/', checkStatus.checkNotLogin);
  app.get("/", function(req, res) {
    var user = req.session.user ? req.session.user : {
      null: true
    };
    // an example using an object instead of an array
    async.waterfall([
      function(cb) {
        xinwen.redu(function(e, n) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, n);
          }
        });
      },
      function(paihang, cb) {
        xinwen.zuixin(function(e, n) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, paihang, n);
          }
        });
      }
    ], function(e, paihang, zuixin) {
      if (e) {
        var msg = {
          state: false,
          info: e
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        res.render("index", {
          Hotnews: paihang,
          Timenews: zuixin,
          user: user,
          typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
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
    var password = req.body.password
    //检查用户是否存在
    yonghu.mingcheng(req.body.name, function(e, yonghu) {
      if (!yonghu || req.body.authority.indexOf(yonghu.authority.toString()) == -1) {
        var msg = {
          state: false,
          info: "用户不存在"
        };
        return res.send(msg);
        //用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (yonghu.password != password) {
        var msg = {
          state: false,
          info: "密码错误"
        };
        return res.send(msg);
        //密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = yonghu;
      var msg = {
        state: true,
        info: "sussess",
        user: yonghu
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
    var password = req.body.password;

    var xin_youhu = new yonghu({
      name: req.body.name,
      password: password,
      email: req.body.email,
      authority: 0
    });

    //检查用户名是否已经存在
    yonghu.yonghuming(xin_youhu.name, function(e, user) {
      if (user) {
        var msg = {
          state: false,
          info: "用户已存在"
        };
        return res.send(msg);
      }
      //如果不存在则新增用户
      yonghu.save(function(e, user) {
        if (e) {
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

  app.get("/category", function(req, res) {
    let type = parseInt(req.query.type);
    if (type < 1 || type > 6) {
      res.render("404", {});
    } else {
      let user = req.session.user ? req.session.user : {
        null: true
      };
      async.waterfall([
        function(cb) {
          xinwen.leixing(type, function(e, n) {
            if (e) {
              cb("请重试", null);
            } else {
              cb(null, n);
            }
          });
        }
      ], function(e, leixing) {
        if (e) {
          var msg = {
            state: false,
            info: e
          }; //注册失败返回主册页
          return res.send(msg);
        } else {
          res.render("category", {
            Typenews: leixing,
            user: user,
            typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"],
            type: type
          });
        }
      });
    }
  });

  app.get("/search", function(req, res) {
    let key = req.query.search;
    let yonghu = req.session.user ? req.session.user : {
      null: true
    };
    async.waterfall([
      function(cb) {
        xinwen.xinwenmingcheng(key, 1, function(e, n) {
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
        res.render("search-result", {
          news: xinwen,
          user: yonghu,
          typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
        });
      }
    });
  });

  app.get("/news", function(req, res) {
    let newsname = req.query.name;
    let user = req.session.user ? req.session.user : {
      null: true
    };
    async.waterfall([
      function(cb) {
        xinwen.mingcheng(newsname, 1, function(e, n) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, n);
          }
        });
      },
      function(thenews, cb) {
        pinglun.xinwenmingcheng(newsname, function(e, c) {
          if (e) {
            cb("请重试", null);
          } else {
            cb(null, thenews, c);
          }
        });
      }
    ], function(e, thenews, comments) {
      if (e) {
        var msg = {
          state: false,
          info: e
        }; //注册失败返回主册页
        return res.send(msg);
      } else {
        xinwen.zengredu(newsname, function(e) {
          if (e) {
            var msg = {
              state: false,
              info: e
            };
            return res.send(msg);
          } else {
            res.render("news", {
              news: thenews,
              comments: comments,
              user: user,
              typeList: ["考研", "工作", "留学", "校园活动", "社会热点", "爱豆"]
            });
          }
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
    let user = req.session.user;
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
      yonghu.suoyou(authority, function(e, users) {
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
    let user = req.session.user;
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
        xinwen.mingcheng(req.body.name, 0, function(e, xinwen) {
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
        var xin_xinwen = new xinwen({
          name: req.body.name,
          time: req.body.date,
          content: req.body.content,
          type: type
        });
        //如果不存在则新增用户
        xin_xinwen.baocun(function(e, xinwen) {
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
    let user = req.session.user;
    if (!user) {
      res.redirect('/');
    } else if (user.authority != 1) {
      res.redirect('/');
    } else {
      xinwen.mingcheng(req.query.name, 1, function(e, n) {
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
        xinwen.shanchu(req.body.name, function(e, xinwen) {
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
        var xin_xinwen = new xinwen({
          name: req.body.name,
          time: req.body.date,
          content: req.body.content,
          type: type
        });
        xin_xinwen.baocun(function(e, xinwen) {
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
    let user = req.session.user;
    let type = req.body.type;
    if (!user || user.authority == 0) {
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    } else {
      if (type == "news") {
        xinwen.shanchu(req.body.name, function(e) {
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
        pinglun.shanchu(req.body.id, function(e) {
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
        yonghu.shanchu(req.body.name, function(e) {
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
    let user = req.session.user;
    if (!user || user.authority != 2) {
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    } else {
      yonghu.zengquanxian(req.body.name, function(e) {
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
    let user = req.session.user;
    if (!user) {
      res.redirect('/');
    } else if (user.authority != 1) {
      res.redirect('/');
    } else {
      async.waterfall([
        function(cb) {
          xinwen.mingcheng_1('', 1, function(e, n) {
            if (e) {
              cb("请重试", null);
            } else {
              cb(null, n);
            }
          });
        },
        function(xinwen, cb) {
          yonghu.quanbu(0, function(e, n) {
            if (e) {
              cb("请重试", null);
            } else {
              cb(null, xinwen, n);
            }
          });
        },
        function(xinwen, yonghu, cb) {
          pinglun.quanbu(function(e, c) {
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
    let user = req.session.user;
    if (!user) {
      res.redirect('/');
    } else if (user.authority != 2) {
      res.redirect('/');
    } else {
      async.waterfall([
        function(cb) {
          xinwen.mingcheng_1('', 0, function(e, n) {
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
    let user = req.session.user;
    if (!user || user.authority != 2) {
      var msg = {
        state: false,
        info: "没有权限!!!"
      };
      return res.send(msg);
    } else {
      var pass = req.body.pass;
      if (pass == 1) {
        xinwen.tongguo(req.body.name, 1, function(e) {
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
        xinwen.shanchu(req.body.name, function(e) {
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
    let user = req.session.user;
    if (!user) {
      res.redirect('/sign');
    } else {
      //增加评论
      let newsname = req.body.name;
      let content = req.body.content;
      var xin_pinglun = new pinglun({
        news: newsname,
        user: user,
        content: content
      });
      xin_pinglun.baocun(function(e, comment) {
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
    req.session.user = null;
    res.redirect("/");
  })
}