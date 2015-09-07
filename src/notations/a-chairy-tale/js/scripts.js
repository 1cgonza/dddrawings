(function () {
  'use strict';
  var notesBTN = document.getElementById('notes');
  var notes = document.getElementById('box');
  var close = document.getElementById('close-box');
  var topMenuHeight = 0;
  var notationsData = [];
  var NotationsDocument = function() {
    this.pageWidth              = 1360;
    this.pageHeight             = 2070;
    this.pageMarginTop          = 112;
    this.pageMarginBottom       = 40;
    this.secondsPerPage         = 160;
    this.fps                    = 24;
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

  var timelineCanvas, timelineContext, timelineWrapper, timelineHeaderY, timelineImg, timelineImageX, timelineNewCurrentTime;
  var timelineLoaded = false;

  var notationsCanvas, notationsContext, notationsWrapper, notationsHeaderY, notationsImg, notationsImgY, notationsNewCurrentTime;
  var notationsLoaded = false;

  // 1. LOAD: JSON Data about notations
  requestData('../../data/notations/chairy-tale.json', loadNotationsData);

  function loadNotationsData(data) {
    notationsData = data.sections;
    notaionsInit();
    timelineInit();
    loadVideo();
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
      cancelAnimationFrame(videoState);
    }
  }

  function notationsState() {
    if (!timelineLoaded && !notationsLoaded) {
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
      notationsUpdate();
      requestAnimationFrame(playerLoop);
    }
  }

  function timelineInit() {
    // var tl = createCanvas( timelineContainer);
    timelineCanvas  = document.getElementById('timeline');
    timelineContext = timelineCanvas.getContext('2d');
    timelineWrapper = document.getElementById('middle-col');

    timelineHeaderY = 0;

    timelineSetImg();
  }

  function timelineSetImg() {
    timelineImg = new Image();
    timelineImg.addEventListener('load', function() {
      timelineUpdate();
      document.querySelector('#middle-col .loading').style.display = 'none';
      // $('#middle-col .loading').fadeOut();
      // $('#timeline').fadeIn('slow');
      timelineLoaded = true;
    });
    timelineImg.src = '../../img/notations/chairy-tale-small.jpg';
  }

  function timelineUpdate() {
    timelineCanvas.width  = timelineWrapper.offsetWidth;
    timelineCanvas.height = window.innerHeight - topMenuHeight;
    timelineImg.width     = timelineCanvas.width * (timelineCanvas.height / timelineImg.height);

    var timelineSinglePageH   = timelineCanvas.height / 4;
    var timelineInnerPageH    = newSizefromPercentage( options.innerPageHeightPercent, timelineSinglePageH );
    var timelineOffsetTop     = newSizefromPercentage( options.offsetTopPercent, timelineSinglePageH );
    var timelineOffsetBottom  = newSizefromPercentage( options.offsetBottomPercent, timelineSinglePageH );
    var timelineOneSecondSize = timelineInnerPageH / options.secondsPerPage;

    if (timelineCanvas.width > timelineImg.width) {
      timelineImageX = (timelineCanvas.width - timelineImg.width) / 2;
    } else {
      timelineImageX = 0;
    }

    for (var i = 0; i < notationsData.length; i++) {
      if ( i === 0 ) {
        timelineFirstIndex(timelineOneSecondSize, timelineOffsetTop);
      } else {
        if (v.currentTime > 38) {
          timelineNewCurrentTime = (v.currentTime - 38) * (550/548.96);

          var timelineSectionHead = notationsData[i-1].notedEndFrame / options.fps;
          var timelineSectionEnd  = notationsData[i].notedEndFrame / options.fps;

          if ( timelineNewCurrentTime >= timelineSectionHead && timelineNewCurrentTime <= timelineSectionEnd ) {
            timelineHeaderY = (timelineNewCurrentTime * timelineOneSecondSize) + (timelineOffsetTop * notationsData[i].page) + (30 * timelineOneSecondSize);

            if (notationsData[i].page > 1) {
              timelineHeaderY = timelineHeaderY + ( timelineOffsetBottom * (notationsData[i].page - 1) );
            }
          }
        }
      }
    }
    timelineDraw();
  }

  function timelineFirstIndex(oneSecondSize, offsetTop) {
    if ( v.currentTime <= 38 ) {
      timelineNewCurrentTime = v.currentTime * (30 / 38);
      timelineHeaderY = (timelineNewCurrentTime * oneSecondSize) + offsetTop;
    }
  }

  function timelineDraw() {
    timelineContext.clearRect(0, timelineHeaderY - 2, timelineCanvas.width, 4);
    timelineContext.drawImage(timelineImg, timelineImageX, 0, timelineImg.width, timelineCanvas.height );

    timelineContext.beginPath();
    timelineContext.moveTo(0, timelineHeaderY);
    timelineContext.lineTo(timelineCanvas.width, timelineHeaderY);
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
      var loader = document.querySelector('#right-col .loading');
      loader.style.display = 'none';
      // $('#notations').fadeIn('slow');
      notationsLoaded = true;
    });
    notationsImg.src = '../../img/notations/chairy-tale-notations.jpg';
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
    var leftW = document.getElementById('left-col').offsetWidth;
    var resizePercent = leftW / v.width * 100;
    v.width = leftW;
    v.height = newSizefromPercentage(resizePercent, v.height);
    timelineUpdate();
    notationsUpdate();
  }

  window.onresize = resizeElements;

  notesBTN.addEventListener('click', function (event) {
    event.preventDefault();
    notes.style.display = 'block';
  });

  close.addEventListener('click', function (event) {
    event.preventDefault();
    notes.style.display = 'none';
  });

})();