var express = require('express')
var cluster = require('cluster');
var numCPUs = 4;//require('os').cpus().length;
var store = require('./routes/store');
console.log(numCPUs + ' people can use this');
var redis = require("redis"),
        client = redis.createClient();

store.setRedis(client);

var log4js = require('log4js');
log4js.configure({
  "appenders": [
    {
      "type": "file",
      "filename": "logs/talepipe.log",
      "maxLogSize": 1024000,
      "backups": 5
    }
  ]
})
log4js.replaceConsole();
var logger = log4js.getLogger();
store.setLogger(logger);

logger.info("Started the app");
var app = module.exports = express.createServer(
  express.favicon('./public/images/favicon.ico', { maxAge: 2592000000 })
);
app.use(express.cookieParser());

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.session({
    secret: 'youaintneverguessingthisbitches'}
  ));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', store.home);
app.get('/howto', store.howto);
app.get('/create', store.create);
app.post('/create', store.create_post_handler);
app.post('/contribute', store.contribute_post_handler);
app.get('/neverending', store.getNeverendingStory);
app.get('/neverending/:page', store.getNeverendingStory);
app.post('/like', store.like_post_handler);
app.post('/seed', store.getSeedPostHandler);
app.get('/userstories/:page/:sortOrder/:sortDir', store.userStories);
app.get('/friendsstories', store.friendsStories);
app.post('/getfriends', store.friendsRetrieval);
app.get('/allstories/:page/:sortOrder/:sortDir', store.allStories);
app.get('/stories/:storyId', store.story);
app.get('/page', store.page);
app.post('/topuserstories', store.topUserStories);
app.post('/logon', store.logon);
app.post('/logout', store.logout);

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('death', function(worker) {
        console.log('worker ' + worker.pid + ' died');
    });
} else {
    app.listen(3000);
}