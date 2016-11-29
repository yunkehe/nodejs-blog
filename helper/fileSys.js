var fs = require('fs');

var fileSys = {
	// 检查是否存在目录 不存在则创建目录
	checkSetDir : function(path, cb){
		if(typeof path !== 'string') return console.log('文件路径不是字符串');

		fs.readdir(path, function(err, files){
			if(err){
				console.log('目录不存在，将创建目录！');
				fs.mkdir(path, function(err2){
					if(err2){
						return console.error(err2);	
					}else{
						typeof cb === 'function' && cb();
					} 
				})
			}else{
				typeof cb === 'function' && cb();
			}
		})
	}
};

module.exports = fileSys;