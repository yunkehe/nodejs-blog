var crypto = require('crypto');
var User = require('../models/user.js');
var Publish = require('../models/publish.js');
var multerUtil = require('../helper/multerUtil.js');
var _ = require('underscore');

// 存储控制
var upload = multerUtil.array('photos', 4);

// 路由回调
var routeFun = {

	// 路由名称
	names: ['Login', 'Register', 'Logout', 'Publish', 'Upload'],

	// 首页
	index: function(req, res, next){

		Publish.getAll(null, function (err, blogs) {
			if(err) blogs = [];
			// renderIndex(blogs);
			res.render('index', { title: '这是主页', 
								user: req.session.user,
								success: req.flash('success').toString(),
								error: req.flash('error').toString(),
								blogs: blogs
							});
		});
	},

	
	// 登陆页
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

	// 发布文章页面
	getPublish: function(req, res, next){
		res.render('publish', {title: '发表',
								user: req.session.user,
								success: req.flash('success').toString(),
								error: req.flash('error').toString()
							});
	},

	// 发布文章
	postPublish: function(req, res, next){
		var author = req.session.user.name,
			title = req.body.title,
			article = req.body.article;

		var blogPublish = new Publish({
			author: author,
			title: req.body.title,
			article: req.body.article 
		});

		blogPublish.save(function(err){

			if(err){
				req.flash('error', '保存博客失败');
				return req.redirect('/');
			};
			
			req.flash('success', '发表成功');
			res.redirect('/');
			
		});		
	},

	// upload页面
	getUpload: function(req, res, next){

		res.render('upload', {title: '上传',
							user: req.session.user,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
	},

	// 上传api
	postUpload: function(req, res, next){
		
		upload(req, res, function(err){
			if(err) return console.log(err);

			req.flash('success', '上传成功');
			res.redirect('/');

		})
	},


	// 用户页
	user: function(req, res, next){

		var author;

		if(req.params.author){
			// console.log('--------------------------req.params.author', req.params.author);
			author = req.params.author;

			Publish.getAll(author, function(err, blogs){
				if(err) blog = [];
				res.render('user', { title: author + '的主页', 
									user: req.session.user,
									success: req.flash('success').toString(),
									error: req.flash('error').toString(),
									blogs: blogs
								});
			});

		}else{
			res.redirect('/');
		}
	},

	// 文章頁
	blog: function(req, res, next){
		var query = {
			author: req.params.author,
			title: req.params.title,
			localString: req.params.localString
		};

		Publish.getOne(query, function(err, blog){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}

			// console.log('--------------------findOne blog', blog._id);
			res.render('blog', {
				title: '博客首页',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				blog: blog
			});

		})
	},

	// 编辑
	edit: function(req, res, next){
		
	},

	// 刪除
	delete: function(req, res, next){

	}
	/* routeFun end */
};

module.exports = routeFun;
