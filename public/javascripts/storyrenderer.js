$(document).live("facebook:ready", function() {
    document.storyRenderer = new StoryRenderer();
});
function StoryRenderer() {
    that = this;
    
    StoryRenderer.prototype.likeHandler = function() {
        $('.like').mouseenter(function() {
            $(this).addClass('likehover');
        }).mouseleave(function() {
            $(this).removeClass('likehover');
        }).click(function(event) {
            event.stopPropagation();
            $(this).css('background-color', '#64e886');
            $.post('/like', {
                storyId: $(this).attr('storyId')
            })
        });
    }
    
    function hoverButtonHandler() {
        $('.hoverbutton').mouseenter(function() {
            $(this).addClass('hovering');
        }).mouseleave(function() {
            $(this).removeClass('hovering');
        })
    }
    
    function sortingHandler() {
        $('.sortbutton').each(function() {
            var sortDiv = $(this);
            if (sortDiv.attr('currentSort') === sortDiv.attr('sort')) {
                sortDiv.addClass('selected');
            }
        });
        
        function switchOrder(sortDirection, element) {
            var sortOrder = element.attr('currentSort');
            var user = element.attr('user');
            if (user) {
                window.location = '/userstories/' + user + '/1/' + sortOrder + '/' + sortDirection;
            } else {
                window.location = '/allstories/1/' + sortOrder + '/' + sortDirection;
            }
        }
        
        $('.orderindicatorup').click(function() {
            switchOrder('DESC', $(this));           
        });
        
        $('.orderindicatordown').click(function() {
            switchOrder('ASC', $(this));           
        });
        
        $('.sortbutton').click(function() {   
            var switchSortDirection = $(this).hasClass('selected');
            var defaultSortDirection = $(this).attr('direction');
            var currentSortDirection = $(this).attr('currentDirection');
            var sortOrder = $(this).attr('sort');
            var sortDirection = defaultSortDirection;
            
            if (switchSortDirection) {            
                if (currentSortDirection === 'DESC') {
                    sortDirection = 'ASC';
                } else {
                    sortDirection = 'DESC';
                }
            }
            
            var user = $(this).attr('user');
        
            $('.sortbutton').removeClass('selected');
            $(this).addClass('selected');
            
            if (user) {
                window.location = '/userstories/' + user + '/1/' + sortOrder + '/' + sortDirection;
            } else {
                window.location = '/allstories/1/' + sortOrder + '/' + sortDirection;
            }
        });
    }
    
    function pagingHandler() {
        function goToPage(element, page) {
            var user = element.attr('userId');
            var sortOrder = element.attr('sortOrder');
            var sortDirection = element.attr('currentDirection');
           
            if (user) {
                window.location = '/userstories/' + user + '/' + page + '/' +sortOrder + '/' + sortDirection;
            } else {
                window.location = '/allstories/' + page + '/' + sortOrder + '/' + sortDirection;
            }
        }
    
        $('.firstButton').click(function() {
            goToPage($(this), 1);
        })
        
        $('.prevButton').click(function() {
            var currentPage = $(this).attr('currentPage') - 0;
            var goToP = Math.max(1, currentPage - 1);
            goToPage($(this), goToP);
        })
        
        $('.nextButton').click(function() {
            var currentPage = $(this).attr('currentPage') - 0;
            var totalPages = $(this).attr('totalPages') - 0;
            var goToP = Math.min(totalPages, currentPage + 1);
            
            goToPage($(this), goToP);
        })
        
        $('.lastButton').click(function() {
            var currentPage = $(this).attr('currentPage');
            var totalPages = $(this).attr('totalPages');          
            goToPage($(this), totalPages);
        })
    }
    
    StoryRenderer.prototype.storySummaryHandler = function() {
        $('.storyholder').click(function(event) {
            event.stopPropagation();
            window.location = '/stories/' + $(this).attr('user') + '/' + $(this).attr('storyId');
        });
    }
    
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
                    userElement.attr('userName', userInfo.name);
                }
            });
            
            $.each($('.userimage'), function() {
                var imageElement = $(this);
                var userId = imageElement.attr('userId');
                var userInfo = that.userInfoMap[userId];
                if (userInfo) {
                    imageElement.attr("src", userInfo.pic_square);
                    imageElement.attr('userName', userInfo.name);
                }
            });
        });
    }
    
    this.likeHandler();
    this.storySummaryHandler();
    sortingHandler();
    pagingHandler();
    hoverButtonHandler();
    getContributors();
}