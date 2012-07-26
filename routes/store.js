var facebookAuthenticate = require('facebookAuthenticate');
var sql = require('sequelize_connector');
var mailer = require('mailer_connector');
var PAGE_SIZE = 5;
var TOP_USER_STORIES = 5;

exports.home = function(req, res) {
    var missingStory = function() {
        res.render('home', { storyId: '', title: 'TalePipe'});
    }
    
    sql.getTopStory(function(story) {
        if (!story) {
            missingStory();
        } else {
            sql.getFullStory(story.id, function(fullStory) {
                fullStory.completed = true;
                renderStory(fullStory, true, true, '', res, 'home', 'TalePipe');
            }, missingStory);
        }
    }, missingStory);    
};

exports.howto = function(req, res) {
    res.render('howto', { title: 'TalePipe - FAQs'})
}

exports.create = function(req, res) {
    res.render('create', { title: 'TalePipe - Create'})
}

exports.create_post_handler = function(req, res) {
    var failureHandler1 = function() {
        console.log('Not logged in, can\'t save story');
        res.send({
            success: false
        });
    }

    exports.isLoggedIn(req, res, function(facebookId, authToken) {
        var story = {
            title: req.body.title,
            seedInfo: JSON.stringify(req.body.seedInfo),
            max_sections: 5
        };
        
        function failureHandler() {
            console.log('calling the failure handler');
            res.send({
                success: false,
                user: story.user
            });
        }
        
        function sendSuccessResponse(storyId) {            
            console.log('Saved it');
            res.send({
                success: true,
                savedId: storyId
            });
        }
        sql.getUser(req.cookies.login_id, function(user) {
            sql.createStory(story, user, req.body.content, sendSuccessResponse, failureHandler);
        }, failureHandler);
    }, failureHandler1);
}

emailCompleteStory = function(storyId) {
    sql.getFullStory(storyId, mailer.sendCompleteMessage);
}

exports.contribute_post_handler = function(req, res) {
    var storyId = req.body.storyId - 0;
    var userDb;
    function failureHandler() {
        res.send({
            success: false
        });
    }

    exports.isLoggedIn(req, res, function(facebookId, authToken) {
        function addSection(story, totalSections) {
            sql.createSection(req.body.content, story, userDb, function() {                
                if (totalSections == (story.max_sections - 1)) {
                    console.log('setting story ' + story.id + ' complete ' + story.max_sections + ', ' + totalSections);
                    story.completed = true;
                    story.save();                    
                    emailCompleteStory(storyId);                    
                }
                res.send({
                    success: true,
                    savedId: story.id
                });
            }, failureHandler)
        }
        
        function setStoryComplete(totalSections) {            
            sql.getStory(storyId, function(story) {
                console.log('there are ' + story.max_sections + ' sections allowed, and ' + totalSections + ' used');
                if (totalSections < story.max_sections) {                    
                    addSection(story, totalSections);
                } else {
                    failureHandler();
                }                
            }, failureHandler); 
        }
        
        sql.getUser(req.cookies.login_id, function(user) {
            userDb = user;
            sql.getSectionCount(storyId, setStoryComplete, failureHandler);
        }, failureHandler);
    }, failureHandler);
}

exports.getSeedPostHandler = function(req, res) {    
    sql.getRandomNames(function(name1, name2) {
        sql.getRandomLocation(function(location) {
            res.send({
                nameOne: name1,
                nameTwo: name2,
                location: location
            });
        }, res.send);
    }, res.send)
}

exports.like_post_handler = function(req, res) {
    sql.getStory(req.body.storyId, function(story) {
        ++story.num_likes;
        story.save();
        res.send();
    }, res.send)
    console.log('liking ' + req.body.storyId);    
}

exports.userStories = function(req, res) {    
    var page = req.params.page;
    var sortOrder = req.params.sortOrder;
    var sortDir = req.params.sortDir;
    var totalPages = 0;
    var fooStories = [];

    function renderStories(dbUser) {        
        res.render('storiesrenderer', {
            title: 'TalePipe - User Stories',
            sortOrder: sortOrder,
            sortDirection: sortDir,
            page: page,
            totalPages: totalPages,
            user: dbUser.userId,
            userId: dbUser.id,
            stories: fooStories
        });
    }

    function failureHandler() {
        renderStories([]);
    }

    exports.isLoggedIn(req, res, function(facebookId, authToken) {
        var user = req.query.user || req.cookies.login_id;
        
        function getUser(stories) {       
            fooStories = stories;
            sql.getUser(user, renderStories, function() {
                fooStories = [];
                renderStories();
            }, failureHandler);
        }
            
        function getStoryPage(totalStories) {
            console.log('There are ' + totalStories + ' stories');
            if (totalStories) {
                totalPages = totalStories && Math.ceil(totalStories/PAGE_SIZE);
                console.log('Get stories for user ' + user + ' totalPages = ' + totalPages)
                sql.getStories(user, page, PAGE_SIZE, sortOrder, sortDir, getUser, failureHandler);
            } else {
                renderStories([]);
            }
        }
        console.log('Counting stories for user ' + user);
        sql.getUserStoryCount(user, getStoryPage, failureHandler);        
    }, failureHandler);
    
}

exports.allStories = function(req, res) {
    var page = req.params.page;
    var sortOrder = req.params.sortOrder;
    var sortDir = req.params.sortDir;
    
    function renderStories(stories) {
        res.render('storiesrenderer', {
            title: 'TalePipe - Stories',
            sortOrder: sortOrder,
            sortDirection: sortDir,
            page: page,
            totalPages: totalPages,
            user: '',
            userId: '',
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
        title: 'TalePipe - Friends\' Stories'        
    });
}

exports.friendsRetrieval = function(req, res) {
    console.log('Replying to getfriends')
    var friendIds = req.body.users;
    
    function noFriends() {
        res.send({
            friends: []
        });
    }
    
    function returnFriends(friendsFromDB) {            
        var friendsResponse = [];
        for (var l = 0, len = friendsFromDB.length; l < len; ++l) {
            var friend = friendsFromDB[l];
            friendsResponse.push({
                id: friend.id,
                userId: friend.userId
            });
        }
        res.send({
            friends: friendsResponse
        });
    }
    sql.getFriends(friendIds, returnFriends, noFriends);
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
    var hasLock = false;
    var lockedTime = '';
    
    var missingStory = function() {
        res.render('nostory', {title: 'TalePipe - Missing Story'});
    }

    var _renderStory = function(story) {
        renderStory(story, hasContributed, hasLock, lockedTime, res);
    }

    var failureHandler = function() {
        sql.getFullStory(storyId, _renderStory, missingStory);
    }
    
    exports.isLoggedIn(req, res, function(facebookId, authToken) {
        sql.hasContributed(storyId, req.cookies.login_id, function(contributed) {
            console.log('Contributed: ' + contributed);
            hasContributed = contributed;
            if (!hasContributed) {
                sql.lockStory(storyId, req.cookies.login_id, function(haveLock, lockTime) {
                    hasLock = haveLock;
                    lockedTime = lockTime;
                    sql.getFullStory(storyId, _renderStory, missingStory);
                }, missingStory);
            } else {
                sql.getFullStory(storyId, _renderStory, missingStory);
            }       
        }, missingStory);
    }, failureHandler);
}

var renderStory = function(story, hasContributed, hasLock, lockedTime, res, renderer, title) {
    var seedInfo = JSON.parse(story.seedInfo);

    if (story.completed) {
        var storyInfo = {
            storyId: story.id,
            owner: story.user.userId,
            numlikes: story.num_likes,
            storyTitle: story.title,
            title: title || story.title,
            characterOne: seedInfo.character1,
            location: seedInfo.location,
            completed: !!story.completed,
            sections: story.sections,
            excludeBlurb: !!renderer
        };
        res.render(renderer || 'storyrenderer', storyInfo);
    } else if (!hasContributed) {
        var sections = story.sections;            
        var lastSection = sections[sections.length - 1];
        var lastContent = lastSection.content;                       
        var storyInfo = {
            storyId: story.id,
            owner: story.user.userId,
            storyTitle: story.title,
            title: title || story.title,
            characterOne: seedInfo.character1,
            nextSection: sections.length + 1,
            totalSections: story.max_sections,
            location: seedInfo.location,
            snippet: {
                content: '...' + lastContent.substring(Math.max(lastContent.length - 50, 0), lastContent.length),
                contributor: lastSection.contributor
            },
            hasLock: hasLock,
            lockTime: lockedTime
        };
        res.render(renderer || 'storycontribute', storyInfo);
    } else {
        res.render(renderer || 'storyrenderer', {
            owner: story.user.userId,
            storyTitle: story.title,
            title: title || story.title,
            characterOne: seedInfo.character1,
            location: seedInfo.location,
            completed: !!story.completed,
            numlikes: story.num_likes,
            storyId: story.id,
            sections: story.sections
        });            
    }
}

exports.page = function(req, res) {
    var name = req.query.name;
    var contents = {
        contact: 'Questions or comments? Contact us at rob@thetalepipe.com'
    };
    res.render('page', { title: 'TalePipe - ' + name, content:contents[name] });
};


var that = this;

exports.setRedis = function(redis) {
    that.redis = redis;  
}

exports.isLoggedIn = function(req, res, successCallback, failureCallback) {
    that.redis.hget('facebookmap', req.cookies.login_id, function(err, facebookId) {
        if (facebookId) {
            that.redis.get(facebookId, function(err, authToken) {
                if (req.cookies.login_token === authToken) {
                    successCallback(facebookId, authToken);
                } else {
                    that.redis.del(facebookId);
                    res.clearCookie('login_id');
                    res.clearCookie('login_token');
                    failureCallback && failureCallback();
                }
            });
        } else {
            res.clearCookie('login_id');
            res.clearCookie('login_token');
            failureCallback && failureCallback();
        }
    })
}

exports.logout = function(req, res) {
    exports.isLoggedIn(req, res, function(facebookId, authToken) {
        that.redis.del(facebookId);
        res.clearCookie('login_id');
        res.clearCookie('login_token');

        res.send();
    });
}

exports.logon = function(req, res) {
    that.redis.get(req.body.user, function(err, token) {
        if (token === req.body.accessToken) {
            console.log('Already logged');
            res.send({
                success: true                    
            })
            return;
        }
        
        console.log('Logon called');
        exports.authenticate(req, res, function(success, email) {        
            console.log(success)
            if (success) {
                sql.createUser(req.body.user, email, 'FACEBOOK', function(user) {                  
                    that.redis.set(req.body.user, req.body.accessToken);
                    that.redis.hset('facebookmap', user.id, req.body.user);
                    that.redis.expire(req.body.user, 1800)
                    res.cookie('login_id', user.id, { maxAge: 3600000, path: '/' });
                    res.cookie('login_token', req.body.accessToken, { maxAge: 3600000, path: '/' });
                    res.send({
                        newLogin: true,
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
    })
}

exports.authenticate = function(req, res, callback) {
    facebookAuthenticate.authenticate(req, res, function(fail, response) {
        if (fail) {
            callback(false);
        } else {
            var authenticatedUser = response.id;
            var attemptedUser = req.body.user;
            callback(authenticatedUser === attemptedUser, response.email);
        }
    })
}