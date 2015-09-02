(function() {
  'use strict';

  $(function() {
    var topMenuHeight = 50;
    var notationsData = [];
    var NotationsDocument = function() {
      this.notationsArea     = 1689;
      this.areaOffLeft       = 165;
      this.areaOffTop        = 214;
      this.pageWidth         = 1874;
      this.pageHeight        = 1023;
      this.pageMarginTop     = 95;
      this.pageMarginBottom  = 17;
      this.fps               = 24;
      this.offsetLeftPercent = this.areaOffLeft / this.pageWidth * 100;

      this.innerPageHeight        = this.pageHeight - this.pageMarginTop - this.pageMarginBottom;
      this.innerPageHeightPercent = this.innerPageHeight / this.pageHeight * 100;
      this.oneSecondSize          = this.innerPageHeight / this.secondsPerPage;
      this.oneSecondPercent       = this.oneSecondSize / this.pageHeight * 100;
      this.offsetTopPercent       = this.pageMarginTop / this.pageHeight * 100;
      this.offsetBottomPercent    = this.pageMarginBottom / this.pageHeight * 100;
    };
    var options = new NotationsDocument();

    // Set globally the video player and two canvases that will communicate with each other.
    var v;

    var timelineCanvas, timelineContext, timelineWrapper, timelineHeaderX, timelineImg, timelineImageX, timelineNewCurrentTime;
    var timelineLoaded = false;

    var notationsCanvas, notationsContext, notationsWrapper, notationsHeaderY, notationsImg, notationsImgY, notationsNewCurrentTime;
    var notationsLoaded = false;

    // 1. LOAD: JSON Data about notations
    loadNotationsData();


    function loadNotationsData() {
      $.getJSON('/javascripts/bug-goes-to-town.json', function( data ) {
        notationsData = data.sections;
      }).done( function() {
        // notaionsInit();
        timelineInit();
        loadVideo();
      }).fail( function() {
        console.log('Error loading data.');
      });
    }

    function loadVideo() {
      v = document.getElementById('video');

      // Make sure the video is the correct size to fit the column.
      resizeElements();

      // Wait until video is ready to play.
      videoState();
    }

    function videoState() {
      if (v.readyState < 4) {
        console.log('Checking video state...');
        requestAnimationFrame(videoState);
      } else {
        console.log('The video is ready.');
        notationsState();
        // cancelAnimationFrame(videoState);
      }
    }

    function notationsState() {
      if (!timelineLoaded) {
        requestAnimationFrame(notationsState);
      } else {
        v.controls = true;

        v.addEventListener('play', function() {
          playerLoop();
        }, false);

        v.addEventListener('seeking', function() {
          playerLoop();
        }, false);
      }
    }

    function playerLoop() {
      if (!v.paused || v.seeking) {
        timelineUpdate();
        // notationsUpdate();
        requestAnimationFrame(playerLoop);
      }
    }

    function timelineInit() {
      timelineCanvas  = document.getElementById('timeline');
      timelineContext = timelineCanvas.getContext('2d');
      timelineWrapper = document.getElementById('middle-col');
      timelineSetImg();
    }

    function timelineSetImg() {
      timelineImg = new Image();
      timelineImg.addEventListener('load', function() {
        timelineUpdate();
        $('#middle-col .loading').fadeOut();
        $('#timeline').fadeIn('slow');
        timelineLoaded = true;
      });
      timelineImg.src = '/images/notations/bug-goes-to-town.jpg';
    }

    function timelineUpdate() {
      timelineCanvas.width  = timelineWrapper.offsetWidth;
      timelineCanvas.height = window.innerHeight - topMenuHeight;
      timelineImg.width     = timelineCanvas.width;

      var pageScalePercent  =  timelineCanvas.width / options.pageWidth * 100;
      timelineImg.height    = newSizefromPercentage( pageScalePercent, options.pageHeight );

      var offsetLeft = newSizefromPercentage( options.offsetLeftPercent, timelineImg.width );
      var area = newSizefromPercentage( pageScalePercent, options.notationsArea );
      var timeStep = 1027 / v.duration;
      timelineHeaderX = (v.currentTime * timeStep) + offsetLeft;
      // console.log(area + ' - ' + v.duration + ' - ' + timelineHeaderX);
      // var timelineInnerPageH    = newSizefromPercentage( options.innerPageHeightPercent, timelineSinglePageH );
      // var timelineOffsetTop     = newSizefromPercentage( options.offsetTopPercent, timelineSinglePageH );
      // var timelineOffsetBottom  = newSizefromPercentage( options.offsetBottomPercent, timelineSinglePageH );
      // var timelineOneSecondSize = timelineInnerPageH / options.secondsPerPage;

      // for (var i = 0; i < notationsData.length; i++) {
      //   timelineHeaderX = (timelineNewCurrentTime * oneSecondSize) + offsetTop;
      // }
      timelineDraw(offsetLeft);
    }

    function timelineDraw(offsetLeft) {
      // timelineContext.clearRect(0, timelineHeaderY - 2, timelineCanvas.width, 4);
      timelineContext.drawImage(timelineImg, 0, 0, timelineImg.width, timelineImg.height );
      // console.log(v.currentTime);
      timelineContext.beginPath();
      timelineContext.moveTo(timelineHeaderX, 0);
      timelineContext.lineTo(timelineHeaderX, 500);
      timelineContext.strokeStyle = '#fe0404';
      timelineContext.stroke();
    }

    /*=================================
    =            NOTATIONS            =
    =================================*/

    function notaionsInit() {
      notationsCanvas  = document.getElementById('notations');
      notationsContext = notationsCanvas.getContext('2d');
      notationsWrapper = document.getElementById('right-col');
      notationsSetImage();
    }

    function notationsSetImage() {
      notationsImg = new Image();
      notationsImg.addEventListener('load', function() {
        notationsUpdate();
        $('#right-col .loading').fadeOut();
        $('#notations').fadeIn('slow');
        notationsLoaded = true;
      });
      notationsImg.src = '/images/notations/chairy-tale-notations.jpg';
    }

    function notationsUpdate() {
      notationsCanvas.width  = notationsWrapper.offsetWidth;
      notationsCanvas.height = window.innerHeight - topMenuHeight;

      var notationsImgNewW       = notationsCanvas.width;
      var notationsImgWidthScale = notationsImgNewW / notationsImg.width * 100;
      var notationsImgNewH       = newSizefromPercentage( notationsImgWidthScale, notationsImg.height ) / 4;
      var notationsInnerPageH    = newSizefromPercentage( options.innerPageHeightPercent, notationsImgNewH );
      var notationsOffsetTop     = newSizefromPercentage( options.offsetTopPercent, notationsImgNewH );
      var notationsOffsetBottom  = newSizefromPercentage( options.offsetBottomPercent, notationsImgNewH );
      var notationsOneSecondSize = notationsInnerPageH / options.secondsPerPage;

      notationsHeaderY = notationsCanvas.height / 2;

      for (var i = 0; i < notationsData.length; i++) {
        if ( i === 0 ) {
          notationsFirstIndex(notationsOneSecondSize, notationsOffsetTop);
        } else {
          notationsNewCurrentTime = (v.currentTime - 38) * (550/548.96);

          var sectionHead = notationsData[i-1].notedEndFrame / options.fps;
          var sectionEnd = notationsData[i].notedEndFrame / options.fps;

          if ( notationsNewCurrentTime >= sectionHead && notationsNewCurrentTime <= sectionEnd ) {
            notationsImgY = (notationsNewCurrentTime * notationsOneSecondSize) +
            (notationsOffsetTop * notationsData[i].page) +
            (30 * notationsOneSecondSize) - //add the first section that has 30 seconds label but lasts 38 in the video.
            notationsHeaderY;

            if (notationsData[i].page > 1) {
              notationsImgY = notationsImgY + ( notationsOffsetBottom * (notationsData[i].page - 1) );
            }
          }
        }
      }

      notationsDraw();
    }

    function notationsFirstIndex(oneSecondSize, offsetTop) {
      if ( v.currentTime <= 38 ) {
        notationsNewCurrentTime = v.currentTime * (30 / 38);
        notationsImgY = (notationsNewCurrentTime * oneSecondSize) + offsetTop - notationsHeaderY;
      }
    }

    function notationsDraw() {
      notationsContext.drawImage( notationsImg, 0, -notationsImgY, notationsCanvas.width, notationsImg.height * (notationsCanvas.width / notationsImg.width));

      notationsContext.beginPath();
      notationsContext.moveTo(0, notationsHeaderY);
      notationsContext.lineTo(notationsCanvas.width, notationsHeaderY);
      notationsContext.strokeStyle = '#fe0404';
      notationsContext.stroke();
    }

    /*-----  End of NOTATIONS  ------*/

    function resizeElements() {
      var resizePercent = $('#left-col').width() / v.width * 100;
      v.width = $('#left-col').width();
      v.height = newSizefromPercentage(resizePercent, v.height);
      // timelineUpdate();
      // notationsUpdate();
    }

    window.onresize = resizeElements;

  });
  $('#description nav a').on('click', function() {
    $('.box').css('display', 'block');
  });

  $('#close a').on('click', function() {
    $('.box').css('display', 'none');
  });

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

function newSizefromPercentage(percent, totalSize) {
  var newSize = percent / 100 * totalSize;
  return newSize;
}