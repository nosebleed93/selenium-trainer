var bodyParser = require('body-parser'),
  cache = require('./cache'),
  configs = require('./configs'),
  cors = require('cors'),
  cookieParser = require('cookie-parser'),
  express = require('express'),
  extensionRoutes = require('./routes/extension'),
  app = express(),
  favicon = require('serve-favicon'),
  fs = require('fs'),
  hbs = require('hbs'),
  hbsUtility = require('./utilities/hbsUtility'),
  helmet = require('helmet'),
  log4js = require('log4js'),
  log = log4js.getLogger('Express'),
  path = require('path'),
  session = require('express-session'),
  server = require('http').Server(app),
  scheduler = require('./libraries/scheduler');

var root = require('./routes/index');

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: '../../../libraries/socketAppender' }
  ]
});

scheduler.init();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbsUtility.loadHelpers(hbs);

app.use(session({secret: 'ssshhhhhdonttellanyone'}));
// app.use(session({resave: true, saveUninitialized: true, secret: 'SOMERANDOMSECRETHERE', cookie: { maxAge: 60000, secure: true }}));
// app.use(expressSession({
//   secret: 'bender is great',
//   resave: true,
//   saveUninitialized: true,
//   cookie: { secure: true, maxAge: 60000 }
// }));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(log4js.connectLogger(log, { level: log4js.levels.DEBUG }));
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3100', 'http://127.0.0.1:3100'],
  methods: ['get', 'post']
}))
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
app.use('/includes', express.static(path.join(__dirname, 'public')));
app.use('/includes/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.use('/', root);
app.use('/extension', extensionRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: 'oops',
    error: {}
  });
});

try{
  var rawFileData = fs.readFileSync('./imageStore.json')
  cache.storedImageData = JSON.parse(rawFileData);
  log.info("loaded %s images storage into cache.", cache.storedImageData.length);
}catch(e){
  log.error('unable to find flat image file',  e)
}


app.set('port', process.env.PORT || configs.server.port);
server.listen(app.get('port'), function () {
  log.info("Starting up http service on port %d", app.get('port'));
});

module.exports = app;
