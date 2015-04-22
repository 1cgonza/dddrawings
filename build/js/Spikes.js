(function() {
  var $container = $('#ddd-container');
  var svg;
  var eqData = [];
  var taData = [];
  var eqNode, taNode, taSpike;
  var thisNode, thisPoly;

  var yearEnd, yearLength, secondsW, eventDate, dReset, rot;
  var selectedYear;

  var dateAttack, yearAttack;

  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;

  var options = {
    year : 1993,
    radius : 150,
    nodeWidth : 15,
    opacity : 0.5,
    powOf : 2,
    dividedBy : 1,
    highMagnitude : '#1f8846',
    lowMagnitude : '#A16E15',
    taColor : '#c03717',
    taSize : 120,
    rangeStart : 0,
    rangeEnd : 7
  };
  var yearsStart = 1993;
  var yearsEnd = 2014;
  var years = [];
  var firstLoadCheck = false;

  init();

  function init() {
    loadData();
  }

  /*=================================
  =            LOAD DATA            =
  =================================*/
  function loadData() {
    d3.json('/data/ingeominas/eq' + options.year + '.json', function (eqError, eqData) {
      if (eqError) {
        console.log(eqError);
      } else {
        defineEqData(eqData);

        d3.json('/data/cmh/ta.json', function (taError, taData) {
          if ( taError ) {
            console.log(taError);
          } else {
            defineTaData(taData);
          }
          if ( !firstLoadCheck ) {
            firstLoad();
          } else {
            eqNodeUpdate();
            eqNodeChangeRange();
            taNodeUpdate();
          }
        });
      }
    });
  }

  function defineEqData(data) {
    yearEnd = Number(options.year) + 1;
    yearLength = ( Date.parse(yearEnd) - Date.parse(options.year) ) * 0.001;
    secondsW = 360 / yearLength;

    eqData = data;
  }

  function defineTaData(data) {
    // Build an array of objects for every year available. Set intensity at 0 first.
    for( var i=yearsStart; i<yearsEnd+1; i++) {
      years.push( { year: i, intensity: 0} );
    }
    //
    for( var j = 0; j < data.length; j++ ) {
      dateAttack = new Date( data[j].date );
      yearAttack = dateAttack.getFullYear();
      //
      for ( var ii = 0; ii < years.length; ii++ ) {
        if ( yearAttack === yearsStart + ii ) {
          years[ii].intensity = years[ii].intensity + 1;
        }
      }
      // Get only the data of the attacks for the selected year. This way we can create the right ammount of nodes in d3 by simply using "selectAll".
      if ( yearAttack === Number( options.year ) ) {
        taData.push( data[j] );
      }
    }
    //
    d3.select('.loading').transition().style('opacity', '0');
  }

  /*-----  End of LOAD DATA  ------*/

  function firstLoad() {
    $container.append('<div id="info"></div>');
    yearsMenu();
    notations();
    magnitudeSlider();
    radiusSlider();
    opacitySlider();
    logScaleSliders();
    dividedbySliders();
    firstLoadCheck = true;
  }

  function notations() {
    svg = d3.select('#ddd-container')
      .append('svg')
      .attr('class', 'eqta')
      .attr('width', screenWidth)
      .attr('height', screenHeight);

    taRender();
    eqRender();
  }

  function redraw() {
    eqNodeColor('#a7977a', '#6f7d74');
    taNodeColor('#c1978d');
    eqData = [];
    taData = [];
    init();
  }

  /*============================
  =            MENU            =
  ============================*/
  function yearsMenu() {
    var yearsList =  d3.select('#ddd-container')
          .insert('ul', ':first-child')
          .attr('id', 'years')
          .selectAll('#years li')
          .data(years)
          .enter()
          .append('li')
          .style('border-bottom', function(d) {
            return d.intensity + 'px solid rgba(192, 55, 23, 0.2)';
          })
          .text( function(d) { return d.year; } );

    d3.select('#years li').attr('class', 'current');

    yearsList.on('click', function(d) {
      selectedYear = d3.select(this);
      if ( !selectedYear.classed('current') ) {
        d3.select('.loading').style('opacity', '1');
        options.year = d.year;
        d3.selectAll('#years li').classed('current', false);
        selectedYear.classed('current', true);
        redraw();
      }
    });
  }

  /*-----  End of MENU  ------*/


  /*===============================
  =            SLIDERS            =
  ===============================*/
  function radiusSlider() {
    // Check if the div exists, otherwise create it.
    if ( !$('#slider-radius').length ) {
      $container.append('<div id="slider-radius"><span class="slider-values"></span></div>');
    }

    $( '#slider-radius' ).slider({
      orientation: 'horizontal',
      animate: 'fast',
      range: "min",
      min: 0,
      max: 300,
      value: options.radius,
      slide: function( event, ui ) {
        options.radius = ui.value;
        $('#slider-radius .slider-values').text('Radius: ' + options.radius + 'px');
        eqNodeTransform();
        taNodeTransform();
      }
    });
    $( '#slider-radius .slider-values' ).text('Radius: ' + options.radius + 'px');
  }

  function magnitudeSlider() {
    if ( !$('#slider-magnitude').length ) {
      $container.append('<div id="slider-magnitude"><span class="slider-values"></span></div>');
    }

    $( '#slider-magnitude' ).slider({
      orientation: 'horizontal',
      animate: 'fast',
      range: true,
      min: options.rangeStart,
      max: options.rangeEnd,
      step: 0.1,
      values: [ options.rangeStart, options.rangeEnd ],
      slide: function( event, ui ) {
        options.rangeStart = ui.values[0];
        options.rangeEnd = ui.values[1];
        $( '#slider-magnitude .slider-values' ).text( options.rangeStart + ' - ' + options.rangeEnd + ' Ml' );
        eqNodeChangeRange();
      }
    });
    $( '#slider-magnitude .slider-values' ).text(options.rangeStart + ' - ' + options.rangeEnd + ' Ml');
  }

  function opacitySlider() {
    if ( !$('#slider-opacity').length ) {
      $container.append('<div id="slider-opacity"><span class="slider-values"></span></div>');
    }

    $( '#slider-opacity' ).slider({
      orientation: 'horizontal',
      animate: 'fast',
      range: 'min',
      min: 0.1,
      max: 1,
      step: 0.1,
      value: options.opacity,
      slide: function( event, ui ) {
        options.opacity = ui.value;
        $( '#slider-opacity .slider-values' ).text( 'Opacity: ' + options.opacity );
        eqNodeOpacity(options.opacity);
        taNodeOpacity(options.opacity);
      }
    });
    $( '#slider-opacity .slider-values' ).text( 'Opacity: ' + options.opacity );
  }

  function logScaleSliders() {
    if ( !$('#slider-powof').length ) {
      $container.append('<div id="slider-powof"><span class="slider-values"></span></div>');
    }

    $( '#slider-powof' ).slider({
      orientation: 'vertical',
      animate: 'fast',
      range: 'min',
      min: 0,
      max: 10,
      value: options.powOf,
      slide: function ( event, ui ) {
        options.powOf = ui.value;
        $( '#slider-powof .slider-values' ).text( 'Pow: ' + options.powOf );
        eqNodeDraw();
      }
    });
    $( '#slider-powof .slider-values' ).text( 'Pow: ' + options.powOf );
  }

  function dividedbySliders() {
    if ( !$('#slider-dividedby').length ) {
      $container.append('<div id="slider-dividedby"><span class="slider-values"></span></div>');
    }

    $( '#slider-dividedby' ).slider({
      orientation: 'vertical',
      animate: 'fast',
      range: 'min',
      min: 1,
      max: 10,
      value: options.dividedBy,
      slide: function ( event, ui ) {
        options.dividedBy = ui.value;
        $( '#slider-dividedby .slider-values' ).text( '/ by: ' + options.dividedBy );
        eqNodeDraw();
      }
    });
    $( '#slider-dividedby .slider-values' ).text( '/ by: ' + options.dividedBy );
  }

  /*-----  End of SLIDERS  ------*/

  /*==========================
  =            EQ            =
  ==========================*/
  function eqRender() {
    eqNode = svg.selectAll('.eq')
      .data(eqData)
      .enter()
      .append('polygon').attr('class', 'eq');

    eqNodeDraw();
    eqNodeColor(options.lowMagnitude, options.highMagnitude);
    eqNodeOpacity(options.opacity);
    eqNodeTransform();
  }

  function eqNodeDraw() {
    eqNode.attr('points', function(d) {
      var mag = Math.pow(options.powOf, d.ml) / options.dividedBy;
      //render all eqNode with same width and position. The height is dynamic
      return 0 + ',' + 0 + ' ' + options.nodeWidth + ',' + 0 + ' ' + options.nodeWidth / 2 + ',' + -( mag );
    });
  }

  function eqNodeUpdate() {
    d3.selectAll('.eq').remove();
    eqRender();
  }

  function eqNodeChangeRange() {
    eqNode.each( function(d) {
      var thisEqNode = d3.select(this);
      if ( !( d.ml >= options.rangeStart && d.ml <= options.rangeEnd ) ) {
        thisEqNode.style('opacity', '0');
      } else {
        thisEqNode.style('opacity', options.opacity);
      }
    });
  }

  function eqNodeColor(lowMagnitude, highMagnitude) {
    eqNode.attr('fill', function(d) {
      var nodeColor = highMagnitude;
      if (d.ml < 6) {
        nodeColor = lowMagnitude;
      }
      return nodeColor;
    });
  }

  function eqNodeOpacity(opacity) {
    eqNode.style('opacity', opacity);
  }

  function eqNodeTransform() {
    eqNode.attr('transform', function(d) {
      eventDate = Date.parse(d.utc) * 0.001;
      dReset = eventDate - (Date.parse(options.year)*0.001);

      rot = dReset * secondsW;

      //Now that the eqNode are rendered, first translate all together, then rotate using 3 param: degrees, x axis and y. The y amount gives us the radius of the circle.
      // return 'translate(' + (screenWidth/2 - options.nodeWidth/2) + ',' + (screenHeight/2 - options.radius) + ') rotate(' + i*(360 / dataLength) + ',' + options.nodeWidth/2 + ',' + options.radius +')';
      return 'translate(' + (screenWidth/2 - options.nodeWidth/2) + ',' + (screenHeight/2 - options.radius) + ') rotate(' + rot + ',' + options.nodeWidth/2 + ',' + options.radius +')';
    });
  }

  /*-----  End of EQ  ------*/

  /*==========================
  =            TA            =
  ==========================*/
  function taRender() {
    taNode = svg.selectAll('.ta')
      .data(taData)
      .enter()
      .append('g')
      .attr('class', 'ta');

    taSpike = taNode.append('polygon');

    taNodeDraw();
    taNodeColor(options.taColor);
    taNodeOpacity(options.opacity);
    taNodeTransform();
    taNodeMouseEvents();
  }

  function taNodeDraw() {
    taSpike.attr('points', function(d){
      var impact = options.taSize + Number(d.fatal*5) + Number(d.injured);
      //render all spikes with same width and position. The height is dynamic
      return 0 + ',' + 0 + ' ' + options.nodeWidth + ',' + 0 + ' ' + options.nodeWidth / 2 + ',' + -impact;
    });
  }

  function taNodeUpdate() {
    d3.selectAll('.ta').remove();
    taRender();
  }

  function taNodeColor(taColor) {
    taSpike.attr('fill', taColor);
  }

  function taNodeOpacity(opacity) {
    taSpike.style('opacity', opacity);
  }

  function taNodeTransform() {
    taNode.attr('transform', function(d) {
      yearEnd = options.year + 1;
      yearLength = (Date.parse(yearEnd) - Date.parse(options.year)) * 0.001;
      secondsW = 360 / yearLength;

      eventDate = Date.parse(d.date) * 0.001;
      dReset = eventDate - (Date.parse(options.year)*0.001);

      rot = dReset * secondsW;

      //Now that the spikes are rendered, first translate all together, then rotate using 3 param: degrees, x axis and y. The y amount gives us the radius of the circle.
      return 'translate(' + (screenWidth/2 - options.nodeWidth/2) + ',' + (screenHeight/2 - options.radius) + ') rotate(' + rot + ',' + options.nodeWidth/2 + ',' + options.radius +')';
    });
  }

  function taNodeMouseEvents() {
    var infoBox;
    taNode.on('mouseover', function(d) {
      thisNode = d3.select(this);
      thisPoly = thisNode.select('polygon');
      infoBox = d3.select('#info');

      if ( d.date    !== '' ) { infoBox.append('p').text('Fecha: ' + d.date); }
      if ( d.by      !== '' ) { infoBox.append('p').text('Quien: ' + d.by); }
      if ( d.dep     !== '' ) { infoBox.append('p').text('Departamento: ' + d.dep); }
      if ( d.mun     !== '' ) { infoBox.append('p').text('Municipio: ' + d.mun); }
      if ( d.place   !== '' ) { infoBox.append('p').text('Lugar: ' + d.place); }
      if ( d.fatal   !== null ) { infoBox.append('p').text('Victimas Fatales: ' + d.fatal); }
      if ( d.injured !== null ) { infoBox.append('p').text('Heridos: ' + d.injured); }
      if ( d.source  !== '' ) { infoBox.append('p').text('Fuente: ' + d.source); }

      thisPoly.style('opacity', 1);

    })

    .on('mouseout', function() {
      infoBox.selectAll('p').remove();
      thisPoly.style('opacity', options.opacity);
    });

  }

  /*-----  End of TA  ------*/

  /*==============================
  =            RESIZE            =
  ==============================*/
  function resize() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    redraw();
  }

  window.onresize = resize;

  /*-----  End of RESIZE  ------*/
})();
