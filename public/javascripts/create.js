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
})