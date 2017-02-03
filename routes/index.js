var routeFun = require('./routeFun');
var privilege = require('./privilege.js');
var publish = require('../models/publish.js');

var router = function(app){

	/* GET home page. */
	app.get('/', routeFun.index);

	/* 路由 */
	routeFun.names.forEach(function(route){
		// route 第一个字母大写 转换为小写
		var routeName = route[0].toLowerCase()+route.slice(1);
		// 访问权限权限
		privilege.route[routeName] && app.get('/'+routeName, privilege[privilege.route[routeName]]);
		routeFun['get'+route] && app.get('/'+routeName, routeFun['get'+route]);

		privilege.route[routeName] && app.post('/'+routeName, privilege[privilege.route[routeName]]);
		routeFun['post'+route] && app.post('/'+routeName, routeFun['post'+route]);

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

	// 包含该标签的所有博客
	app.get('/tags/:tag', routeFun.tagBlogs);

	// 转载
	app.get('/reprint/:author/:id', privilege.checkLogin);
	app.get('/reprint/:author/:id', routeFun.reprint);

	/* 404 */
	app.use(function(req, res){
		res.render('404');
	});
};

module.exports = router;
