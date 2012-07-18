$(document).live("facebook:ready", function() {
    new FriendsRenderer();
});
function FriendsRenderer() {
    that = this;
    
    function loadFriends() {
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {                
                var accessToken = response.authResponse.accessToken;
                FB.api({
                    method: 'friends.getAppUsers',
                    access_token: accessToken
                }, function(users) {
                    $.post('/getfriends', {
                        users: users
                    }, function(response) {
                        $('#friends').empty();
                        
                        if (response.friends.length) {
                            for (var i = 0, len=response.friends.length; i < len; ++i) {
                                var friend = response.friends[i];
                                var userHtml = '<div class="useridentifier noby" userId=' + htmlEncode(friend.userId) + '/>' +
                                               '<img class="userimage pointer" userId=' + htmlEncode(friend.userId) + ' clickId="' + htmlEncode(friend.id) + '"/>' +
                                               '<div>&nbsp</div>'
                                
                                $('#friends').append(userHtml);
                            }
                            
                            handlePhotoClick();
                            document.storyRenderer.getContributors();
                        } else {
                            $('#friends').append('None of your friends have stories here, tell them about TalePipe!');
                        }
                    });
                });
            }
        });
    }
    
    function handlePhotoClick() {
        $('.userimage').click(function() {
            var userName = $(this).attr('userName');
            var userId = $(this).attr('clickId');
            $.post('/topuserstories', {
                user: userId
            }, function(response) {
                $('#storywindow').empty();
                
                if (response.stories.length) {
                    $('#storywindow').append('<h3>' + htmlEncode(userName) + '\'s Stories<h3>');
                    for (var i = 0, len=response.stories.length; i < len; ++i) {
                        var story = response.stories[i];
                        var title = story.title;
                        var completeText = story.completed ? 'Complete' : 'Incomplete';
                        var completeClass = story.completed ? 'storycomplete' : 'storyincomplete';                        
                        var numlikes = story.numlikes + '';
                        var storyHtml = '<div class="storyholder" user=' + htmlEncode(userId) + ' storyId=' + htmlEncode(story.id) + '>' +
                                            '<span class="storytitle leftfloat">' + htmlEncode(story.title) + '</span>' +
                                            '<div class="rightfloat">' +
                                                '<span class="' + completeClass + '">' + completeText + '</span>' +
                                            '</div>' +
                                            '<div class="clearfloats"/>' +
                                            '<div>&nbsp</div>' +
                                            '<div class="storycontent">' + htmlEncode(story.firstSection) + '...</div>' +
                                            '<div>&nbsp</div>' +
                                            '<div class="seemore" storyId=' + htmlEncode(story.id) + '>See More</div>' +
                                            '<fb:like class="like" data-send="true" data-width="450" data-show-faces="false" href="http://thetalepipe.com/stories/' + story.id + '" storyId=' + story.id + '/>' +
                                        '</div>'
                        $('#storywindow').append(storyHtml);
                       
                        FB.XFBML.parse(); 
                        document.storyRenderer.storySummaryHandler();                                               
                    }                    
                    
                    var href = '/userstories/1/popularity/DESC?user=' + userId;
                    var seeMore = '<div class="rightfloat">' +
                                      '<a href="' + href + '">See More</a>' +
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