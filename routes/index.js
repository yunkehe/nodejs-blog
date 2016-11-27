var routeFun = require('./routeFun');
var privilege = require('./privilege.js');
var publish = require('../models/publish.js');

var router = function(app){

	/* GET home page. */
	app.get('/', function(req, res, next) {

		publish.get(null, function (err, blogs) {
			if(err) blogs = [];
			res.render('index', { title: 'Express', 
						user: req.session.user,
						success: req.flash('success').toString(),
						error: req.flash('error').toString(),
						blogs: blogs
					})
		})

	});

	/* 路由 */
	routeFun.names.forEach(function(route){
		var routeName = route[0].toLowerCase()+route.slice(1);
		
		app.get('/'+routeName, privilege[privilege.route[routeName]]);
		app.get('/'+routeName, routeFun['get'+route]);

		app.post('/'+routeName, privilege[privilege.route[routeName]]);
		app.post('/'+routeName, routeFun['post'+route]);
	});
};

module.exports = router;
