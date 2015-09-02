(function() {
  'use strict';

  /*==================================
  =            NAVIGATION            =
  ==================================*/
  $('#top a#films').on('click', function(event){
    event.preventDefault();
    $(this).toggleClass('on');
    $('#films-nav').addClass('on');
  });

  $('#films-nav .close a').on('click', function(event) {
    event.preventDefault();
    $('#films-nav').removeClass('on');
  });

  $(document).mouseup(function (event) {
    var container = $('#films-nav');
    // Not the container or its descendants
    if (!container.is(event.target) && container.has(event.target).length === 0  && container.hasClass('on') ){
      container.removeClass('on');
    }
  });

  /*-----  End of NAVIGATION  ------*/

}());