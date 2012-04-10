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
    
    function checkRemainingCharacters() {
        var totalChars = (this.value || $("#openingparagraph")[0].value).length;
        var MAX_CHARS = 280;
        var remaining = MAX_CHARS - totalChars;
        
        var charWarning = $("#charwarning");
        if (remaining >= 0) {
            charWarning.removeClass('gonebad');
            charWarning.text(remaining + ' characters remaining');
            that._remainingCharsValid = true;
            validateCreateButton();
            return true;
        } else {
            charWarning.addClass('gonebad');
            charWarning.text((-remaining) + ' characters too many');
            that._remainingCharsValid = false;
            validateCreateButton();
            return false;
        }
    }
    
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
    
    function validateCreateButton() {
        var createButton = $('#createbutton');
        if (that._remainingCharsValid && that._titlePresent) {
            createButton.removeClass('disabled');
            return true;
        }
        
        createButton.addClass('disabled');
        return false;
    }
    
    checkTitlePresent();
    checkRemainingCharacters();
    $("#openingparagraph").blur(checkRemainingCharacters);
    $("#openingparagraph").keyup(checkRemainingCharacters);
    
    $("#createtitle").blur(checkTitlePresent);
    $("#createtitle").keyup(checkTitlePresent);
    
    $('#createbutton').click(function() {
        if (checkRemainingCharacters() && checkTitlePresent()) {
            $.post('/create', {
                title: $("#createtitle")[0].value,
                characters: $("#createcharacters")[0].value,
                storySections: $("#createslider").slider("option", "value"),
                content: $("#openingparagraph")[0].value,
                user: FB.getUserID()
            }, function(response) {
                window.location = '/stories/' + response.user + '/' + response.savedId;
            })
        }        
    })
}