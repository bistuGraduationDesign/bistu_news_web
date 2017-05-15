var path = require("path");
var fs = require("fs");

exports.shangchuan = function(req, callback) {
  //get filename
  var filename = req.body.name + "." + req.files.file_data.type.split("/")[1];
  //copy file to a public directory
  var targetPath = path.dirname(__filename).substring(0, path.dirname(__filename).lastIndexOf("/")) + '/public/updata/images/' + filename;
  //copy file
  // stream = fs.createWriteStream(path.join(upload_dir, name));
  const readStream = fs.createReadStream(req.files.file_data.path);
  const writeStream = fs.createWriteStream(targetPath, {
    flags: 'w',
    encoding: null,
    mode: 0666
  });
  readStream.pipe(writeStream);
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

