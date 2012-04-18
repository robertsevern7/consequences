$(document).live("facebook:ready", function() {
    new FriendsRenderer();
});
function FriendsRenderer() {
    that = this;
    
    function loadFriends() {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {                
                var accessToken = response.authResponse.accessToken;
                
                $.post('/getfriends', {
                    accessToken: accessToken
                }, function(response) {
                    $('#friends').empty();
                    
                    if (response.friends.length) {
                        for (var i = 0, len=response.friends.length; i < len; ++i) {
                            var friend = response.friends[i];
                            var userHtml = '<div class="useridentifier noby" userId=' + htmlEncode(friend.id) + '/>' +
                                           '<img class="userimage pointer" userId="' + htmlEncode(friend.id) + '"/>' +
                                           '<div>&nbsp</div>'
                            
                            $('#friends').append(userHtml);
                        }
                        
                        handlePhotoClick();
                        document.storyRenderer.getContributors();
                    } else {
                        $('#friends').append('None of your friends have stories here, tell them about Consequences!');
                    }
                })
            } else {
                document.facebookWrapper.checkStatus();
            }
        });
    }
    
    function handlePhotoClick() {
        $('.userimage').click(function() {
            var userName = $(this).attr('userName')
            $.post('/topuserstories', {
                userId: $(this).attr('userId')
            }, function(response) {
                $('#storywindow').empty();
                
                if (response.stories.length) {
                    $('#storywindow').append('<h3>' + htmlEncode(userName) + '\'s Stories<h3>');
                    for (var i = 0, len=response.stories.length; i < len; ++i) {
                        var story = response.stories[i];
                        var title = story.title;
                        var completeText = story.completed ? 'Complete' : 'Incomplete';
                        var completeClass = story.completed ? 'storycomplete' : 'storyincomplete';
                        var storyHtml = '<div class="storyholder" user=' + htmlEncode(story.owner) + ' storyId=' + htmlEncode(story.storyId) + '>' +
                                            '<span class="storytitle leftfloat">' + htmlEncode(story.title) + '</span>' +
                                            '<div class="rightfloat">' +
                                                '<span class="' + completeClass + '">' + completeText + '</span>' +
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
                        document.storyRenderer.likeHandler();
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
    
    loadFriends();
}