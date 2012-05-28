$(document).ready(function() {
     new CreatePanel();   
})

function CreatePanel() {
    that = this;
    
    $.post('/seed', {               
    }, function(response) {
        that.seed = {
            character1: response.nameOne,
            character2: response.nameTwo,
            location: response.location
        }
        $('#characterOne').text(response.nameOne);
        $('#characterTwo').text(response.nameTwo);
        $('#location').text(response.location);
    })
    
    function checkTitlePresent() {
        that._titlePresent = $('#createtitle')[0].value.length;
        var titlewarning = $('#titlewarning');
        
        if (that._titlePresent) {
            titlewarning.removeClass('gonebad');
            titlewarning.hide();
        } else {
            titlewarning.addClass('gonebad');
            titlewarning.show();
        }
        
        validateCreateButton();
        return that._titlePresent;
    }
    
    var entryBox = new EntryBox();
    entryBox.bind('validate', validateCreateButton);
    
    function validateCreateButton() {
        var createButton = $('#contributebutton');
        if (entryBox.isValid() && that._titlePresent && that.seed) {
            createButton.removeClass('disabled');
            return true;
        }
        
        createButton.addClass('disabled');
        return false;
    }
    
    checkTitlePresent();
    entryBox.checkRemainingCharacters();
    
    $("#createtitle").blur(checkTitlePresent);
    $("#createtitle").keyup(checkTitlePresent);
    
    $('#contributebutton').click(function() {
        var authResponse = FB.getAuthResponse()
        if (entryBox.checkRemainingCharacters() && checkTitlePresent()) {
            if (!authResponse || !authResponse.accessToken) {
                return;
            }
            
            $.post('/create', {                
                title: $("#createtitle")[0].value,
                seedInfo: that.seed,
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
}