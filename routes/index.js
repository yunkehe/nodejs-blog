var routeFun = require('./routeFun');
var privilege = require('./privilege.js');
var publish = require('../models/publish.js');

var router = function(app){

	/* GET home page. */
	app.get('/', routeFun.index);

	/* 路由 */
	routeFun.names.forEach(function(route){
		var routeName = route[0].toLowerCase()+route.slice(1);
		
		app.get('/'+routeName, privilege[privilege.route[routeName]]);
		app.get('/'+routeName, routeFun['get'+route]);

		app.post('/'+routeName, privilege[privilege.route[routeName]]);
		app.post('/'+routeName, routeFun['post'+route]);

	});

	// 跳转到我的博客
	app.get('/u/:author', routeFun.user);
	app.get('/u/:author/:title/:localString', routeFun.blog);

	// 编辑
	app.get('/edit/:author/:id', routeFun.edit);
	app.get('/delete/:author/:id', routeFun.delete);

};

module.exports = router;
