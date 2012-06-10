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
                    '<div>' +  response[0].name + '</div>' +
                    '<div class="button" button onclick="FB.logout()"  style="cursor: pointer;"> Logout</div>'
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
                    setupClickHandlers();
                    showAccountInfo();
                    $('.loggedon').show();
                    $('.loggedout').hide();
                    $(document).trigger('loggedin', [loggedIn])
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
    
    function setupClickHandlers() {
        $('#myStoriesTab').click(function() {
            window.location = '/userstories/1/popularity/DESC';            
        })
        
        $('#friendsStoriesTab').click(function() {
            window.location = '/friendsstories';
        })
    }
}