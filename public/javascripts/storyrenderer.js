$(document).live("facebook:ready", function() {
    document.storyRenderer = new StoryRenderer();    
});
function StoryRenderer() {
    that = this;
    
    function ensureLoggedOnMatches() {
        if (!$('#loggedOnServerSide').length) {
            return;
        }

        if ($('#loggedOnServerSide').attr('isLoggedOn') === 'false') {
            document.facebookWrapper.checkStatus();
        }
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
                window.location = '/userstories/1/' + sortOrder + '/' + sortDirection + '?user=' + user;
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
                window.location = '/userstories/1/' + sortOrder + '/' + sortDirection + '?user=' + user;
            } else {
                window.location = '/allstories/1/' + sortOrder + '/' + sortDirection;
            }
        });
    }

    function sendHandler() {
        var sendStory = $('.sendstory');
        sendStory.click(function() {
            FB.ui({
                method: 'send',
                name: 'TalePipe - Send it on',
                link: 'http://thetalepipe.com/stories/' + sendStory.attr("storyId")
            });
        })
    }
    
    function pagingHandler() {
        function goToPage(element, page) {
            var user = element.attr('userId');
            var neverending = element.attr('neverending');
            var sortOrder = element.attr('sortOrder');
            var sortDirection = element.attr('currentDirection');
           
            if (neverending) {
                window.location = '/neverending/' + page;
            } else if (user) {
                window.location = '/userstories/' + page + '/' +sortOrder + '/' + sortDirection + '?user=' + user;
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
        $('.seemore').click(function(event) {
            event.stopPropagation();
            window.location = '/stories/' + $(this).attr('storyId');
        });
    }
    
    StoryRenderer.prototype.getContributors = function() {
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
                    var prefix = userElement.hasClass('noby') ? '' : 'By ';
                    userElement.text(prefix + userInfo.name);
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
    
    function addCountdownTimer() {
        var intervalId = -1;
        $.each($('#countdown'), function() {
            var twentyMinExpireTime = 1200000;
            var lockDate = new Date();
            lockDate.setTime($(this).attr('lockTime'));
            var expireTime = lockDate.getTime() + twentyMinExpireTime;
            var countDiv =  $(this)
            getTimeHtml(expireTime, countDiv);
            intervalId = setInterval(function() {
                getTimeHtml(expireTime, countDiv);
            }, 1000);
        });

        function getTimeHtml(expireTime, countdownDiv) {
            if (isNaN(expireTime)) {
                countdownDiv.html('00:00');
                return;
            }
            var timeUntilLockRelease = (expireTime - new Date())/1000;
            
            if (timeUntilLockRelease < 0) {                
                countdownDiv.html('00:00');
                clearInterval(intervalId);
                return;
            }
            var minutes = Math.floor(timeUntilLockRelease/60);
            var seconds = Math.floor(timeUntilLockRelease%60);
            var split = seconds < 10 ? ':0' : ':';
            countdownDiv.html(minutes + split + seconds);
        } 
    }

    function bringInSections() {
        var sections = $('.storysectionrow');

        var i = 0;
        var len = sections.length;
        function showSection() {
            if (i < len) {
                ++i;
                $(sections[i - 1]).slideDown('slow', function() {
                    setTimeout(showSection, 2000);
                })
            }
        }
        showSection();
    }

    ensureLoggedOnMatches();
    this.storySummaryHandler();
    sortingHandler();
    sendHandler();
    pagingHandler();
    hoverButtonHandler();
    this.getContributors();
    addCountdownTimer();
    //bringInSections();
}