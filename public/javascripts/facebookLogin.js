(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

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
                document.getElementById('logoutbar').innerHTML = (
                    '<div class="button" button onclick="FB.logout()"  style="cursor: pointer;"> Logout</div>' + 
                    '<div>' +  response[0].name + '</div>'
                );
            }
        });
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
                    showAccountInfo();
                    $('.loggedon').show();
                    $('.loggedout').hide();

                    $(document).trigger('loggedin', [loggedIn]);

                    if (response.newLogin && document._requiresReload) {
                        window.location.reload();
                    }
                }
            })
        } else {
            $.post('/logout', {}, function(response) {                
                $('.loggedon').hide();
                $('.loggedout').show();
                $(document).trigger('loggedin', [loggedIn])
            })            
        } 
    }
}