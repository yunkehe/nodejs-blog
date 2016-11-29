var multer = require('multer');
var fileSys = require('./fileSys.js');
var settings = require('../settings.js');
// 存储位置
// var upload = multer({ dest: 'uploads/' });

// 存储控制
var storage = multer.diskStorage({
	// 存储路径
	 destination: function (req, file, cb) {
	 	var username = req.session.user.name
	 	 // .ops[0].name;

	 	// 绝对路径
	 	var path = settings.uploadDir + username;

	 	// 检查文件夹是否存在
	 	fileSys.checkSetDir(path, function(){
			cb(null, path);
	 	})

	 },

	 // 文件名
	 filename: function (req, file, cb) {
		 cb(null, file.originalname)
	 }
})

var upload = multer({storage: storage});

module.exports = upload;