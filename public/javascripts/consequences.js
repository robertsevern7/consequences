$(document).ready(function(){
  function facebookReady(){
    FB.init({
      appId  : '341867209202847',
      status : true,
      cookie : true,
      xfbml  : true
    });
    $(document).trigger("facebook:ready");
  }

  if(window.FB) {
    facebookReady();
  } else {
    window.fbAsyncInit = facebookReady;
  }
});

$(document).live("facebook:ready", function(){
    var facebookWrapper = new FacebookWrapper();
    facebookWrapper.startLoginListener();
});