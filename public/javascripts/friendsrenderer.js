$(document).live("facebook:ready", function() {
    new FriendsRenderer();
});
function FriendsRenderer() {
    that = this;
    
    function handlePhotoClick() {
        $('.userimage').click(function() {
            $.post('/topuserstories', {
                userId: $(this).attr('userId')
            }, function(response) {
                $('#storywindow').empty();
                
                if (response.stories.length) {
                    for (var i = 0, len=response.stories.length; i < len; ++i) {
                        var story = response.stories[i];
                        var title = story.title;
                        var completeText = story.completed ? 'Complete' : 'Incomplete';
                        var completeClass = story.completed ? 'storycomplete' : 'storyincomplete';
                        var storyHtml = '<div class="storyholder" user=' + htmlEncode(story.owner) + ' storyId=' + htmlEncode(story.storyId) +
                                            '<span class="storytitle leftfloat">' + htmlEncode(story.title) + '</span>' +
                                            '<div class="rightfloat">' +
                                                '<span class="' + completeClass + '">' + completeText +
                                            '</div>' +
                                            '<div class="clearfloats"/>' +
                                            '<div>&nbsp</div>' +
                                            '<div class="storycontent">' + htmlEncode(story.firstSection) + '...</div>' +
                                            '<div>&nbsp</div>' +                                            
                                            '<span class="like" storyId=' + htmlEncode(story.storyId) + '"> Like?</span>' + 
                                            '<span>' + htmlEncode(story.numlikes) + ' people like this story </span>' +                                            
                                        '</div>'
                        $('#storywindow').append(storyHtml);
                        document.storyRenderer.storySummaryHandler();
                    }                    
                    
                    var seeMore = '<div class="rightfloat">' +
                                      '<a href="/userstories/' + htmlEncode(story.owner) + '/1/popularity/DESC">See more</a>' +
                                  '</div>' +
                                  '<div class="clearfloats"/>'
                    $('#storywindow').append(seeMore);
                } else {
                    $('#storywindow').append('This user has no stories, Sorry!');
                }
            })
        });
    }
    
    function htmlEncode(value){
        return value ? $('<div/>').text(value).html() : '';        
    }
    
    handlePhotoClick();
}