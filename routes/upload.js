var path = require("path");
var fs = require("fs");

exports.upload = function(req, callback) {
  //get filename
  var filename = req.body.name + "." + req.files.file_data.type.split("/")[1];
  //copy file to a public directory
  //__filename:/Users/Berger/code/node/bistu_news_web/routes/upload.js  
  var targetPath = path.dirname(__filename).substring(0, path.dirname(__filename).lastIndexOf("/")) + '/public/images/' + filename;
  //copy file
  // stream = fs.createWriteStream(path.join(upload_dir, name));
  const readStream = fs.createReadStream(req.files.file_data.path);//读文件流
  const writeStream = fs.createWriteStream(targetPath, {//写文件流
    flags: 'w',
    encoding: null,
    mode: 0666
  });
  readStream.pipe(writeStream);//读写文件流通道
  
  readStream.on('error', (error) => {
    // console.log('readStream error', error.message);
    callback(error.message);
  })
  writeStream.on('error', (error) => {
    // console.log('writeStream error', error.message);
    callback(error.message);
  })
  readStream.on('end', function() {
    callback(null)
  })
};

// console.log("file:" + __filename);
// console.log(path.dirname(__filename));
// console.log(path.dirname(__filename).substring(0, path.dirname(__filename).lastIndexOf("/")));