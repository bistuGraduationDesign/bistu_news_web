var express = require("express");
var bodyParser = require('body-parser')
var cookieParser = require("cookie-parser"); //登陆历史
var MongoStore = require("connect-mongo")(express);

var routes = require("./routes/index");//路由

var app = express();

app.set("port", 3000); //端口确认

app.set("views", "./views");//网页目录路径
app.set("view engine", "ejs");//ejs模版引擎
app.use(express.static("./public")); //网页静态文件路径

app.use(express.bodyParser());//req.body的解析 string-》object
// cookie
app.use(cookieParser());//cookie的解析
app.use(express.session({ //登陆时间，保存session会话
  secret: "zhangyu", //用于浏览器cookie解析
  key: "newsWeb",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 //cookie保存时间
  },
  store: new MongoStore({
    url: "mongodb://localhost/newsWeb" //数据库地址
  })
}));

routes(app);

var server = app.listen(app.get("port"), function() {//开始运行，监听端口
  console.log("张钰的新闻网站，请点击 http://%s:%s", server.address().address, server.address().port);
});