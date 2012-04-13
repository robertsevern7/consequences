$(document).ready(function() {
     new CreatePanel();   
})

function CreatePanel() {
    that = this;
    function setSliderValueText(event, ui) {
        $("#slidervalue").text(ui.value)
    }    
    
    $("#createslider").slider({
        min: 5,
        max: 20,
        value: 5,
        change: setSliderValueText,
        slide: setSliderValueText
    });
    
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
        if (entryBox.isValid() && that._titlePresent) {
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
                accessToken: authResponse.accessToken,
                user: authResponse.userID,
                title: $("#createtitle")[0].value,
                characters: $("#createcharacters")[0].value,
                storySections: $("#createslider").slider("option", "value"),
                content: entryBox.getValue()
            }, function(response) {
                if (response.success) {
                    window.location = '/stories/' + response.user + '/' + response.savedId;
                } else {
                    document.facebookWrapper.checkStatus();
                }
            })
        }        
    })
}