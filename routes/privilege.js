var privilege = {

	route: {
		'login': 'checkLogin',
		'register': 'checkLogin',
		'publish': 'checkNotLogin',
		'logout': 'checkNotLogin'
	},
	
	// 未登陆
	checkNotLogin: function (req, res, next) {
		if(!req.session.user){
			res.redirect('/login');
		}
		next();
	},

	// 已登陆
	checkLogin: function(req, res, next){
		if(req.session.user){
			res.redirect('/');
		}
		next();
	}
};

module.exports = privilege;