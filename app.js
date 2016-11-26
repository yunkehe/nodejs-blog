var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var  flash = require('connect-flash');

// var index = require('./routes/index');
var users = require('./routes/users');
var settings = require('./settings.js');
var router = require('./routes/index.js');

var app = express();
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 在session中存储信息的特定区域
app.use(flash());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: settings.cookieSecret,
  cookie: {maxAge: 1000*60*60*24*30}, // 30 days
  store: new MongoStore({
    url: 'mongodb://localhost/blog'
  }),
  resave: true, saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', index);
// app.use('/users', users);

router(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var httpServer = app.listen(9001, function () {
  var host = httpServer.address().address;
  var port = httpServer.address().port;

  console.log('My server listening at http://%s:%s', host, port);
});


module.exports = app;
