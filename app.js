var bodyParser = require('body-parser'),
    configs = require('./configs'),
    cookieParser = require('cookie-parser'),
    express = require('express'), 
    app = express(),
    favicon = require('serve-favicon'),
    hbs = require('hbs'),
    hbsUtility = require('./utilities/hbsUtility'),
    log4js = require('log4js'),
    log = log4js.getLogger('Express'),
    path = require('path'),
    server = require('http').Server(app),
    SocketManager = require('./socket/socketManager'),
    socketManager = new SocketManager(server),
    EventEmitter = require('events'),
    events = new EventEmitter();

var root = require('./routes/index');

// log4js.addAppender(socketAppender.appender);
// log4js.addAppender('./libraries/socketAppender');

log4js.configure({
  appenders:[
    { type: 'console'},
    { type: '../../../libraries/socketAppender'}
  ]
})


events.on('log:info', function(){
  console.log('caught on app..', arguments);
})
events.on('log:debug', function(){
  console.log('caught on app..', arguments);
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbsUtility.loadHelpers(hbs);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(log4js.connectLogger(log, { level: log4js.levels.DEBUG }));
app.use(log4js.connectLogger(log, { level: 'auto' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public/scss'),
  dest: path.join(__dirname, 'public/css'),
  prefix: '/includes/css',
  response: true
}));
app.use(express.static(path.join(__dirname, 'includes')));
app.use('/includes/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.use('/', root);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

server.listen(configs.server.port, function(){
    log.info("Starting up http service on port %d", configs.server.port);
});

module.exports = app;
