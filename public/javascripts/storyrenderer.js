$(document).live("facebook:ready", function() {
    new StoryRenderer();
});
function StoryRenderer() {
    that = this;
    
    function getContributors() {
        var contributors = [];
        $.each($('.useridentifier'), function() {
            contributors.push($(this).attr('userId'));
        });
        
        FB.api({
            method: 'fql.query',
            query: 'SELECT uid, name, pic_square FROM user WHERE uid IN (' + contributors.join(',') + ')'
        },
        function(response) {
            that.userInfoMap = {};
            $.each(response, function(id, userInfo) {
                that.userInfoMap[userInfo.uid] = userInfo;
            });
            
            $.each($('.useridentifier'), function() {
                var userElement = $(this);
                var userId = userElement.attr('userId');
                var userInfo = that.userInfoMap[userId];
                if (userInfo) {
                    userElement.text('By ' + userInfo.name);
                }
            });
            
            $.each($('.userimage'), function() {
                var imageElement = $(this);
                var userId = imageElement.attr('userId');
                var userInfo = that.userInfoMap[userId];
                if (userInfo) {
                    imageElement.attr("src", userInfo.pic_square);
                }
            });
        });
    }
    
    getContributors();
}