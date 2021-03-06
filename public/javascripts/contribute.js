$(document).ready(function() {
    var entryBox = new EntryBox();
    entryBox.bind('validate', validateCreateButton);

    function validateCreateButton() {
        var contributeButton = $('#contributebutton');
        if (entryBox.isValid()) {
            contributeButton.removeClass('disabled');
            return true;
        }
        
        contributeButton.addClass('disabled');
        return false;
    }
    
    var contButton = $('#contributebutton')
    contButton.click(function() {
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
                content: entryBox.getValue(),
                lastSectionId: contButton.attr('lastSectionId')
            }, function(response) {
                if (response.success) {
                    if (response.savedId === -1) {
                        window.location = '/neverending/end';
                    } else {
                        window.location = '/stories/' + response.savedId;
                    }
                } else {
                    document.facebookWrapper.checkStatus();
                }
            })
        }        
    })
    
    entryBox.checkRemainingCharacters();
})