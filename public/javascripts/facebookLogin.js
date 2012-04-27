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

function FacebookWrapper() {
    FacebookWrapper.prototype.startLoginListener = function() {
        FB.getLoginStatus(function(response) {
            onStatus(response);
            FB.Event.subscribe('auth.statusChange', onStatus);
        });
    }
    
    FacebookWrapper.prototype.checkStatus = function() {
        FB.getLoginStatus(function(response) {
            onStatus(response);
        });
    }
    
    function showAccountInfo() {
        FB.api({
            method: 'fql.query',
            query: 'SELECT name FROM user WHERE uid='+FB.getUserID()
        },
        function(response) {
            if (response[0]) {
                document.getElementById('loginbar').innerHTML = (
                    '<div>' +  response[0].name + '</div>' +
                    '<div class="button" button onclick="FB.logout(document.facebookWrapper.checkStatus)"  style="cursor: pointer;"> Logout</div>'
                );
            }
        });
    }

    function showLoginButton() {
        document.getElementById('loginbar').innerHTML = (
            '<img onclick="FB.login()" style="cursor: pointer;"' +
                'src="https://s-static.ak.fbcdn.net/rsrc.php/zB6N8/hash/4li2k73z.gif">'
        );
    }

    function onStatus(response) {
        var loggedIn = response.status === 'connected';
        
        if (loggedIn) {
            $.post('/logon', {
                user: response.authResponse.userID,
                carrier: 'FACEBOOK',
                accessToken: response.authResponse.accessToken
            }, function(response) {
                if (response.success) {
                    setupClickHandlers();
                    showAccountInfo();
                    $('.loggedon').show();
                    $('.loggedout').hide();
                }
            })
        } else {
            $.post('/logout', {}, function(response) {            
                showLoginButton();
                $('.loggedon').hide();
                $('.loggedout').show();                
            })
            
        } 
    }
    
    function setupClickHandlers() {
        $('#myStoriesTab').click(function() {
            window.location = '/userstories/1/popularity/DESC';            
        })
        
        $('#friendsStoriesTab').click(function() {
            window.location = '/friendsstories';
        })
        
        $('#otherStoriesTab').click(function() {
            window.location = '/allstories/1/popularity/DESC';
        })
    }
}