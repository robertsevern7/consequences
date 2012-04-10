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
        user: req.body.user,
        savedId:savedId
    });
    //res.redirect('/stories/' + req.body.user + '/' + savedId);
}

exports.story = function(req, res) {
    var storyOwner = req.params.user;
    var storyId = req.params.storyId;
    
    var story = userStories[0];
    
    if (story.completed) {
        res.render('completedstory', story);
    } else {
        console.log('I  got here')
        //res.render('incompletestory', story);
        res.render('home', { title: 'Consequences'});
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

var items = {
    SKN:{name:'Shuriken', price:100},
    ASK:{name:'Ashiko', price:690},
    CGI:{name:'Chigiriki', price:250},
    NGT:{name:'Naginata', price:900},
    KTN:{name:'Katana', price:1000}
};

exports.items = function(req, res) {
    if (typeof req.session.username == 'undefined') res.redirect('/');
    else res.render('items', { title: 'Consequences - Items', username: req.session.username, items:items });
};

exports.item = function(req, res) {
    if (typeof req.session.username == 'undefined') res.redirect('/');
    else {
        var name = items[req.params.id].name;
        var price = items[req.params.id].price;
        res.render('item', { title: 'Consequences - ' + name, username: req.session.username, name:name, price:price });
    }
};

exports.page = function(req, res) {
    var name = req.query.name;
    var contents = {
        about: 'Consequences is an online version of the classic children\'s game',
        contact: 'You can contact me at robertsevern@gmail.com'
    };
    res.render('page', { title: 'Ninja Store - ' + name, username: req.session.username, content:contents[name] });
};