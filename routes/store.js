var facebookAuthenticate = require('facebookAuthenticate')
var sql = require('sequelize_connector')

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
    var createPost = function(success) {
        if (!success) {
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
                res.send({
                    success: false,
                    user: story.user
                });
            }
            
            function sendSuccessResponse(userId, storyId) {
                res.send({
                    success: true,
                    user: userId,
                    savedId: storyId
                });
            }
            
            function saveStory(user) {                
                sql.createStory(story, user, req.body.content, sendSuccessResponse, failureHandler);
            }
            
            //No other logins that facebook at the moment
            sql.createUser(req.body.user, 'FACEBOOK', saveStory, failureHandler);
        }
    }
    
    exports.authenticate(req, res, createPost)
}

exports.contribute_post_handler = function(req, res) {
    var contributeToPost = function(success) {
        if (!success) {
            res.send({
                success: false
            });
        } else {
            //TODO save the story
            var storySectionToSave = {
                user: req.body.user,
                storyId: req.body.storyId,
                content: req.body.content
            };
            
            console.dir(storySectionToSave)
            
            var savedId = 1;
            res.send({
                success: true,
                user: req.body.user,
                savedId: savedId
            });
        }
    }
    
    exports.authenticate(req, res, contributeToPost);
}

exports.like_post_handler = function(req, res) {
    //TODO like the story
    console.log('liking ' + req.body.storyId)
    res.send();
}

exports.userStories = function(req, res) {
    var user = req.params.user;
    var page = req.params.page;
    var sortOrder = req.params.sortOrder; //Title alphabetical or popularity or date
    var sortDir = req.params.sortDir; //ASC or DESC
    
    //TODO need to calculate the totalpages
    var totalPages = 3;
    console.log('Get stories for user ' + user)
    console.log('Page ' + page)
    console.log('Sort Order ' + sortOrder)
    //TODO get the stories, only return the first section though
    res.render('storiesrenderer', {
        title: 'Consequences - User Stories',
        sortOrder: sortOrder,
        sortDirection: sortDir,
        page: page,
        totalPages: totalPages,
        user: user,
        stories: userStories
    });
}

exports.allStories = function(req, res) {
    var page = req.params.page;
    var sortOrder = req.params.sortOrder; //Title alphabetical or popularity or date
    var sortDir = req.params.sortDir; //ASC or DESC
    
    //TODO need to calculate the totalpages
    var totalPages = 3;
    console.log('Page ' + page)
    console.log('Sort Order ' + sortOrder)
    //TODO get the stories, only return the first section though
    res.render('storiesrenderer', {
        title: 'Consequences - Stories',
        sortOrder: sortOrder,
        sortDirection: sortDir,
        page: page,
        totalPages: totalPages,
        user: '',
        stories: userStories
    });
}

exports.friendsStories = function(req, res) {   
    res.render('friendsrenderer', {
        title: 'Consequences - Friends\' Stories'        
    });
}

exports.friendsRetrieval = function(req, res) {
    console.log('Entered friendsRetrieval');
    var friends = [{
        userId: 36916554,
        storyCount: 3
    }, { 
        userId: 36916555, 
        storyCount: 5
    }, {
        userId: 36916556,
        storyCount: 6
    }, {
        userId: 36916557, 
        storyCount: 7
    }, {
        userId: 36916558,
        storyCount: 8
    }]
    console.log('Replying to getfriends')
    
    facebookAuthenticate.getFriends(req, res, function(fail, response) {
        if (fail) {
            res.send({
                friends: []
            });
        } else {
            //TODO intersect the facebook friends with our database of users
            
            res.send({
                friends: response
            });
        }
    })
}

exports.topUserStories = function(req, res) {
    var stories = [{
        storyId: 1,
        owner: 36916554,
        title: 'Best Story Ever',
        completed: true,
        numlikes: 40,
        firstSection: 'There once was a very short story'
    },{
        storyId: 2,
        owner: 36916554,
        title: '<script>alert(\'Injected!\');</script>',
        completed: true,
        numlikes: 30,
        firstSection: 'Story 2'
    },{
        storyId: 3,
        owner: 36916554,
        title: 'Story 3',
        completed: false,
        numlikes: 20,
        firstSection: 'Story 3'
    }]
    
    res.send({
        stories: stories
    });
}

exports.story = function(req, res) {
    var storyOwner = req.params.user;
    var storyId = req.params.storyId;
    
    var missingStory = function() {
        res.render('nostory', {title: 'Consequences - Missing Story'});
    }
    
    var renderStory = function(story) {
        if (story.completed) {
            res.render('storyrenderer', story);
        } else if (!story.contributed) {
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
    
    sql.getFullStory(storyId, renderStory, missingStory);
}

var userStories = [
    {
        storyId: 1,
        owner: 36916554,
        title: '<script>alert(\'Injected!\');</script>',
        characters: 'Ringo and Macca',
        storySections: 6,
        completed: false,
        numlikes: 40,
        sections: [
            {
                sectionId: 1,
                contributor: 36916554,
                content: 'There once was a very short story'
            },
            {
                sectionId: 2,
                contributor: 36916555,
                content: 'whose content was less important than it\'s purpose, which was to test the functionality.'
            },
            {
                sectionId: 3,
                contributor: 36916556,
                content: 'Now normally I don\'t like to leave stories incomplete, but I going to have t...'
            }
        ]
    },
    {
        storyId: 2,
        owner: 36916554,
        title: 'Second Best Story Ever',
        characters: 'Hunky Jesus',
        storySections: 5,
        completed: true,
        numlikes: 50,
        sections: [
            {
                sectionId: 1,
                contributor: 36916554,
                content: 'There once was a slightly longer story'
            },
            {
                sectionId: 2,
                contributor: 36916558,
                content: 'whose content was even less important than it\'s purpose, which was to test the functionality.'
            },
            {
                sectionId: 3,
                contributor: 36916551,
                content: 'This story is going to be finished'
            },
            {
                sectionId: 4,
                contributor: 36916553,
                content: 'Repeat until finished'
            },
            {
                sectionId: 5,
                contributor: 36916559,
                content: 'Repeat until finished 2'
            }
        ]
    },
    {
        storyId: 3,
        owner: 36916554,
        title: 'Third Best Story Ever',
        characters: 'Hunky Jesus',
        storySections: 5,
        completed: true,
        numlikes: 60,
        sections: [
            {
                sectionId: 1,
                contributor: 36916554,
                content: 'There once was a slightly longer story'
            },
            {
                sectionId: 2,
                contributor: 36916558,
                content: 'whose content was even less important than it\'s purpose, which was to test the functionality.'
            },
            {
                sectionId: 3,
                contributor: 36916551,
                content: 'This story is going to be finished'
            },
            {
                sectionId: 4,
                contributor: 36916553,
                content: 'Repeat until finished'
            },
            {
                sectionId: 5,
                contributor: 36916559,
                content: 'Repeat until finished 2'
            }
        ]
    }
]

exports.page = function(req, res) {
    var name = req.query.name;
    var contents = {
        about: 'Consequences is an online version of the classic children\'s game',
        contact: 'You can contact me at robertsevern@gmail.com'
    };
    res.render('page', { title: 'Consequences - ' + name, content:contents[name] });
};

exports.logon = function(req, res) {
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
        }
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