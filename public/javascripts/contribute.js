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
    
    $('#contributebutton').click(function() {
        if (entryBox.checkRemainingCharacters()) {
            $.post('/contribute', {
                storyId: $('#storyId').attr('storyId'),
                content: entryBox.getValue(),
                user: FB.getUserID()
            }, function(response) {
                window.location = '/stories/' + response.user + '/' + response.savedId;
            })
        }        
    })
    
    entryBox.checkRemainingCharacters();
})