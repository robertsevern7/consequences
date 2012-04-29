var facebookAuthenticate = require('facebookAuthenticate')
var sql = require('sequelize_connector')
var PAGE_SIZE = 2;
var TOP_USER_STORIES = 3;

exports.home = function(req, res) {
    if (typeof req.session.username == 'undefined') res.render('home', { title: 'Consequences'});
    else res.redirect('/items');
};

exports.home_post_handler = function(req, res) {
  var username = req.body.username || 'Anonymous';
  req.session.username = username;
  res.redirect('/');
};

exports.howto = function(req, res) {
    res.render('howto', { title: 'Consequences - How To'})
}

exports.create = function(req, res) {
    res.render('create', { title: 'Consequences - Create'})
}

exports.create_post_handler = function(req, res) {
    if (!req.session.user) {
        console.log('Not logged in, can\'t save story');
        res.send({
            success: false
        });
    } else {
        var story = {
            title: req.body.title,
            characters: req.body.characters,
            max_sections: req.body.storySections
        };
        
        function failureHandler() {
            console.log('calling the failure handler');
            res.send({
                success: false,
                user: story.user
            });
        }
        
        function sendSuccessResponse(userId, storyId) {
            console.log('Saved it');
            res.send({
                success: true,
                user: userId,
                savedId: storyId
            });
        }
        sql.getUser(req.session.user, function(user) {
            sql.createStory(story, user, req.body.content, sendSuccessResponse, failureHandler);
        }, failureHandler);        
    }
}

exports.contribute_post_handler = function(req, res) {
    if (!req.session.user) {
        res.send({
            success: false
        });
    } else {
        //TODO save the story
        var storySectionToSave = {
            user: req.session.user,
            storyId: req.body.storyId,
            content: req.body.content
        };
        
        console.dir(storySectionToSave)
        
        var savedId = 1;
        res.send({
            success: true,
            user: req.session.user,
            savedId: savedId
        });
    }
}

exports.like_post_handler = function(req, res) {
    //TODO like the story
    console.log('liking ' + req.body.storyId)
    res.send();
}

exports.userStories = function(req, res) {
    var user = req.session.user;
    var page = req.params.page;
    var sortOrder = req.params.sortOrder;
    var sortDir = req.params.sortDir;
    var totalPages = 0;
        
    function renderStories(stories) {
        res.render('storiesrenderer', {
            title: 'Consequences - User Stories',
            sortOrder: sortOrder,
            sortDirection: sortDir,
            page: page,
            totalPages: totalPages,
            user: user,
            stories: stories
        });
    }
        
    function getStoryPage(totalStories) {       
        totalPages = totalStories && Math.ceil(totalStories/PAGE_SIZE);
        console.log('Get stories for user ' + user)
        sql.getStories(user, page, PAGE_SIZE, sortOrder, sortDir, renderStories);        
    }    
    
    sql.getUserStoryCount(user, getStoryPage);
}

exports.allStories = function(req, res) {
    var page = req.params.page;
    var sortOrder = req.params.sortOrder;
    var sortDir = req.params.sortDir;
    
    function renderStories(stories) {
        res.render('storiesrenderer', {
            title: 'Consequences - Stories',
            sortOrder: sortOrder,
            sortDirection: sortDir,
            page: page,
            totalPages: totalPages,
            user: '',
            stories: stories
        });
    }
        
    function getStoryPage(totalStories) {       
        totalPages = totalStories && Math.ceil(totalStories/PAGE_SIZE);
        console.log('Get all stories page')
        sql.getStories('', page, PAGE_SIZE, sortOrder, sortDir, renderStories);
    }    
    
    sql.getAllStoryCount(getStoryPage);
}

exports.friendsStories = function(req, res) {   
    res.render('friendsrenderer', {
        title: 'Consequences - Friends\' Stories'        
    });
}

exports.friendsRetrieval = function(req, res) {
    console.log('Replying to getfriends')
    
    facebookAuthenticate.getFriends(req, res, function(fail, friends) {
        if (fail) {
            res.send({
                friends: []
            });
        } else {
            var friendIds = [];
            for (var k = 0, len = friends.length; k < len; ++k) {
                var friend = friends[k];
                friendIds.push(friend.id);
            }
            
            function noFriends() {
                res.send({
                    friends: []
                });
            }
            
            function returnFriends(friendsFromDB) {            
                var friendResponse = [];
                for (var l = 0, len = friendsFromDB.length; l < len; ++l) {
                    var friend = friendsFromDB[l];
                    friendsResponse.push({
                        id: friend.id,
                        userId: friend.userId
                    });
                }
                res.send({
                    friends: friendResponse
                });
            }
            sql.getFriends(friendIds, returnFriends, noFriends);              
        }
    })
}

exports.topUserStories = function(req, res) {
    function renderStories(stories) {
        var returnStories = [];
        for (var i = 0, len = stories.length; i < len; ++i) {
            var story = stories[i];
            returnStories.push({
                title: story.title,
                id: story.id,
                completed: story.completed,
                numlikes: story.num_likes,
                firstSection: story.sections[0].content
            });
        }
        res.send({
            stories: returnStories
        });
    }
        
    var user = req.body.user;
    sql.getStories(user, 1, TOP_USER_STORIES, 'popularity', 'DESC', renderStories); 
}

exports.story = function(req, res) {
    var storyId = req.params.storyId;
    var hasContributed = false;
    
    var missingStory = function() {
        res.render('nostory', {title: 'Consequences - Missing Story'});
    }
    
    var renderStory = function(story) {
        if (story.completed) {
            res.render('storyrenderer', story);
        } else if (!hasContributed) {
            var sections = story.sections;            
            var lastSection = sections[sections.length - 1];
            var lastContent = lastSection.content;                        
            var storyInfo = {
                storyId: story.id,
                owner: story.user.userId,
                title: story.title,
                characters: story.characters,
                snippet: {
                    content: '...' + lastContent.substring(Math.max(lastContent.length - 50, 0), lastContent.length),
                    contributor: lastSection.contributor
                }
            };
            res.render('storycontribute', storyInfo);
        } else {
            res.render('storyrenderer', {
                owner: story.user.userId,
                title: story.title,
                characters: story.characters,
                completed: !!story.completed,
                numlikes: story.num_likes,
                storyId: story.id,
                sections: story.sections
            });            
        }
    }
    
    sql.hasContributed(storyId, req.session.user, function(contributed) {
        console.log('Contributed: ' + contributed);
        hasContributed = contributed;
        sql.getFullStory(storyId, renderStory, missingStory); 
    }, missingStory);  
}

exports.page = function(req, res) {
    var name = req.query.name;
    var contents = {
        about: 'Consequences is an online version of the classic children\'s game',
        contact: 'You can contact me at robertsevern@gmail.com'
    };
    res.render('page', { title: 'Consequences - ' + name, content:contents[name] });
};

exports.logout = function(req, res) {
    delete req.session.user;
    res.send()
}

exports.logon = function(req, res) {
    if (req.session.user) {
        console.log('Already logged');
        res.send({
            success: true                    
        })
        return;
    }
    
    console.log('Logon called');
    exports.authenticate(req, res, function(success) {
        console.log(success)
        if (success) {
            sql.createUser(req.body.user, 'FACEBOOK', function(user) {                                
                req.session.user = user.id;
                console.log(user.id);
                res.send({
                    success: true                    
                })
            });
        } else {
            res.send({
                success: false                    
            })
        }
    }, function() {
        res.send({
            success: false
        })
    })
}

exports.authenticate = function(req, res, callback) {
    facebookAuthenticate.authenticate(req, res, function(fail, response) {
        if (fail) {
            callback(false);
        } else {
            var authenticatedUser = response.id;
            var attemptedUser = req.body.user;
            callback(authenticatedUser === attemptedUser);
        }
    })
}