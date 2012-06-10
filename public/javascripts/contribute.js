$(document).ready(function() {
    var entryBox = new EntryBox();
    entryBox.bind('validate', validateCreateButton);
    
    var that = this;
    $(document).bind('loggedin', function(){
        if (that.clicked) {
            window.location.reload()
        }
        $('.fb_button').click(function() {
            that.clicked = true;            
        })
    });

    function validateCreateButton() {
        var contributeButton = $('#contributebutton');
        if (entryBox.isValid()) {
            contributeButton.removeClass('disabled');
            return true;
        }
        
        contributeButton.addClass('disabled');
        return false;
    }
    
    $('#contributebutton').click(function() {
        var authResponse = FB.getAuthResponse()
        if (entryBox.checkRemainingCharacters()) {
            if (!authResponse || !authResponse.accessToken) {
                document.facebookWrapper.checkStatus();
                return;
            }
        
            $.post('/contribute', {
                accessToken: authResponse.accessToken,
                user: authResponse.userID,
                storyId: $('#storyId').attr('storyId'),
                content: entryBox.getValue()
            }, function(response) {
                if (response.success) {
                    window.location = '/stories/' + response.savedId;
                } else {
                    document.facebookWrapper.checkStatus();
                }
            })
        }        
    })
    
    entryBox.checkRemainingCharacters();
})