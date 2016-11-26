var crypto = require('crypto');
var User = require('../models/user.js');

// 路由回调
var routeFun = {

	// 路由名称
	names: ['Login', 'Register', 'Logout', 'Publish'],

	getLogin : function(req, res, next){
		res.render('login', {title: '登陆',
							user: req.session.user,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
	},

	postLogin: function(req, res, next){
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex'),
			username = req.body.username;

		User.get(username, function(err, user){
			if(!user){
				req.flash('error', '用户不存在');
				return res.redirect('/register');
			}
			if(user.password != password){
				req.flash('error', '密码错误');
				return res.redirect('/login');
			}

			req.session.user = user;
			req.flash('success', '登陆成功');
			res.redirect('/');
		})
	},

	// 注册页面
	getRegister : function(req, res, next){
		res.render('register', {title: '注册',
								user: req.session.user,
								success: req.flash('success').toString(),
								error: req.flash('error').toString()});
	},

	// 注册api
	postRegister: function(req, res, next){
		var name = req.body.username,
			password = req.body.password,
			password_repeat = req.body['password-repeat'];

		if(password_repeat !== password){
			req.flash('error', '两次输入的密码不一致');
			return res.redirect('/register'); 
		}

		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');

		var  regUser = new User({
			name: name,
			password: password,
			email: req.body.email
		});

		User.get(name, function(err, user){
			if(user){
				req.flash('error', '用户已存在');
				return res.redirect('/register');
			}

			regUser.save(function(err, user){
				if(err){
					req.flash('error', '注册失败');
					return res.redirect('/register');
				};

				req.session.user = user;
				req.flash('success', '注册成功');
				res.redirect('/');
			})
		})
	},

	getLogout : function(req, res, next){
		req.session.user = null;
		req.flash('success', '登出成功');
		res.redirect('/');
	},	

	postLogout: function(req, res, next){

	},

	getPublish: function(req, res, next){
		res.render('publish', {});
	},

	postPublish: function(req, res, next){

	},
};

module.exports = routeFun;
