$(document).ready(function(){
  function facebookReady(){
    FB.init({
      appId: '479013118782003',
      status: true, 
      cookie: true,
      xfbml: true,
      oauth: true
    });
    $(document).trigger("facebook:ready");
  }

  if(window.FB) {
    facebookReady();
  } else {
    window.fbAsyncInit = facebookReady;
  }

  $('#otherStoriesTab').click(function() {
      window.location = '/allstories/1/popularity/DESC';
  })
});

$(document).live("facebook:ready", function(){
    document.facebookWrapper = new FacebookWrapper();
    document.facebookWrapper.startLoginListener();
    
    FB.Event.subscribe('edge.create',
        function(response) {
            var storyIdStart = response.lastIndexOf('/') + 1;
            var storyId = response.substring(storyIdStart, response.length);
            $.post('/like', {
                storyId: storyId
            })            
        }
    );
});