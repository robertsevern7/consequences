window.fbAsyncInit = function() {
    FB.init({
        appId      : '341867209202847',
        status     : true, 
        cookie     : true,
        xfbml      : true,
        oauth      : true,
    });
};
(function(d){
    var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    d.getElementsByTagName('head')[0].appendChild(js);
}(document));

function showAccountInfo() {
    FB.api({
        method: 'fql.query',
        query: 'SELECT name FROM user WHERE uid='+FB.getUserID()
    },
    function(response) {
        document.getElementById('loginbar').innerHTML = (
            '<div onclick="FB.logout()"  style="cursor: pointer;">' +  response[0].name + '</div>'
        );
    }
  );
}

function showLoginButton() {
    document.getElementById('loginbar').innerHTML = (
        '<img onclick="FB.login()" style="cursor: pointer;"' +
            'src="https://s-static.ak.fbcdn.net/rsrc.php/zB6N8/hash/4li2k73z.gif">'
    );
}

function onStatus(response) {
    if (response.status === 'connected') {
        showAccountInfo();
    } else {
        showLoginButton();
    }
}

window.onload = function() {
    FB.getLoginStatus(function(response) {
        onStatus(response);
        FB.Event.subscribe('auth.statusChange', onStatus);
    });
}