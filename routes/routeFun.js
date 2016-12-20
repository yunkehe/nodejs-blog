var crypto = require('crypto');
var User = require('../models/user.js');
var Publish = require('../models/publish.js');
var Comment = require('../models/comment.js');
var multerUtil = require('../helper/multerUtil.js');
var _ = require('underscore');
var setting = require('../settings.js');

// 存储控制
var upload = multerUtil.array('photos', 4);

// 路由回调
var routeFun = {

	// 路由名称
	names: ['Login', 'Register', 'Logout', 'Publish', 'Upload'],

	// 首页
	index: function(req, res, next){
		var limit_page = setting.pagination.limit;
		var page = req.query.p ? parseInt(req.query.p) : 1;

		Publish.getPagination({
			page: page
		}, function (err, blogs, total) {
			if(err) blogs = [];
			// renderIndex(blogs);
			res.render('index', { title: '这是主页', 
								user: req.session.user,
								success: req.flash('success').toString(),
								error: req.flash('error').toString(),
								blogs: blogs,
								is_first_page: (page - 1) == 0,
								is_last_page: (page - 1)*limit_page + blogs.length == total,
								page: page
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
		var tags = req.body.tags ? req.body.tags.split(',').slice(0, 3) : [];

		var blogPublish = new Publish({
			author: req.session.user.name,
			title: req.body.title,
			article: req.body.article,
			tags: tags
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
			author = req.params.author;
			
			var limit_page = setting.pagination.limit;
			var page = req.query.p ? parseInt(req.query.p) : 1;

			Publish.getPagination({
				page: page,
				author: author
			}, function (err, blogs, total) {
				if(err) blogs = [];
				// renderIndex(blogs);
				res.render('user', { title: author + '的主页', 
									user: req.session.user,
									success: req.flash('success').toString(),
									error: req.flash('error').toString(),
									blogs: blogs,
									is_first_page: (page - 1) == 0,
									is_last_page: (page - 1)*limit_page + blogs.length == total,
									page: page
								});
			});
		}else{
			res.redirect('/');
		}
	},

	// 文章頁
	blog: function(req, res, next){

		Publish.getOne(req.params, function(err, blog){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}

			if(!blog.comments) blog.comments = [];
			// console.log('--------------------findOne blog', blog._id);
			res.render('blog', {
				title: '文章详情',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				blog: blog
			});

			// 访问该页一次则增加一次pv统计
			// Publish.update

		})
	},

	// 文章页可以留言
	comment: function(req, res, next){

		var p_comment = {
			name: req.body.name,
			website: req.body.website,
			content: req.body.content
		};

		var m_comment = new Comment({
			id: req.params.id,
			comment: p_comment
		});

		m_comment.save(function(err){
			console.log('=========================是否保存成功', err)
			if(err){
				req.flash('error', '保存失败！');
				return res.redirect('back');
			}

			req.flash('success', '保存成功！');
			res.redirect('back');
		})
	},

	// render编辑页面
	getEdit: function(req, res, next){

		Publish.getOne(req.params, function(err, blog){
			if(err){
				blog = {};
				req.flash('error', '读取博客数据失败！');
			};

			res.render('edit', {
				title: '编辑博客',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				blog: blog
			});

		});	
	},

	// 编辑博客 保存修改
	postEdit: function(req, res, next){
		var params = {
			id: req.params.id,
			article: req.body.article,
			tags: req.body.tags ? req.body.tags.split(',') : []
		};

		var url = '/u/'+req.params.author+'/'+req.params.id;

		Publish.update(params, function(err){
			if(err){
				req.flash('error', '修改失败！');
			}
			req.flash('success', '修改成功！');
			
			// 返回到详情页
			res.redirect(url);
		})
	},

	// 刪除
	remove: function(req, res, next){
		Publish.remove(req.params, function(err){
			if(err){
				req.flash('error', '删除失败!');
				res.redirect('back');
			}

			req.flash('success', '删除成功!');
			res.redirect('/');
		});
	},

	// 存档
	archive: function(req, res, next){
		Publish.getArchive(function(err, docs){
			if(err){
				req.flash('error', '读取存档失败！');
				var docs = [];
			}

			res.render('archive', {
				title: '存档首页',
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				user: req.session.user,
				docs: docs
			});
		});
	},

	// 标签页
	tags: function(req, res, next){
		Publish.getTags(function(err, tags){
			if(err){
				req.flash('error', '读取标签失败！');
				var tags = [];
			}
			// res.flash('success', 'success!');
			res.render('tags', {
				title: '所有标签',
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				user: req.session.user,
				tags: tags
			});
		});
	},

	tagBlogs: function(req, res, next){
		var tags = [req.params.tag];

		Publish.getBlogsByTags(tags, function(err, blogs){
			if(err){
				req.flash('error', '读取指定博客失败！');
				return res.redirect('back');
			}

			req.flash('success', '读取博客成功！');
			res.render('blogs_by_tags', {
				title: '所有博客',
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				user: req.session.user,
				blogs: blogs
			})

		})
	}
	/* routeFun end */
};

module.exports = routeFun;



