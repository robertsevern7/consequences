$(document).ready(function() {
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
        } else {
            charWarning.addClass('gonebad');
            charWarning.text((-remaining) + ' characters too many');
        }
    }
    
    checkRemainingCharacters()
    $("#openingparagraph").blur(checkRemainingCharacters);
    $("#openingparagraph").keyup(checkRemainingCharacters);
})