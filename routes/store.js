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