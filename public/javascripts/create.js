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
        } else {
            charWarning.addClass('gonebad');
            charWarning.text((-remaining) + ' characters too many');
            that._remainingCharsValid = false;
            validateCreateButton();
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
    }
    
    function validateCreateButton() {
        var createButton = $('#createbutton')
        console.log(that._remainingCharsValid + ', ' +  that._titlePresent)
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
}