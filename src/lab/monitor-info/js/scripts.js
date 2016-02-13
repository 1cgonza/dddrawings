(function () {
  'use strict';
  var container = document.getElementById('ddd-container');
  var loading   = document.getElementById('ddd-loading');

  var req     = new DREQ();
  var year    = 2008;
  var summary = {};
  var current;

  /*----------  SET STAGE  ----------*/
  var stage = createCanvas(container);
  stage.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  var stageW    = window.innerWidth;
  var stageH    = window.innerHeight;
  var centerX   = stageW / 2 | 0;
  var centerY   = stageH / 2 | 0;

  var summaryContainer = document.createElement('ol');
  summaryContainer.style.zIndex = '9999';
  summaryContainer.style.position = 'absolute';
  summaryContainer.style.top = '30px';
  summaryContainer.style.left = '30px';
  summaryContainer.style.lineHeight = '1.8';
  summaryContainer.style.fontSize = '12px';
  summaryContainer.style.margin = 0;
  container.appendChild(summaryContainer);

  yearsListMenu (2008, 2015, 2008, clickEvent, menuReady);

  function clickEvent (event) {
    if (event.target !== current) {
      loading.style.opacity = 1;
      summaryContainer.innerHTML = '';
      req.abort();
      resetCurrentClass(current, event.target);
      current = event.target;
      year = Number(event.target.textContent);
      loadData();
    }
  }

  function menuReady (menu, first) {
    container.appendChild(menu);
    current = first;
    loadData();
  }

  function loadData () {
    if ( summary.hasOwnProperty(year) ) {
      renderSummary();
    } else {
      req.getD('../../data/monitor/violencia-geo-' + year + '.json', dataReady);
    }
  }

  function dataReady (d) {
    categorizeEvents(d);
    renderSummary();
  }

  function categorizeEvents(d) {
    var totalVictimsKey = ' Total de Victimas en el año ' + year;
    var cats = {};
    cats[totalVictimsKey] = 0;

    for (var i = 0; i < d.length; i++) {
      var event = d[i];

      if ( Array.isArray(event.cat) ) {
        for (var j = 0; j < event.cat.length; j++) {
          var name = event.cat[j];

          if ( !cats.hasOwnProperty(name) ) {
            cats[name] = [];
            cats[name].total_victimas = 0;
          }

          if ( event.hasOwnProperty('total_v') ) {
            var count = Number(event.total_v);
            // global count
            cats[totalVictimsKey] += count;
            // category count
            cats[name].total_victimas += count;
          }

          cats[name].push( event );
        }
      } else {
        console.log(i, 'NOT ARRAY:', event);
      }
    }

    summary[year] = cats;
  }

  function renderSummary () {
    var d = sortObj( summary[year] );

    for (var category in d) {
      var ele;

      if ( Array.isArray( d[category] ) ) {
        ele = document.createElement('li');
        ele.textContent = category + ' | #Eventos: ' + d[category].length + ', #Victimas: ' + d[category].total_victimas;
        ele._ddd_category = category;
        ele.style.cursor = 'pointer';
        ele.style.color = '#777';
        ele.onclick = drawChart;
      } else {
        ele = document.createElement('h3');
        ele.textContent = category + ': ' + d[category];
      }

      summaryContainer.appendChild(ele);
    }

    loading.style.opacity = 0;
  }

  function drawChart (eve) {
    var category  = eve.target._ddd_category;
    var d         = summary[year][category];
    var timeStart = Date.parse(year + '-01-01 00:00:00');
    var timeEnd   = Date.parse(year + 1 + '-01-01 00:00:00');
    var step      = stageW / (timeEnd - timeStart);
    var y         = eve.target.offsetTop + 40;

    for (var i = 0; i < d.length; i++) {
      var timeEvent = d[i].hasOwnProperty('fecha_ini') ? Date.parse( d[i].fecha_ini ) : null;
      var victims = d[i].hasOwnProperty('total_v') ? Number( d[i].total_v ) : 0;
      var timeX = timeEvent - timeStart;

      stage.ctx.beginPath();
      stage.ctx.moveTo( timeX * step, y );
      stage.ctx.lineTo( timeX * step, y - victims );
      stage.ctx.stroke();
    }
  }

  function sortObj (obj, order) {
    var arr = [];
    var i;
    var ret = {};

    for ( var key in obj ) {
      arr.push(key);
    }

    arr.sort( function(a, b) {
      return a.toLowerCase().localeCompare( b.toLowerCase() );
    });

    if (order === 'desc') {
      for (i = arr.length - 1; i >= 0; i--) {
        ret[ arr[i] ] = obj[ arr[i] ];
      }
    } else {
      for (i = 0; i < arr.length; i++) {
        ret[ arr[i] ] = obj[ arr[i] ];
      }
    }

    return ret;
  }

})();