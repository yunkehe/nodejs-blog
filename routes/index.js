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
	app.get('/u/:author/:id', routeFun.blog);

	// 留言
	app.post('/u/:author/:id', routeFun.comment);

	// 编辑
	app.get('/edit/:author/:id', routeFun.getEdit);
	app.post('/edit/:author/:id', routeFun.postEdit);

	// 删除
	app.get('/remove/:author/:id', routeFun.remove);

	// 存档
	app.get('/archive', routeFun.archive);

	// 标签页
	app.get('/tags', routeFun.tags);

	// 包含该标签的所有博客
	app.get('/tags/:tag', routeFun.tagBlogs)

};

module.exports = router;
