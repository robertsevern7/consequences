var express = require('express')
var store = require('./routes/store');

var app = module.exports = express.createServer();
app.use(express.cookieParser());
app.use(express.session({ secret: "keyboard cat" }));

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.session({secret: 'youaintneverguessingthisbitches'}));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', store.home);
app.post('/', store.home_post_handler);
app.get('/howto', store.howto);
app.get('/create', store.create);
app.post('/create', store.create_post_handler);
app.post('/contribute', store.contribute_post_handler);
app.post('/like', store.like_post_handler);
app.get('/userstories/:page/:sortOrder/:sortDir', store.userStories);
app.get('/friendsstories', store.friendsStories);
app.post('/getfriends', store.friendsRetrieval);
app.get('/allstories/:page/:sortOrder/:sortDir', store.allStories);
app.get('/stories/:storyId', store.story);
app.get('/page', store.page);
app.post('/topuserstories', store.topUserStories);
app.post('/logon', store.logon);
app.post('/logout', store.logout);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);