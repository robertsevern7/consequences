var facebookAuthenticate = require('facebookAuthenticate')

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
            //TODO save the story
            var storySectionToSave = {
                user: req.body.user,
                title: req.body.title,
                characters: req.body.characters,
                storySections: req.body.storySections,
                content: req.body.content
            };
            
            var savedId = 1;
            res.send({
                success: true,
                user: req.body.user,
                savedId: savedId
            });
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

exports.userStories = function(req, res) {
    var user = req.params.user;
    var page = req.params.page;
}

exports.story = function(req, res) {
    var storyOwner = req.params.user;
    var storyId = req.params.storyId;
    
    var story = userStories[0];
    
    var contributed = false;
    //TODO get the current user
    
    if (!story) {
        res.render('nostory', {title: 'Consequences - Missing Story'});
    } else if (story.completed) {
        res.render('storyrenderer', story);
    } else if (!contributed) {
        var lastSection = story.sections[story.sections.length - 1];
        var lastContent = lastSection.content;
        var storyInfo = {
            storyId: story.storyId,
            owner: story.owner,
            title: story.title,
            characters: story.characters,
            snippet: {
                content: '...' + lastContent.substring(Math.max(lastContent.length - 50, 0), lastContent.length),
                contributor: lastSection.contributor
            }
        };
        res.render('storycontribute', storyInfo);
    } else {
        res.render('storyrenderer', story);
    }
}

var userStories = [
    {
        storyId: 1,
        owner: 36916554,
        title: 'Best Story Ever',
        characters: 'Ringo and Macca',
        storySections: 6,
        completed: false,
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