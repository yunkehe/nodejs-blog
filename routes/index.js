var routeFun = require('./routeFun');

var router = function(app){

	/* GET home page. */
	app.get('/', function(req, res, next) {
	  res.render('index', { title: 'Express', 
							user: req.session.user,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
	});

	/* 路由 */
	routeFun.names.forEach(function(route){
		var routeName = route[0].toLowerCase()+route.slice(1);
		app.get('/'+routeName, routeFun['get'+route]);
		app.post('/'+routeName, routeFun['post'+route]);
	});
};

module.exports = router;
