(function (angular) {
  'use strict'

  /**
    Streamgraph
  **/

  angular
    .module('Streamgraph', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('Streamgraph')
    .component('streamgraph', {
      templateUrl: '../js/components/streamgraph/template.html',
      controller: StreamgraphCtrl,
      controllerAs: 'streamgraph',
      bindings: {
        datasource: '<',
        onSelect: '&',
        touchEnabled: '<?',
        live: '<?',
        replay: '<?'
      }
    })

  /* @ngInject */
  function StreamgraphCtrl($scope, $element, $translate, $attrs, d3, _, everpolate, isMobile) {
    var ctrl = this

    // TODO: move in main config
    // sampling rates minutes
    var samplingRate = 5
    var beSamplingRate = 3

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    // ctrl.$onInit = init
    ctrl.$onChanges = update

    $scope.$on('streamgraph:select', function(e,k) {
      svg.selectAll('.layer')
         .transition()
         .duration(250)
         .attr('opacity', function(d, i) {
            if (k == 'all') return 1
            return d.key == k ? 1 : .3
          })
    })

    // -------- CALLBACK ---------
    var _callback = null
    var touchEnabled = true

    // discarding timezone makes data apper to the relevant hour at every timezone
    // so for example hong kong data are displayed at the proper hours even if
    // timezone on frontend changes
    var format = d3.time.format('%Y-%m-%dT%H:%M:%S')

    // -------- SVG ELEMENTS ---------
    var svg, chart, box, w, h, vp,                                        // svg config
        axX, lnX,                                                         // axis and scales config
        cursor, areas, clipMask, overlays,
        lyOrder = '', lyOffset = 'silhouette', lyInterpolation = 'basis', // chart paths config
        delay = 1000, duration = 3000, ease = 'exp-out',                  // animation config
        enelCursor = {                                                    // brand cursor
          width: 15,
          height: 52.5
        },
        vertical, tooltip
    // tooltip data object
    ctrl.tooltipv = {}

    // -------- COLORS ---------
    var colorrange = ['#077249','#008C5A','#11965A', '#22A05A', '#33AA5A','#44B45A']

    // -------- SCALES ---------
    var X    = d3.time.scale()
    var Y    = d3.scale.linear()
    var YInv = d3.scale.linear()
    var Z    = d3.scale.ordinal()

    // -------- AXIS ---------
    var xAxis = d3.svg.axis()
                  .scale(X)
                  .orient('top')
                  .ticks(d3.time.hours)
    var xLine = d3.svg.axis()
                  .scale(X)
                  .orient('top')
                  .ticks(d3.time.hours)
                  .tickFormat('')

    // -------- STACK ---------
    var stack = d3.layout.stack()
                  .offset(lyOffset)
                  .order(lyOrder)
                  .values(function(d) { return d.values })
                  .x(function(d) { return d.date })
                  .y(function(d) { return d.value })
    var nest = d3.nest()
                 .key(function(d) { return d.key })

    // -------- STACKED AREAS ---------
    var area = d3.svg.area()
                 .interpolate(lyInterpolation)
                 .x(function(d) { return X(d.date) })
                 .y0(function(d) { return Y(d.y0) })
                 .y1(function(d) { return Y(d.y0 + d.y) })

    // overlays should contaign a percentage of availability
    // this percentage should be grouped by overlay area interval
    var overlayArea = d3.svg.area()
                       .interpolate('step')
                       .x(function(d) { return X(d.date) })
                       .y0(function(d) { return Y(0) })
                       .y1(function(d) {
                        if (d.dap < 1) return 0 // 50
                        return Y(0)
                       })

    function _interpolateInitialData(data) {
      var groups   = _.groupBy(data, 'key')
      var values   = _(data).groupBy('date').map(function(d){ return _.sumBy(d,'value') }).value()
      var maxTotal = d3.max(values)
      var layers   = _.keys(groups).length
      _.each(groups, function (group) {
        var interpolateData = _interpolateGroup(group, maxTotal, layers)
      })
      return data
    }
    function _interpolateGroup(data, maxTotal, layers) {
      YInv.range([0, maxTotal])
          .domain([h-vp, vp])
      var offset = YInv(enelCursor.height-(2*vp))/((h-2*vp)/enelCursor.height)
      var initialValue = offset/layers
      var hoursToChange = 1.5
      var times = (hoursToChange*60) / samplingRate // sampling rate
      if (!(times < data.length)) times = data.length -1
      var dataToChange = _.take(data, times)
      _.times(times, function(x){
        dataToChange[x].value = Math.round(everpolate.linear(x, [0, times], [initialValue,  data[times].value])[0]*100)/100
      })
    }

    var grads = '<defs id="gradients">' +
                '  <linearGradient id="stream_gr1" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="300">' +
                '    <stop offset="0%" stop-color="#3eae95"></stop>' +
                '    <stop offset="100%" stop-color="#4ab352"></stop>' +
                '  </linearGradient>' +
                '  <linearGradient id="stream_gr2" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="300">' +
                '    <stop offset="0%" stop-color="#32a28a"></stop>' +
                '    <stop offset="100%" stop-color="#3ea849"></stop>' +
                '  </linearGradient>' +
                '  <linearGradient id="stream_gr3" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="300">' +
                '    <stop offset="0%" stop-color="#2d987f"></stop>' +
                '    <stop offset="100%" stop-color="#329d3f"></stop>' +
                '  </linearGradient>' +
                '  <linearGradient id="stream_gr4" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="300">' +
                '    <stop offset="0%" stop-color="#298c74"></stop>' +
                '    <stop offset="100%" stop-color="#2e9232"></stop>' +
                '  </linearGradient>' +
                '  <linearGradient id="stream_gr5" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="300">' +
                '    <stop offset="0%" stop-color="#258069"></stop>' +
                '    <stop offset="100%" stop-color="#298725"></stop>' +
                '  </linearGradient>' +
                '  <linearGradient id="overlay_gr" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="300">' +
                '    <stop offset="0%" stop-color="rgba(111, 217, 194, .35)"></stop>' +
                '    <stop offset="100%" stop-color="rgba(120, 217, 124, .35)"></stop>' +
                '  </linearGradient>' +
                '</defs'

    function init() {
      console.log('init streamgraph')
      var data = ctrl.datasource
      var replay = ctrl.replay || false
      $element.find('svg').empty()
      $element.find('svg').html(grads)
      _callback = ctrl.onSelect()
      touchEnabled = _.isUndefined(ctrl.touchEnabled)? true : ctrl.touchEnabled

      // -------- INITIALIZE CHART ---------
      svg = d3.select($element.find('svg').get(0))
      box = svg.attr('viewBox').split(' ')
      w   = +box[2] -enelCursor.width -15 // width
      h   = +box[3]                       // height
      vp  = 15                            // vertical padding

      // tooltip elements
      tooltip = d3.select($element.find('.tooltip').get(0))
                  .style('visibility', 'hidden')
      vertical = d3.select($element.find('.vertical').get(0))
                   .style('visibility', 'hidden')

      // create container for chart
      chart = svg.append('g')
                 .attr('id', 'streamBox')
                 .attr('transform', 'translate(' + enelCursor.width + ',' + 0 + ')')

      // create wrap for overlays with retrieving data infos
      overlays = chart.append('g')
                      .attr('class', 'overlays')

      // create path for each area
      areas = chart.append('g')
                   .attr('class', 'chart')

      // Add 'curtain' rectangle to hide entire graph
      clipMask = chart.append('defs')
                      .attr('id', 'clipMasks')

      // create path for axis
      lnX = chart.append('g')
                 .attr('class', 'x axis line')
                 .attr('transform', 'translate(' + 0 + ',' + h + ')')
      axX = chart.append('g')
                 .attr('class', 'x axis')
                 .attr('transform', 'translate(' + 0 + ',' + h + ')')

      // create brand cursor
      cursor = svg.append('g')
                  .attr('id', 'cursor')
                  .append('rect')
                  .attr('height', enelCursor.height)
                  .attr('width', enelCursor.width)
                  .attr('x', 0)
                  .attr('y', (h/2)-(enelCursor.height/2))
    }

    function update(changedObj) {
      console.time('streamgraph')

      var data     = changedObj.datasource ? changedObj.datasource.currentValue : ctrl.datasource
      var replay   = changedObj.replay ? changedObj.replay.currentValue : ctrl.replay
      // !!
      // https://github.com/angular/angular.js/issues/14433
      // for some weird reason component $onChanges is called before $onInit
      // so we assume that if we don't have prevData the components is never being initialized
      init()
      console.log('update streamgraph')

      // -------- DATA MAP ---------
      var lastIdx = !_.isEmpty(data) ? d3.min(data, function(d) {return d.values.length}) : 0
      var values = _(data).groupBy('key').mapValues(function(d){return d[0].values.slice(0, lastIdx) }).merge().values().flatten().value()
      data = _.map(values, function(d) {
        d.date = format.parse(d.h)
        d.value = +d.v
        d.key = d.k
        return d
      })
      // initial interpolation to match brand cursor
      data = _interpolateInitialData(data)
      // create data layers
      var dataLayers = stack(nest.entries(data))

      console.log('Streamgraph data', data)
      console.log('Streamgraph data', dataLayers)

      // update scales domain and range
      var xDomain = d3.extent(data, function(d) { return d.date })
      var yDomain = [0, d3.max(data, function(d) { return d.y0 + d.y })]
      X.domain(xDomain).range([0, w])
      Y.domain(yDomain).range([h-vp, vp])
      Z.range(colorrange)

      // chart.select('defs')
      clipMask.selectAll('.layerClip')
              .data(dataLayers).enter()
              .append('clipPath')
              .attr('id', function(d,i) { return 'clipMask-'+(d.key) })
              .attr('class', 'layerClip')
              .append('rect')
              .attr('x', -1 * w)
              .attr('y', -1 * h+vp)
              .attr('height', h-vp)
              .attr('width', 0)
              .attr('transform', 'rotate(180)')

      // update charts
      areas.selectAll('.layer')
           .data(dataLayers).enter()
           .append('path')
           .attr('clip-path', function(d,i) { return 'url(#clipMask-'+(d.key)+')' })
           .attr('class', function(d,i) { return 'layer layer-'+(i+1) })
           .attr('d', function(d,i) { return area(d.values) })
           .attr('fill', function(d, i) { return 'url(#stream_gr'+(i+1)+')' })

      dataLayers = _.map(dataLayers, function(data) {
        var values = []
        for (var i = 0; i < data.values.length; i++) {
          var corrupted = []
          while (data.values[i] && data.values[i].dap < 1) {
            corrupted.push(data.values[i++])
          }
          if (!_.isEmpty(corrupted)) {
            var dapMean = Math.round(_.meanBy(corrupted, 'dap') * 100) / 100
            var middle = corrupted[Math.floor(corrupted.length / 2)]
            middle.timespan = moment(_.last(corrupted).h).diff(moment(_.first(corrupted).h),'hours',true)
            middle.dap = dapMean
            if (middle.timespan >= 1) values.push(middle)
          }
        }
        data.corrupted = values
        return data
      })

      // update overlays
      if (ctrl.live) {
        var layerOverlay = overlays.selectAll('.overlay')
             .data(dataLayers).enter()
             .append('g')
             .attr('class', function(d,i) { return 'overlay-wrap-'+(d.key) })

        layerOverlay.append('path')
          .attr('clip-path', function(d,i) { return 'url(#clipMask-'+(d.key)+')' })
          .attr('class', function(d,i) { return 'overlay overlay-'+(d.key) })
          .attr('d', function(d,i) { return overlayArea(d.values) })
          .attr('fill', function(d, i) { return 'url(#overlay_gr)' })
          .attr('opacity', .6)

        layerOverlay.each(function(d) {
          var textGroup = d3.select(this)
            .selectAll('.label-dap-sm')
            .data(d.corrupted).enter()
            .append('g')
            .attr('class', function(d,i) { return 'label-dap-sm label-'+(d.key) })
            .attr('opacity', 0)

          textGroup.append('image')
            .attr('href', '../assets/svgs/av-data.svg')
            .attr('width', 11)
            .attr('height', 11)
            .attr('x', function(d,i) { return X(d.date) -5 })
            .attr('y', h-52.5)

          var textWrap = textGroup.append('text')
            .attr('y', h-41.5)

          textWrap.append('tspan')
            .attr('x', function(d,i) { return X(d.date) })
            .attr('dy', '1.2em')
            .text(function(d,i) {
              var text = $translate.instant('dap_label', {'dap': d.dap*100}).split(' ')
              var tspan = text[0]+' '+text[1]
              return tspan
            })
          textWrap.append('tspan')
            .attr('x', function(d,i) { return X(d.date) })
            .attr('dy', '1.2em')
            .text(function(d,i) {
              var text = $translate.instant('dap_label', {'dap': d.dap*100}).split(' ')
              var tspan = text[2]+' '+text[3]
              return tspan
            })
          })
      }

      if (touchEnabled) _attachToolipEvents()

      // update axis data
      lnX.call(xLine.tickSize(h))
      axX.call(xAxis)

      // define transition
      if (replay) return clipMask.selectAll('.layerClip rect').attr('width', w)
      var t = svg.transition()
                 .ease(ease)
                 .duration(duration)
                 .delay(delay)
      // animate charts
      // // animation 1
      // cursor.attr('x', w)
      // t.select('#cursor rect').attr('x', 0)
      // t.select('#clipMask rect').attr('width', w)
      // animation 2
      clipMask.selectAll('.layerClip rect')
              .attr('x', 0)
      t.selectAll('.layerClip rect')
       .attr('width', w)
       .attr('x', -1 * w)
      // animation 3
      // var numOfLayers = _.keys(dataLayers).length
      // clipMask.selectAll('.layerClip rect')
      //      .attr('x', 0)
      // t.selectAll('.layerClip rect')
      //  .delay(function(d,i) { return delay * (-1 * i + numOfLayers)})
      //  .attr('width', w)
      //  .attr('x', -1 * w)

      console.timeEnd('streamgraph')
    }

    function _attachToolipEvents() {
      svg.selectAll('.layer')
         .attr('opacity', 1)
         .on('touchstart', function(d,i) {
            _showTooltip(d,i)
            _drawTooltip.bind(this)(d)
          })
         .on('mouseover', function(d,i) {
            _showTooltip(d,i)
            _drawTooltip.bind(this)(d)
          })
         .on('touchend',  function(d,i) { _hideTooltip(d,i) })
         .on('touchmove', function(d,i) { _drawTooltip.bind(this)(d) })
         .on('mousemove',  function(d,i) {
            _touchmove.bind(this)(true)
            _drawTooltip.bind(this)(d)
          })
         .on('mouseout',  function(d,i) { _hideTooltip(d,i) })
      d3.select('streamgraph')
        .on('touchstart', function() { _streamgraphTouch.bind(this)() })
        .on('touchmove',  function() { _touchmove.bind(this)() })
    }

    function _touchmove(isDesktop) {
      var elemBBox    = this.getBoundingClientRect()
      var tooltipBBox = tooltip.node().getBoundingClientRect()
      var vleft = d3.mouse(this)[0]
      var left  = d3.mouse(this)[0]
      if (left  <= (tooltipBBox.width/2)) left = (tooltipBBox.width/2)
      if (left  >= (elemBBox.width - tooltipBBox.width/2)) left = (elemBBox.width - tooltipBBox.width/2)
      if (vleft <= 0) vleft = 0
      if (vleft >= elemBBox.width-1) vleft = elemBBox.width-1
      // if desktop remap coordinates based on viewport dimensions
      var tleft = left - (tooltipBBox.width/2)
      if (isDesktop) {
        var top   = d3.mouse(this)[1]
        vleft = d3.mouse($('streamgraph').get(0))[0]
        top = (top * $('streamgraph svg').height()) / h
        top -= (tooltipBBox.height/2 +20) // offset
        tooltip.style('top', top - (tooltipBBox.height/2) + 'px' )
        tleft = _.clamp(vleft - (tooltipBBox.width/2), tooltipBBox.width/4, elemBBox.width - tooltipBBox.width/2)
      }
      vertical.style('left', vleft + 'px' )
      tooltip.style('left',  tleft + 'px' )
    }
    function _streamgraphTouch() {
      var elemBBox    = this.getBoundingClientRect()
      var tooltipBBox = tooltip.node().getBoundingClientRect()
      var vleft = d3.mouse(this)[0]
      var left  = d3.mouse(this)[0]
      var top   = d3.mouse(this)[1]
      if (top   <= (tooltipBBox.height/2)) top = (tooltipBBox.height/2)
      if (top   >= (elemBBox.height - tooltipBBox.height/2)) top = (elemBBox.height - tooltipBBox.height/2)
      if (left  <= (tooltipBBox.width/2)) left = (tooltipBBox.width/2)
      if (left  >= (elemBBox.width - tooltipBBox.width/2)) left = (elemBBox.width - tooltipBBox.width/2)
      if (vleft >= elemBBox.width-1) vleft = elemBBox.width-1

      if (isMobile) top = 0
      if (bowser.tablet) top = d3.mouse(this)[1] - (tooltipBBox.height/2) -40

      vertical.style('left', vleft + 'px' )
      tooltip.style('left',  left  - (tooltipBBox.width/2)  + 'px' )
      tooltip.style('top',   top   - (tooltipBBox.height/2) + 'px' )
    }

    function _showTooltip(d,i) {
      svg.selectAll('.layer')
         .transition()
         .duration(250)
         .attr('opacity', function(d, j) { return j == i ? 1 : .3 })
      svg.selectAll('.overlay')
         .transition()
         .duration(250)
         .attr('opacity', function(d, j) { return j == i ? 1 : 0 })
      svg.selectAll('.label-dap-sm')
         .transition()
         .duration(250)
         .attr('opacity', function(c, j) { return (d.key == c.key) ? 1 : 0 })
      vertical.style('visibility', 'visible')
      tooltip.style('visibility', 'visible')
    }
    function _hideTooltip(d,i) {
      svg.selectAll('.layer')
         .transition()
         .duration(250)
         .attr('opacity', '1')
      svg.selectAll('.overlay')
         .transition()
         .duration(250)
         .attr('opacity', .6)
      svg.selectAll('.label-dap-sm')
         .transition()
         .duration(250)
         .attr('opacity', 0)
      vertical.style('visibility', 'hidden')
      tooltip.style('visibility', 'hidden')
    }
    function _drawTooltip(d) {
      var mouseX = d3.mouse(this)[0]
      var selectedDate = X.invert(mouseX)
      selectedDate.setSeconds(0)
      selectedDate.setMilliseconds(0)
      var roundedMinutes = Math.round((selectedDate.getMinutes()/beSamplingRate)) * beSamplingRate // Thanks http://stackoverflow.com/a/32926308
      selectedDate.setMinutes(roundedMinutes)
      var selected = _.first(_.filter(d.values, function (e) { return e.date.getTime() === selectedDate.getTime() }))
      if (!selected) return
      var time = moment(selected.date).format('h:mm A')
      ctrl.tooltipv = {
        key: d.key,
        time: time,
        value: selected.value,
        dap: selected.dap * 100
      }
      if (!$scope.$$phase) $scope.$digest()
      var data = {
        name: d.key,
        time: time,
        power: selected.value
      }
      if(_callback) _callback(data)
    }
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    DonutChart
  **/

  angular
    .module('DonutChart', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('DonutChart')
    .component('donutChart', {
      templateUrl: '../js/components/donutChart/template.html',
      controller: DonutChartCtrl,
      controllerAs: 'donutChart',
      bindings: {
        datasource: '<',
        onSelect: '&',
        grName: '@',
        initialKey: '='
      }
    })

  /* @ngInject */
  function DonutChartCtrl($scope, $element, $attrs, d3, _) {
    var ctrl = this

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    // ctrl.$onInit = init
    ctrl.$onChanges = update

    // -------- CALLBACK ---------
    var _callback = null
    $scope.$on('donut:select', function(e,k) { _select(k) })

    // -------- SVG ELEMENTS ---------
    var svg, box, w, h, p,                      // svg config
        cursor, enelCursor = {},                // brand cursor
        arcsG, arcs, arcW = 90, percLimit = 15, // pie chart
        svgDefs, gradients, selectGradient      // gradients

    // -------- COLORS ---------
    var colorStop = ['#ddd', '#0a0a0a']
    var selectColorStop = ['#59BC5F', '#178F5C']
    // -------- PIE ---------
    var pieArc = d3.svg.arc()
    var pie = d3.layout.pie()
                .value(function(d) { return +d.energy })
                .sort(function(a,b){ return +a.energy <= +b.energy })

    function _select(key) {
      var data = _.find(ctrl.datasource, {name: key})
      arcs.attr('fill', function(d,i) { return 'url(#donutChart_gr'+i+ctrl.grName+')' })
      svg.select('#arc-'+key).attr('fill', 'url(#'+ctrl.grName+')')
      if(_callback) _callback(data)
    }

    function init() {
      console.log('init donutChart')
      var data  = angular.copy(ctrl.datasource)
      _callback = ctrl.onSelect()
      $element.find('svg').empty()

      // -------- INITIALIZE CHART ---------
      svg = d3.select($element.find('svg').get(0))
      box = svg.attr('viewBox').split(' ')
      w   = +box[2] // width
      h   = +box[3] // height
      p   = 10      // padding
      // calculate cursor dimension
      enelCursor.height = arcW+2.5
      enelCursor.width = arcW/3.5
      // create container for chart
      arcsG = svg.append('g')
                 .attr('id', 'pieBox')
                 .attr('transform', 'translate('+w/2+','+h/2+')')
      // create brand cursor
      cursor = svg.append('g')
                  .attr('id', 'cursor')
                  .append('rect')
                  .attr('height', enelCursor.height)
                  .attr('width', enelCursor.width)
                  .attr('transform', 'translate('+(w/2-enelCursor.width/2)+','+(p-0.5)+')')
      // create gradients defs container
      svgDefs = svg.append('defs')
      selectGradient = svgDefs.append('linearGradient')
                              .attr('id', ctrl.grName)
                              .attr('x1', '0%')
                              .attr('x2', '1')
                              .attr('y1', '0%')
                              .attr('y2', '1')
      selectGradient.append('stop')
                    .attr('offset', '0%')
                    .attr('stop-color', selectColorStop[0])
      selectGradient.append('stop')
                    .attr('offset', '100%')
                    .attr('stop-color', selectColorStop[1])
      // define donut chart radious width
      pieArc.innerRadius(w/2 -arcW -p)
            .outerRadius(w/2 -p)
    }

    function update(changedObj) {
      var prevData = angular.copy(changedObj.datasource.previousValue)
      var data     = angular.copy(changedObj.datasource.currentValue)
      // !!
      // https://github.com/angular/angular.js/issues/14433
      // for some weird reason component $onChanges is called before $onInit
      // so we assume that if we don't have prevData the components is never being initialized
      // if (_.isEmpty(prevData))
      init()
      console.log('update donutChart')

      // -------- DATA MAP ---------
      var max = d3.max(data, function(d) { return +d.energy })
      var min = d3.min(data, function(d) { return +d.energy })
      // limit too much min values,
      // under percLimit% it'll be set as percLimit% of the max
      data.forEach(function(d) {
        var v = (+d.energy*100)/max
        if (v > 0 && v <= percLimit) {
          d.energy = max/(100/percLimit)
        }
      })
      // create data pie
      data = pie(data)
      // define arc gradients
      gradients = svgDefs.selectAll('#donutChart_gr').data(data)
      gradients.enter()
               .append('linearGradient')
               .attr('id', function(d, i){ return 'donutChart_gr'+i+ctrl.grName })
               .attr('gradientUnits', 'userSpaceOnUse')
               .attr('x1', '0%')
               .attr('x2', function(d, i){
                  var a = d.startAngle + (d.endAngle - d.startAngle)/2
                  return Math.cos(a)*100/Math.PI*2 + '%'
                })
               .attr('y1', '0%')
               .attr('y2', function(d, i){
                  var a = d.startAngle + (d.endAngle - d.startAngle)/2
                  return Math.sin(a)*100/Math.PI*2 + '%'
                })
      gradients.append('stop')
               .attr('offset', '0%')
               .attr('stop-color', colorStop[0])
      gradients.append('stop')
               .attr('offset', '100%')
               .attr('stop-color', colorStop[1])
      // update chart
      arcs = arcsG.selectAll('path').data(data)
      arcs.enter()
          .append('path')
          .attr('id', function(d,i) { return 'arc-' + d.data.name })
          .attr('d', pieArc)
          .attr('fill', function(d,i) { return 'url(#donutChart_gr'+i+ctrl.grName+')' })
          .on('click', function(d,i) { return _select(d.data.name) })
          .on('mouseover', function(d,i) { return _select(d.data.name) })

      if (ctrl.initialKey) _select(ctrl.initialKey)
    }
  }

}(window.angular, window.angular.element));

(function () {
  /* \
  |*|
  |*|  :: cookies.js ::
  |*|
  |*|  A complete cookies reader/writer framework with full unicode support.
  |*|
  |*|  Revision #1 - September 4, 2014
  |*|
  |*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
  |*|  https://developer.mozilla.org/User:fusionchess
  |*|
  |*|  This framework is released under the GNU Public License, version 3 or later.
  |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
  |*|
  |*|  Syntaxes:
  |*|
  |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
  |*|  * docCookies.getItem(name)
  |*|  * docCookies.removeItem(name[, path[, domain]])
  |*|  * docCookies.hasItem(name)
  |*|  * docCookies.keys()
  |*|
  \ */

  var docCookies = {
    getItem: function (sKey) {
      if (!sKey) { return null }
      return decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false }
      var sExpires = ''
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd
            break
          case String:
            sExpires = '; expires=' + vEnd
            break
          case Date:
            sExpires = '; expires=' + vEnd.toUTCString()
            break
        }
      }
      document.cookie = encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '')
      return true
    },
    removeItem: function (sKey, sPath, sDomain) {
      if (!this.hasItem(sKey)) { return false }
      document.cookie = encodeURIComponent(sKey) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '')
      return true
    },
    hasItem: function (sKey) {
      if (!sKey) { return false }
      return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie)
    },
    keys: function () {
      var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/)
      for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]) }
      return aKeys
    }
  }
  window.docCookies = docCookies
})();

(function ($) {
  $(document).ready(function () {
    var pref = $.fx.cssPrefix
    var prefix = pref + 'transform'

    var userAgree = window.docCookies.getItem('doNotProfile')

    console.log('user agree? ' + userAgree)

    if (!userAgree) {
      $('#cookie').css('display', 'block')

      window.addEventListener('scroll', setCookie);
      $('main').on('click', setCookie);
      $('[js_ok_cookie]').on('click', function () {
        setCookie()
        return false
      })
    }

    function setCookie () {
      var expirationDate = new Date(new Date().setYear(new Date().getFullYear() + 1))

      window.docCookies.setItem('doNotProfile', 1, expirationDate, '/')
      window.removeEventListener('scroll', setCookie);
      $('main').off('click', setCookie);
      $('[js_ok_cookie]').off('click')

      TweenMax.to('#cookie', .5, {opacity: 0,
        onComplete: function () { $('#cookie').remove() }
      })
    }
  })
})(window.jQuery);

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('BatteryAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('BatteryAnimation')
    .component('carBattery', {
      templateUrl: '../js/components/batteryAnimation/assets/svg/car_battery.svg',
      controller: BatteryAnimationCtrl,
      controllerAs: 'carBattery',
      bindings: {}
    })

  /* @ngInject */
  function BatteryAnimationCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    ctrl.componentPath = '../js/components/batteryAnimation'
    ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    // -------

    // init after dom loaded
    function init() {
      carAnimation()
      batteryAnimation()
    }
    // function update(changedObj) {}

    function carAnimation() {
      TweenMax.set('g#car_front path', { drawSVG:"0%" })
      TweenMax.to('g#car_front path',  1.5, { drawSVG:"100%", delay:.4, ease:Power2.easeOut })
    }

    function batteryAnimation() {
      TweenMax.set('g#battery_body *',    { drawSVG:"0%" })
      TweenMax.set('g#battery_cover *', { drawSVG:"0%" })
      TweenMax.to('g#battery_body *',     1.5, { drawSVG:"100%", delay:.4, ease:Power2.easeOut })
      TweenMax.to('g#battery_cover *',  1.5, { drawSVG:"100%", delay:.4, ease:Power2.easeOut })
      TweenMax.to('g#rotating_points',      .6, { css: { rotation: "-=120", transformOrigin:"50% 50%" }, repeatDelay:.6, repeat:-1, ease:Power1.easeOut })
    }

    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    // $scope.$on('$destroy', function () {})
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('NightDayAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('NightDayAnimation')
    .component('carNightday', {
      templateUrl: '../js/components/nightdayAnimation/assets/svg/illustration_daynight.svg',
      controller: NightDayAnimationCtrl,
      controllerAs: 'carNightday',
      bindings: {}
    })

  /* @ngInject */
  function NightDayAnimationCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    ctrl.componentPath = '../js/components/nightdayAnimation'
    ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    var animationTiming = 6 //seconds

    // -------

    // init after dom loaded
    function init() {
      skyAnimation()
      carAnimation()
    }
    // function update(changedObj) {}

    function skyAnimation() {
      TweenMax.to('g#sky',  animationTiming, { css: { rotation: "+=280", transformOrigin:"50% 50%" }, ease:Linear.easeNone })
      TweenMax.to('g#sun_rays',  3, { css: { rotation: "-=360", transformOrigin:"50% 50%" }, ease:Linear.easeNone, repeat:-1 })
      TweenMax.to('#moon',  animationTiming, { css: { rotation: "-=280", transformOrigin:"50% 50%" }, ease:Linear.easeNone })

    }

    function carAnimation(){
      TweenMax.from(['g#wheel_rear','g#wheel_front','#car'],  2, { css: { x: "-=1360" }, ease:Power2.easeOut})

      TweenMax.to(['g#wheel_rear','g#wheel_front'],  .7, { css: { rotation: "+=360", transformOrigin:"50% 50%" }, ease:Linear.easeNone, repeat:-1 })
    
      TweenMax.to(['g#wheel_rear','g#wheel_front','#car'],  2, { css: { x: "+=1360" }, ease:Power2.easeIn, delay: animationTiming-.5 })
    }



    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    // $scope.$on('$destroy', function () {})
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('V2GAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('V2GAnimation')
    .component('carV2g', {
      templateUrl: '../js/components/v2gAnimation/assets/svg/illustration_v2g.svg',
      controller: V2GAnimationCtrl,
      controllerAs: 'carV2g',
      bindings: {}
    })

  /* @ngInject */
  function V2GAnimationCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    ctrl.componentPath = '../js/components/v2gAnimation'
    ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    var v2gTimeline = null

    // -------

    // init after dom loaded
    function init() {
      v2gTimeline = new TimelineMax({repeat:-1});
      streetAnimation()
    }
    // function update(changedObj) {}

    function streetAnimation() {
      v2gTimeline.set($('#background_container'), {x:-50, ease:Expo.easeOut})
      v2gTimeline.set($('#cable'), {css:{opacity:0}})
      v2gTimeline.set($('#cable_electricity_in'), {css:{opacity:0}})
      v2gTimeline.set($('#cable_electricity_out'), {css:{opacity:0}})


      v2gTimeline.to($('#background_container'),3, {x:'-=530', ease:Power2.easeInOut})

                 .from([$('#cara'),$('#carb')],1, {y:'+=100', ease:Power1.easeOut}, "-=2")
                 .to([$('#cara'),$('#carb')],1, {y:'-=300', ease:Power1.easeIn}, "-=.5")

                 .to($('#cable'),.5, {css:{opacity:.3}, ease:Power2.easeOut})
                 .to($('#cable_electricity_out'),.5, {css:{opacity:1}, ease:Power2.easeOut}, "-=.5")
                 .to($('#battery'),2, {css:{scaleX:.2}, ease:Linear.easeNone}, "-=.5")

                 .to($('#cable'),.5, {css:{opacity:0}, ease:Power2.easeOut})
                 .to($('#cable_electricity_out'),.5, {css:{opacity:0}, ease:Power2.easeOut}, "-=.5")

                 .to($('#background_container'),3, {x:'-=430', ease:Power2.easeInOut})
                 .to($('#battery'),1, {css:{scaleX:.35}, ease:Linear.easeNone}, "-=2")

                 .to($('#cable'),.5, {css:{opacity:.3}, ease:Power2.easeOut})
                 .to($('#cable_electricity_in'),.5, {css:{opacity:1}, ease:Power2.easeOut}, "-=.5")
                 .to($('#battery'),2, {scaleX:1, ease:Linear.easeNone}, "-=.5")

                 .to($('#cable'),.5, {css:{opacity:0}, ease:Power2.easeOut})
                 .to($('#cable_electricity_in'),.5, {css:{opacity:0}, ease:Power2.easeOut}, "-=.5")
    }


    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function () {
      v2gTimeline.kill()
      v2gTimeline.clear()
      TweenMax.killAll()
    })
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('Solar25kmAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('Solar25kmAnimation')
    .component('solar25km', {
      templateUrl: '../js/components/solar25kmAnimation/assets/svg/illustration_solar.svg',
      controller: solarAnimationCtrl,
      controllerAs: 'solar25km',
      bindings: {}
    })

  /* @ngInject */
  function solarAnimationCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    ctrl.componentPath = '../js/components/solar25kmAnimation'
    ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    // -------

    // init after dom loaded
    function init() {
      mexicoAnimation()
    }
    // function update(changedObj) {}

    function mexicoAnimation() {
      TweenMax.set('#mexico path', { drawSVG:"0%" })
      TweenMax.to('#mexico path',  1.5, { drawSVG:"100%", delay:.4, ease:Power1.easeOut, onComplete:mexicoAnimationReverse })

    }

    function mexicoAnimationReverse() {
      TweenMax.to('#mexico path',  1.5, { drawSVG:"0%", delay:.4, ease:Power1.easeOut, onComplete:mexicoAnimation })

    }


    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    // $scope.$on('$destroy', function () {})
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('SolarMexicoAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('SolarMexicoAnimation')
    .component('solarMexico', {
      templateUrl: '../js/components/solarMexicoAnimation/assets/svg/illustration_solarmexico.svg',
      controller: NightDayAnimationCtrl,
      controllerAs: 'solarMexico',
      bindings: {}
    })

  /* @ngInject */
  function NightDayAnimationCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    ctrl.componentPath = '../js/components/solarMexicoAnimation'
    ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    var solarMexicoTimeline = null

    // -------

    // init after dom loaded
    function init() {
      solarMexicoTimeline = new TimelineMax({repeat:-1});
      skyAnimation()
    }
    // function update(changedObj) {}

    function skyAnimation() {
      solarMexicoTimeline.set([$('#light1'),$('#light2'),$('#light3'),$('#light4')], {css:{opacity:0}})

      solarMexicoTimeline.to('#sky',  2, { css: { rotation: "+=180", transformOrigin:"50% 50%" }, ease:Power1.easeInOut,  delay:2 })
                         .to('#sun_rays',  2, { css: { rotation: "-=180", transformOrigin:"50% 50%" }, ease:Power1.easeInOut}, '-=2')
                         .to('#moon',  2, { css: { rotation: "-=180", transformOrigin:"50% 50%" }, ease:Power1.easeInOut }, '-=2')
                         .to($('#village'), 2, {css:{opacity:.3}, ease:Power1.easeOut}, '-=2')

                         .to($('#light1'), 1, {css:{opacity:.95}, ease: RoughEase.ease.config({ template:  Power0.easeNone, strength: 1, points: 20, taper: "none", randomize:  true, clamp: false})})
                         .to($('#light2'), 1, {css:{opacity:.95}, ease: RoughEase.ease.config({ template:  Power0.easeNone, strength: 1, points: 20, taper: "none", randomize:  true, clamp: false})}, '-=.8')
                         .to($('#light3'), 1, {css:{opacity:.95}, ease: RoughEase.ease.config({ template:  Power0.easeNone, strength: 1, points: 20, taper: "none", randomize:  true, clamp: false})}, '-=.6')
                         .to($('#light4'), 1, {css:{opacity:.95}, ease: RoughEase.ease.config({ template:  Power0.easeNone, strength: 1, points: 20, taper: "none", randomize:  true, clamp: false})}, '-=.7')


                         .to('#sky',  2, { css: { rotation: "+=180", transformOrigin:"50% 50%" }, ease:Power1.easeInOut, delay:2 })
                         .to($('#village'), 2, {css:{opacity:1}, ease:Power1.easeOut}, '-=2')
                         .to('#sun_rays',  2, { css: { rotation: "-=180", transformOrigin:"50% 50%" }, ease:Power1.easeInOut}, '-=2')
                         .to('#moon',  2, { css: { rotation: "-=180", transformOrigin:"50% 50%" }, ease:Power1.easeInOut }, '-=2')
                         .to([$('#light1'),$('#light2'),$('#light3'),$('#light4')], 1, {css:{opacity:0}, ease:Power1.easeOut}, '-=2')
    }


    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function () {
      solarMexicoTimeline.kill()
      solarMexicoTimeline.clear()
      // TweenMax.killAll()
    })
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('FastRechargeAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('FastRechargeAnimation')
    .component('fastRecharge', {
      templateUrl: '../js/components/fastRechargeAnimation/assets/svg/illustration_fastcharge.svg',
      controller: FastRechargeCtrl,
      controllerAs: 'fastRecharge',
      bindings: {}
    })

  /* @ngInject */
  function FastRechargeCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    ctrl.componentPath = '../js/components/fastRechargeAnimation'
    ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    // -------

    // init after dom loaded
    function init() {
      chargeAnimation()
    }
    // function update(changedObj) {}

    function chargeAnimation() {
       TweenMax.set(['#fast','#slow'], { css: { scaleY: "1", transformOrigin:'0% 100%'}})
       TweenMax.to('#fast',  2, { css: { scaleY: ".05", transformOrigin:'0% 100%'}, ease:Linear.easeNone, delay:.2 })
       TweenMax.to('#slow',  6, { css: { scaleY: ".05", transformOrigin:'0% 100%'}, ease:Linear.easeNone, delay:.2, onComplete:resetAnimation })
    }

    function resetAnimation(){
      TweenMax.to(['#fast','#slow'],  .4, { css: { scaleY: "1", transformOrigin:'0% 100%'}, ease:Linear.easeNone, delay:.5, onComplete:chargeAnimation })
    }


    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function () {
      TweenMax.killAll()
    })
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('EnelStandAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('EnelStandAnimation')
    .component('enelStand', {
      templateUrl: '../js/components/enelstandAnimation/assets/svg/illustration_enel_stand.svg',
      controller: enelStandCtrl,
      // controllerAs: 'enelStand',
      bindings: {}
    })

  /* @ngInject */
  function enelStandCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    // ctrl.componentPath = '../js/components/enelstandAnimation'
    // ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    var solarMexicoTimeline = null

    // -------

    // init after dom loaded
    function init() {
      solarMexicoTimeline = new TimelineMax({repeat:-1});
      standAnimation()
    }
    // function update(changedObj) {}

    function standAnimation() {
      TweenMax.set(['path','line','circle','rect'], { drawSVG:"0%" })
      TweenMax.to(['path','line','circle','rect'],  1.5, { drawSVG:"100%", delay:.4, ease:Power2.easeOut })

      TweenMax.from('#enel_logo',  1, { opacity:0, x:'-=45', delay:1, ease:Power2.easeOut })
    }


    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function () {
      solarMexicoTimeline.kill()
      solarMexicoTimeline.clear()
      TweenMax.killAll()
    })
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    BatteryAnimation
  **/

  angular
    .module('EfficiencyAnimation', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('EfficiencyAnimation')
    .component('efficiency', {
      templateUrl: '../js/components/efficiencyAnimation/assets/svg/illustration_efficiency.svg',
      controller: EfficiencyCtrl,
      controllerAs: 'efficiency',
      bindings: {}
    })

  /* @ngInject */
  function EfficiencyCtrl($scope, $element, $attrs, TweenMax) {
    var ctrl = this
    ctrl.componentPath = '../js/components/efficiencyAnimation'
    ctrl.svgPath = ctrl.componentPath + '/assets/svg'

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update

    // -------

    // init after dom loaded
    function init() {
      efficiencyAnimation()
    }
    // function update(changedObj) {}

    function efficiencyAnimation() {
      TweenMax.to('#heat',  1.5, { css: { rotation: "40", transformOrigin:'50% 50%'}, ease:Power2.easeOut })
      TweenMax.to('#electric',  3, { css: { rotation: "80", transformOrigin:'50% 50%'}, ease:Power2.easeOut, onComplete:resetAnimation })
    
    }

    function resetAnimation() {
      TweenMax.to(['#heat','#electric'],  1, {  css: { rotation: "0", transformOrigin:'50% 50%'}, ease:Power2.easeOut, delay:4, onComplete:efficiencyAnimation })
    }


    // event handlers
    // $scope.$on('svg:all-loaded', function() {
    //   console.log('init animation')
    //   carAnimation()
    //   batteryAnimation()
    // })

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function () {
      TweenMax.killAll()
    })
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    SnippetManager
  **/

  angular
    .module('SnippetManager', [
      'MainApp',
      'BatteryAnimation',
      'NightDayAnimation',
      'V2GAnimation',
      'Solar25kmAnimation',
      'SolarMexicoAnimation',
      'FastRechargeAnimation',
      'EnelStandAnimation',
      'EfficiencyAnimation'
    ])

}(window.angular));

(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('SnippetManager')
    .service('SnippetSrv', ContructorForSnippetSrv)

  /* @ngInject */
  function ContructorForSnippetSrv($q, _) {
    var self  = this
    self.path = '../js/modules/snippetManager/templates'
    // tours
    var _availableTours = {
      'eMobility': {
        key: 'eMobility',
        label: 'E-Mobility',
        translateLabel: 'energy_tour_mobility_label',
        snippets: ['fastRecharge', 'efficiency', 'co2', 'regenerativeBraking', 'v2g', 'enelXMobility', 'santiagoTransport']
      },
      'smartEnergy': {
        key: 'smartEnergy',
        label: 'Smart energy',
        translateLabel: 'energy_tour_smart_label',
        snippets: ['raceMicrogrid', 'smartMetering', 'motorsport', 'v2g', 'firstSmartCity', 'forgetBlackouts', 'santiagoGreen'],
      },
      'cleanEnergy': {
        key: 'cleanEnergy',
        label: 'Clean energy',
        translateLabel: 'energy_tour_clean_label',
        snippets: ['raceMicrogrid', 'howMuchSunGlobal', 'cleanEnergyGlobal', 'enelWorld', 'zeroco2ny', 'itGeoTerm', 'uyWindOfChange'],
      },
      'enelAchievements': {
        key: 'enelAchievements',
        label: 'Enel achievements',
        translateLabel: 'energy_tour_enel_label',
        snippets: ['howMuchSunMexico', 'cleanEnergyChile', 'firstSmartCity', 'chileCommunity', 'formulaE', 'enelWorld', 'it3sun'],
      }
    }


    var _availableHotspots = {
      'test': {
        stage: null,
        coords: null,
        snippets: ['itGeoTerm', 'it3sun', 'circuitTemplate','enelXMobility', 'motorsport', 'co2', 'howMuchSunGlobal']
      },
      'pin_1_info': {
        stage: 1,
        coords: [0.97, 4.74, 6.46],
        snippets: ['carSpecs']
      },
      'pin_1_tyre': {
        stage: 1,
        coords: [5.98, 2.32, 2.59],
        snippets: ['tyres', 'regenerativeBraking']
      },
      'pin_1_electricity': {
        stage: 1,
        coords: [-5.01, 1.12, -4.63],
        snippets: ['fanBoost', 'fastRecharge', 'batteryPower']
      },
      'pin_1_engine': {
        stage: 1,
        coords: [-3.19, 2.20, -5.73],
        snippets: ['co2', 'efficiency', 'enginePower', 'sound']
      },
      'pin_1_new_car': {
        stage: 1,
        coords: [5.25, 2.39, -3.80],
        snippets: ['chronoGen2', 'motorsport', 'chronoGen2-battery', 'chronoGen2-power']
      },
      'pin_2_grid': {
        stage: 2,
        coords: [-459, 437, 433],
        snippets: ['raceMicrogrid']
      },
      'pin_2_info': {
        stage: 2,
        coords: [-525, 333, -453],
        snippets: ['circuitTemplate']
      },
      'pin_2_meter': {
        stage: 2,
        coords: [348, 514, -452],
        snippets: ['smartMetering']
      },
      'pin_2_santiago': {
        stage: 2,
        coords: [638, 193, -392],
        snippets: ['santiagoGreen', 'santiagoTransport']
      },
      'pin_2_solar': {
         stage: 2,
         coords: [714, 276, -69],
         snippets: ['solarPower']
      },
      // 'pin_2_storage': {
      //   stage: 2,
      //   coords: [416, 424, -491],
      //   snippets: ['storage', 'batteryBrains']
      // },
      'pin_3_v2g': {
        stage: 3,
        // coords: [-0.039, 0.90, 0.61],
        coords: [181],
        snippets: ['v2g', 'v2gDenmark']
      },
      'pin_3_spain': {
        stage: 3,
        // coords: [-1.04, -0.25, 0.17],
        coords: [566],
        snippets: ['cleanEnergyGlobal', 'cleanEnergyChile', 'chileCommunity']
      },
      'pin_3_rome': {
        stage: 3,
        // coords: [0.091, 0.64, 0.86],
        coords: [206],
        snippets: ['enelWorld', 'enelXMobility', 'it3sun']
      },
      'pin_3_milan': {
        stage: 3,
        // coords: [-0.049, 0.74, 0.78],
        coords: [284],
        snippets: ['itGeoTerm', 'firstSmartCity', 'internet']
      },
      'pin_3_berlin': {
        stage: 3,
        // coords: [0.081, 0.80, 0.72],
        coords: [43],
        snippets: ['germany']
      },
      'pin_3_fe': {
        stage: 3,
        // coords: [0.95, 0.39, -0.33],
        coords: [-364],
        snippets: ['formulaE']
      },
      'pin_3_solar': {
        stage: 3,
        // coords: [-0.91, 0.38, -0.45],
        coords: [756],
        snippets: ['howMuchSunGlobal', 'howMuchSunMexico']
      },
      'pin_3_ny': {
        stage: 3,
        coords: [462],
        snippets: ['forgetBlackouts', 'zeroco2ny']
      },
      'pin_3_ca': {
        stage: 3,
        coords: [583],
        snippets: ['enelNorthAmerica', 'hybrid']
      },
      'pin_3_uy': {
        stage: 3,
        coords: [306],
        snippets: ['uyFutureEnergy', 'uyWindOfChange']
      }
    }

    // snippets
    var _availableSnippets = {
      'santiagoGreen': {
        desc: '',
        label: '',
        tpl: self.path + '/santiagoGreen.html'
      },
      'santiagoTransport': {
        desc: '',
        label: '',
        tpl: self.path + '/santiagoTransport.html'
      },
      'chileCommunity': {
        desc: '',
        label: '',
        tpl: self.path + '/chileCommunity.html',
        subContent: [
          {
            desc: '',
            label: 'Impact',
            translateLabel: 'snip_world_chile_community_tab1',
            tpl: self.path + '/subcontents/chileCommunity-impact.html'
          },
          {
            desc: '',
            label: 'Data',
            translateLabel: 'snip_world_chile_community_tab2',
            tpl: self.path + '/subcontents/chileCommunity-data.html'
          }
        ]
      },
      'enelX': {
        desc: '',
        label: '',
        tpl: self.path + '/enelX.html',
        extraClass: 'enelx',
        subContent: [
          {
            desc: '',
            label: 'For businesses',
            translateLabel: 'snip_world_enelx_tab1',
            tpl: self.path + '/subcontents/enelX-business.html'
          },
          {
            desc: '',
            label: 'For cities',
            translateLabel: 'snip_world_enelx_tab2',
            tpl: self.path + '/subcontents/enelX-cities.html'
          },
          {
            desc: '',
            label: 'For individuals',
            translateLabel: 'snip_world_enelx_tab3',
            tpl: self.path + '/subcontents/enelX-people.html'
          }
        ]
      },
      'enelXMobility': {
        desc: '',
        label: '',
        tpl: self.path + '/enelXMobility.html',
        extraClass: 'enelx',
        subContent: [
          {
            desc: '',
            label: 'On the track',
            translateLabel: 'snip_world_enelx_mobility_tab1',
            tpl: self.path + '/subcontents/enelX-mobility-ontrack.html'
          },
          {
            desc: '',
            label: 'In Italy',
            translateLabel: 'snip_world_enelx_mobility_tab2',
            tpl: self.path + '/subcontents/enelX-mobility-italy.html'
          }
        ]
      },
      'carSpecs': {
        desc: '',
        label: '',
        tpl: self.path + '/carInfo.html'
      },
      'fastRecharge': {
        desc: 'Innovation is ready to charge! Recharging e-cars is faster than you think.',
        label: 'Fast recharge',
        tpl: self.path + '/fastRecharge.html'
      },
      'batteryPower': {
        desc: '',
        label: '',
        tpl: self.path + '/batteryPower.html',
        subContent: [
          {
            desc: '',
            label: 'Provides energy for',
            translateLabel: 'snip_car_battery_tab1',
            tpl: self.path + '/subcontents/batteryPower-minutes.html'
          },
          {
            desc: '',
            label: 'Enough to charge',
            translateLabel: 'snip_car_battery_tab2',
            tpl: self.path + '/subcontents/batteryPower-phones.html'
          }
        ]
      },
      // 'batteryBrains': {
      //   desc: '',
      //   label: '',
      //   tpl: self.path + '/batteryBrains.html',
      //   subContent: [
      //     {
      //       desc: '',
      //       label: 'At the NYC ePrix',
      //       tpl: self.path + '/subcontents/batteryBrains-ePrix.html'
      //     },
      //     {
      //       desc: '',
      //       label: 'In NYC and the world',
      //       tpl: self.path + '/subcontents/batteryBrains-world.html'
      //     }
      //   ]
      // },
      'fanBoost': {
        desc: '',
        label: '',
        tpl: self.path + '/fanBoost.html'
      },
      'sound': {
        desc: '',
        label: '',
        tpl: self.path + '/sound.html',
        subContent: [
          {
            desc: '',
            label: 'Today\'s achievement',
            translateLabel: 'snip_car_sound_tab1',
            tpl: self.path + '/subcontents/sound-noise.html'
          },
          {
            desc: '',
            label: 'Tomorrow\'s cities',
            translateLabel: 'snip_car_sound_tab2',
            tpl: self.path + '/subcontents/sound-future.html'
          }
        ]
      },
      'efficiency': {
        desc: '',
        label: '',
        tpl: self.path + '/efficiency.html'
      },
      'co2': {
        desc: '',
        label: '',
        tpl: self.path + '/zeroco2.html',
        subContent: [
          {
            desc: '',
            label: 'Traditional engines',
            translateLabel: 'snip_car_co2_tab1',
            tpl: self.path + '/subcontents/co2-kg.html'
          },
          {
            desc: '',
            label: 'Innovative thinking',
            translateLabel: 'snip_car_co2_tab2',
            tpl: self.path + '/subcontents/co2-future.html'
          }
        ]
      },
      'enginePower': {
        desc: '',
        label: '',
        tpl: self.path + '/enginePower.html'
      },
      'tyres': {
        desc: '',
        label: '',
        tpl: self.path + '/tyres.html'
      },
      'regenerativeBraking': {
        desc: '',
        label: '',
        tpl: self.path + '/regenerativebraking.html',
        subContent: [
          {
            desc: '',
            label: 'During the race',
            translateLabel: 'snip_car_brake_tab1',
            tpl: self.path + '/subcontents/regenerativeBraking-formulaE.html'
          },
          {
            desc: '',
            label: 'On our streets',
            translateLabel: 'snip_car_brake_tab2',
            tpl: self.path + '/subcontents/regenerativeBraking-eCar.html'
          }
        ]
      },
      'chronoGen2': {
        desc: '',
        label: '',
        tpl: self.path + '/chronoGen2.html',
        subContent: [
          {
            desc: '',
            label: 'At the E-Prix',
            translateLabel: 'snip_car_gen2_tab1',
            tpl: self.path + '/subcontents/chronoGen2-eprix.html'
          },
          {
            desc: '',
            label: 'In the city',
            translateLabel: 'snip_car_gen2_tab2',
            tpl: self.path + '/subcontents/chronoGen2-city.html'
          }
        ]
      },
      'chronoGen2-battery': {
        desc: '',
        label: '',
        tpl: self.path + '/chronoGen2-battery.html',
        subContent: [
          {
            desc: '',
            label: 'Lasts for',
            translateLabel: 'snip_car_gen2_battery_tab1',
            tpl: self.path + '/subcontents/chronoGen2-lasts.html'
          },
          {
            desc: '',
            label: 'Enough to charge',
            translateLabel: 'snip_car_gen2_battery_tab2',
            tpl: self.path + '/subcontents/chronoGen2-charge.html'
          }
        ]
      },
      'chronoGen2-power': {
        desc: '',
        label: '',
        tpl: self.path + '/chronoGen2-power.html',
        subContent: [
          {
            desc: '',
            label: 'Maximum speed',
            translateLabel: 'snip_car_gen2_power_tab1',
            tpl: self.path + '/subcontents/chronoGen2-speed.html'
          },
          {
            desc: '',
            label: '0-100 km/h in',
            translateLabel: 'snip_car_gen2_power_tab2',
            tpl: self.path + '/subcontents/chronoGen2-accelleration.html'
          }
        ]
      },
      'circuitBerlin2017': {
        desc: '',
        label: '',
        tpl: self.path + '/circuit-berlin-2017.html'
      },
      'circuitNY2017': {
        desc: '',
        label: '',
        tpl: self.path + '/circuit-ny-2017.html'
      },
      'circuitMontreal2017': {
        desc: '',
        label: '',
        tpl: self.path + '/circuit-montreal-2017.html'
      },
      'circuitHongKong2017': {
        desc: '',
        label: '',
        tpl: self.path + '/circuit-hongkong-2017.html'
      },
      'circuitTemplate': {
        desc: '',
        label: '',
        tpl: self.path + '/circuit-info-template.html'
      },
      'raceMicrogrid': {
        desc: '',
        label: '',
        tpl: self.path + '/raceMicrogrid.html',
        subContent: [
          {
            desc: '',
            label: 'Small scale',
            translateLabel: 'snip_circuit_grid_tab1',
            tpl: self.path + '/subcontents/raceMicrogrid-racetrack.html'
          },
          {
            desc: '',
            label: 'Large scale',
            translateLabel: 'snip_circuit_grid_tab2',
            tpl: self.path + '/subcontents/raceMicrogrid-city.html'
          }
        ]
      },
      'smartMetering': {
        desc: '',
        label: '',
        tpl: self.path + '/smartMetering.html',
        subContent: [
          {
            desc: '',
            label: 'Smart kit',
            translateLabel: 'snip_circuit_smart_tab1',
            tpl: self.path + '/subcontents/smartMetering-kit.html'
          },
          {
            desc: '',
            label: 'Smart meter',
            translateLabel: 'snip_circuit_smart_tab2',
            tpl: self.path + '/subcontents/smartMetering-meter.html'
          }
        ]
      },
      'solarPower': {
        desc: '',
        label: '',
        tpl: self.path + '/solarPower.html',
        subContent: [
          {
            desc: '',
            label: 'Generation',
            translateLabel: 'snip_circuit_solar_tab1',
            tpl: self.path + '/subcontents/solarPower-generate.html'
          },
          {
            desc: '',
            label: 'Equivalent to',
            translateLabel: 'snip_circuit_solar_tab2',
            tpl: self.path + '/subcontents/solarPower-needs.html'
          }
        ]
      },
      'storage': {
        desc: '',
        label: '',
        tpl: self.path + '/storage.html'
      },
      'v2g': {
        desc: '',
        label: '',
        tpl: self.path + '/v2g.html'
      },
      'v2gDenmark': {
        desc: '',
        label: '',
        tpl: self.path + '/v2gDenmark.html'
      },
      'howMuchSunGlobal': {
        desc: '',
        label: '',
        tpl: self.path + '/howMuchSunGlobal.html'
      },
      'howMuchSunMexico': {
        desc: '',
        label: '',
        tpl: self.path + '/howMuchSunMexico.html'
      },
      'cleanEnergyGlobal': {
        desc: '',
        label: '',
        tpl: self.path + '/cleanEnergyGlobal.html'
      },
      // 'cleanEnergySpain': {
      //   desc: '',
      //   label: '',
      //   tpl: self.path + '/cleanEnergySpain.html'
      // },
      'cleanEnergyChile': {
        desc: '',
        label: '',
        tpl: self.path + '/cleanEnergyChile.html'
      },
      'enelWorld': {
        desc: '',
        label: '',
        tpl: self.path + '/enelWorld.html'
      },
      'internet': {
        desc: '',
        label: '',
        tpl: self.path + '/internet.html'
      },
      'firstSmartCity': {
        desc: '',
        label: '',
        tpl: self.path + '/firstSmartCity.html'
      },
      'germany': {
        desc: '',
        label: '',
        tpl: self.path + '/germany.html'
      },
      'formulaE': {
        desc: '',
        label: '',
        tpl: self.path + '/formulaE.html'
      },
      'enelStand': {
        desc: '',
        label: '',
        tpl: self.path + '/enelstand.html'
      },
      'enelNorthAmerica': {
        desc: '',
        label: '',
        tpl: self.path + '/enelNorthAmerica.html'
      },
      'forgetBlackouts': {
        desc: '',
        label: '',
        tpl: self.path + '/forgetBlackouts.html'
      },
      'zeroco2ny': {
        desc: '',
        label: '',
        tpl: self.path + '/zeroco2ny.html'
      },
      'hybrid': {
        desc: '',
        label: '',
        tpl: self.path + '/hybrid.html'
      },
      'uyFutureEnergy': {
        desc: '',
        label: '',
        tpl: self.path + '/uyFutureEnergy.html'
      },
      'uyWindOfChange': {
        desc: '',
        label: '',
        tpl: self.path + '/uyWindOfChange.html',
        subContent: [
          {
            desc: '',
            label: 'Impact',
            translateLabel: 'snip_world_uy_wind_tab1',
            tpl: self.path + '/subcontents/uyWindOfChange-impact.html'
          },
          {
            desc: '',
            label: 'Data',
            translateLabel: 'snip_world_uy_wind_tab2',
            tpl: self.path + '/subcontents/uyWindOfChange-data.html'
          }
        ]
      },
      'it3sun': {
        desc: '',
        label: '',
        tpl: self.path + '/it3sun.html'
      },
      'itGeoTerm': {
        desc: '',
        label: '',
        tpl: self.path + '/itGeoTerm.html'
      },
      'motorsport': {
        desc: '',
        label: '',
        tpl: self.path + '/motorsport.html'
      }
    }

    var _qrcodeSnipsDef = [
      'cleanEnergyGlobal',
      'cleanEnergyChile',
      'howMuchSunGlobal',
      'howMuchSunMexico',
      'fastRecharge',
      'v2g',
      'v2gDenmark',
      'hybrid',
      'enelStand'
    ]

    var _qrcodeSnippets = {}
    _.map(_qrcodeSnipsDef, function(k, i){
      _qrcodeSnippets[k] = _availableSnippets[k]
      _qrcodeSnippets[k].key = k
    })

    console.warn(_qrcodeSnippets)

    self.getAvailableSnippets = _getAvailableSnippets
    self.getQRCodeSnippets = _getQRCodeSnippets
    self.getSnippet = _getSnippet
    self.getAvailableTours = _getAvailableTours
    self.getHotspot = _getHotspot
    self.getTour = _getTour
    return self

    // -------

    function _getAvailableTours() {
      var tours = _.map(angular.copy(_availableTours), function(value, key) {
        value.key = key
        value.snippets = _.map(value.snippets, function(value) {
          var snippet = angular.copy(_availableSnippets[value])
          var hotspot = _.values(_.pickBy(_availableHotspots, function(o, k) {
            o.key = k
            return _.includes(o.snippets, value)
          }))[0]
          snippet.key = value
          if (!hotspot) return snippet
          snippet.hotspot = {
            key: hotspot.key,
            stage: hotspot.stage,
            coords: hotspot.coords
          }
          return snippet
        })
        return value
      })
      if (!_.isEmpty(tours)) return tours
      else console.error('No available tours are defined!')
    }

    function _getAvailableSnippets() {
      var snippets = _.map(angular.copy(_availableSnippets), function(value, key) {
        value.key = key
        return value
      })
      if (!_.isEmpty(snippets)) return snippets
      else console.error('No available snippets are defined!')
    }

    function _getQRCodeSnippets() {
      var snippets = _.map(angular.copy(_qrcodeSnippets), function(value, key) {
        value.key = key
        return value
      })
      if (!_.isEmpty(snippets)) return snippets
      else console.error('No available snippets are defined!')
    }

    function _getTour(key) {
      var tour = angular.copy(_availableTours[key])
      if (!_.isEmpty(tour)) return tour
      else console.error('Tour not found!')
    }

    function _getHotspot(key) {
      var hotspot = angular.copy(_availableHotspots[key])
      hotspot.snippets = _.map(hotspot.snippets, function(value) {
        return angular.copy(_availableSnippets[value])
      })
      if (!_.isEmpty(hotspot)) return hotspot
      else console.error('Hotspot not found')
    }

    function _getSnippet(key) {
      var snippet = angular.copy(_availableSnippets[key])
      if (!_.isEmpty(snippet)) {
        snippet.key = key
        return snippet
      }
      else console.error('Snippet not found!')
    }
  }

}(window.angular));

(function(window, $, undefined){

	document.documentElement.classList.remove("no-js");
	document.documentElement.classList.add("js");

	FastClick.attach(document.body);

	$('html').addClass('js');

	if(window.isMobile){
		$('html').addClass('mobile');
	}else{
		$('html').addClass('desktop');
	}

	if ('ontouchstart' in window) {
     	$('html').addClass('touch')
    }else{
     	$('html').addClass('mouse')
    }

	var styles = window.getComputedStyle(document.documentElement, '')
	var pre = (Array.prototype.slice
	      .call(styles)
	      .join('')
	      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
	    )[1]
	var dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
	pre = (pre == 'webkit' && bowser.blink) ? 'blink' : pre
	$('html').addClass(pre);
	$('html').addClass(bowser.name.toLowerCase());


	$('[fouc]').css('visibility', 'visible')

	if(window.isMobile){
		$('[pressable]').on('touchstart', function(){
			$(this).addClass('pressed')
		})
		$('[pressable]').on('touchend', function(){
			$(this).removeClass('pressed')
		})
	}

	Date.prototype.yyyymmdd = function() {
    	var yyyy = this.getFullYear().toString()
    	var mm = (this.getMonth()+1).toString()
    	var dd  = this.getDate().toString()
    	return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0])
    };



})(window, window.jQuery);

window.twttr = (function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);
  t._e = [];
  t.ready = function(f) {
    t._e.push(f);
  };
  return t;
}(document, "script", "twitter-wjs"));

(function (angular) {
  'use strict'

  /**
    Module configuration for MainApp
  **/

  angular
    .module('MainApp', [
      'pascalprecht.translate'
    ])

}(window.angular));

(function (angular) {
  'use strict'

  /**
    Run configurations for MainApp
  **/

  angular
    .module('MainApp')
    .run(RunMainApp)

  /* @ngInject */
  function RunMainApp($rootScope, $state, fastclick, isMobile, $translate) {
    fastclick.attach(document.body)

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeStart to ' + toState.name + ' - fired when the transition begins')
      console.debug('toState, toParams:', toState, toParams)
      if (toParams.lang && toParams.lang != '') $translate.use(toParams.lang)
      $rootScope.currentLang = toParams.lang
      $rootScope.policy_link = "http://formulae.enel.com/cookie-policy-"+$rootScope.currentLang+".pdf"
      $rootScope.privacy_link = "http://formulae.enel.com/informativa-privacy-"+$rootScope.currentLang+".pdf"
    })

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
      console.error('$stateChangeError - fired when an error occurs during transition.')
      console.error(arguments[5].stack)
      console.debug(arguments)
    })

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeSuccess to ' + toState.name + ' - fired once the state transition is complete.')
    })

    $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
      console.warn('$stateNotFound ' + unfoundState.name + ' - fired when a state cannot be found by its name.')
      console.debug(unfoundState, fromState, fromParams)
    })
  }

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('MainApp')
    .directive('importSvg', ImportSvg)

  /* @ngInject */
  function ImportSvg($rootScope, $http, _) {
    var directive = {
      restrict: 'E',
      replace: true,
      compile: function(tElem, tAttrs) {
        return function(scope, iElem, iAttrs) {
          // assemble svg path
          var location = scope.location.endsWith('/') ? scope.location : scope.location + '/'
          var name = scope.name.endsWith('.svg') ? scope.name : scope.name + '.svg'
          var tpl = location + name
          // if not yet initialized create array to store loading svgs
          if (!$rootScope.svgLoading) $rootScope.svgLoading = []
          // push svg path into loading svgs batch
          $rootScope.svgLoading.push(tpl)
          return $http.get(tpl)
                      .then(function(res) {
                        iElem.replaceWith(res.data)
                        __pull(tpl)
                      },
                      function(err) {
                        console.error('Svg not found!', err)
                        __pull(tpl)
                      })
        }
      },
      scope: {
        name: '@',
        location: '@'
      }
    }
    return directive

    function __pull(svgTpl) {
      console.log('svg:loaded', svgTpl)
      // pull out svg path from loading svgs batch
      _.pull($rootScope.svgLoading, svgTpl)
      // if loading svgs store array is empty all svg promises are resolved
      if (_.isEmpty($rootScope.svgLoading)) $rootScope.$broadcast('svg:all-loaded')
    }
  }
}(window.angular, window.angular.element));

(function (angular, jq) {
  'use strict'

  /**
    MainApp pagination Directive
  **/

  angular
    .module('MainApp')
    .directive('pagination', Paginator)

  /* @ngInject */
  function Paginator($timeout) {
    var directive = {
      link: postLinkFunction,
      restrict: 'EA',
      replace: true,
      templateUrl: '../js/directives/pagination/template.html',
      scope: {
        items: '=',
        currentItem: '=',
        onChange: '&',
        onPrevious: '&',
        onNext: '&',
        debounceTime: '=',
        rotate: '=',
        itemsToDisplay: '='
      }
    }
    return directive

    function postLinkFunction (scope, element, attributes) {
      if (!scope.items) return console.error('No items to paginate!')
      var currentItem = scope.items[0]
      var debounce = null
      var debounceTime = angular.copy(scope.debounceTime) || 200
      var rotate = angular.copy(scope.rotate)
      var itemsToDisplay = scope.itemsToDisplay || 1

      scope.select = scope.onChange()
      scope.selectPrev = scope.onPrevious()
      scope.selectNext = scope.onNext()
      scope.previous = _previous
      scope.next = _next

      _init()

      function _init() {
        scope.currentIdx = 0
        scope.lastIdx = Math.floor((scope.items.length-1)/itemsToDisplay)
      }

      function _previous() {
        if (debounce) return
        debounce = $timeout(function(){
          if (scope.currentIdx <= 0 && !rotate) return debounce = null
          if (scope.currentIdx <= 0 && rotate) scope.currentIdx = scope.items.length
          if (scope.selectPrev) scope.selectPrev()
          _select(--scope.currentIdx)
          debounce = null
        }, debounceTime)
      }
      function _next() {
        if (debounce) return
        debounce = $timeout(function(){
          if (scope.currentIdx >= scope.lastIdx && !rotate) return debounce = null
          if (scope.currentIdx >= scope.lastIdx && rotate) scope.currentIdx = -1
          if (scope.selectNext) scope.selectNext()
          _select(++scope.currentIdx)
          debounce = null
        }, debounceTime)
      }
      function _select(itemIdx) {
        currentItem = scope.items[itemIdx]
        if (scope.currentItem) scope.currentItem = currentItem
        if (scope.select) scope.select(currentItem)
      }
      scope.$watch('items', function() {
        _init()
      })
      scope.$watch('currentItem', function() {
        scope.currentIdx = scope.currentItem? scope.items.indexOf(scope.currentItem) : 0
      })
      scope.$watch('itemsToDisplay', function(newVal, oldVal) {
        if (newVal !== oldVal) {
          scope.currentIdx = 0
          scope.lastIdx = Math.floor((scope.items.length-1)/newVal)
        }
      })
    }
  }
}(window.angular, window.angular.element));

(function (angular, jq) {
  'use strict'

  /**
    MainApp countdown Directive
  **/

  angular
    .module('MainApp')
    .directive('countdown', Countdown)

  /* @ngInject */
  function Countdown($interval, moment) {
    var directive = {
      link: postLinkFunction,
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: '../js/directives/countdown/template.html',
      scope: {
        date: '@?',
        timezone: '@?',
        hideIfOver: '=?',
        countDown: '=?ngModel'
      }
    }
    return directive

    function postLinkFunction (scope, element, attributes) {
      // initialize scope object
      scope.hideIfOver = scope.hideIfOver != null? scope.hideIfOver : true
      scope.countDown  = scope.countDown  != null? scope.countDown : {}
      scope.date       = scope.countDown.date != null? scope.countDown.date : scope.date
      scope.timezone   = scope.countDown.timezone != null? scope.countDown.timezone : scope.timezone
      if (!scope.date) return console.error('Countdown directive need a valid date to work!')
      if (!scope.timezone) {
        scope.timezone = 'UTC'
        console.warn('Countdown timezone is set to UTC as default')
      }
      // localize moment date
      var currentTime  = moment().tz(scope.timezone)
      var raceTime     = moment.tz(scope.date, scope.timezone)
      scope.countDown.isOver = currentTime.isAfter(raceTime)
      // start countdown
      var cdownint = $interval(function() {
        scope.countDown.isOver = moment().tz(scope.timezone).isAfter(raceTime)
        if (scope.countDown.isOver) {
          scope.countDown.d = scope.countDown.h = scope.countDown.m = scope.countDown.s = '00'
          return $interval.cancel(cdownint)
        }
        var cdown = moment.tz(scope.date, scope.timezone).countdown()
        scope.countDown.d = cdown.days    >= 10? cdown.days    : '0' + cdown.days
        scope.countDown.h = cdown.hours   >= 10? cdown.hours   : '0' + cdown.hours
        scope.countDown.m = cdown.minutes >= 10? cdown.minutes : '0' + cdown.minutes
        scope.countDown.s = cdown.seconds >= 10? cdown.seconds : '0' + cdown.seconds
      }, 1000)
    }
  }
}(window.angular, window.angular.element));

(function (angular, _) {
  'use strict'

  /**
    Lodash constant wrapper
  **/

  angular
    .module('MainApp')
    .value('_', _)

}(window.angular, window._));

(function (angular, d3) {
  'use strict'

  /**
    d3 constant wrapper
  **/

  angular
    .module('MainApp')
    .value('d3', d3)

}(window.angular, window.d3));

(function (angular, moment) {
  'use strict'

  /**
    moment constant wrapper
  **/

  angular
    .module('MainApp')
    .value('moment', moment)

}(window.angular, window.moment));

(function (angular, later) {
  'use strict'

  /**
    later constant wrapper
  **/

  angular
    .module('MainApp')
    .value('later', later)

}(window.angular, window.later));

(function (angular, TweenLite, TweenMax, TweenPlugin, TimelineLite, TimelineMax) {
  'use strict'

  /**
    gsap constants wrapper
  **/

  angular
    .module('MainApp')
    .value('TweenLite', TweenLite)
    .value('TweenMax', TweenMax)
    .value('TweenPlugin', TweenPlugin)
    .value('TimelineLite', TimelineLite)
    .value('TimelineMax', TimelineMax)

}(window.angular, window.TweenLite, window.TweenMax, window.TweenPlugin, window.TimelineLite, window.TimelineMax));

(function (angular, isMobile) {
  'use strict'

  /**
    isMobile constant wrapper
  **/

  angular
    .module('MainApp')
    .constant('isMobile', isMobile)

}(window.angular, window.isMobile));

(function (angular, fastclick) {
  'use strict'

  /**
    fastclick constant wrapper
  **/

  angular
    .module('MainApp')
    .value('fastclick', fastclick)

}(window.angular, window.FastClick));

(function (angular, everpolate) {
  'use strict'

  /**
    everpolate constant wrapper
  **/

  angular
    .module('MainApp')
    .value('everpolate', everpolate)

}(window.angular, window.everpolate));

(function (angular) {
  'use strict'

  angular
    .module('MainApp')
    // .value('beUrl', 'http://192.168.3.10:5001/')
    .value('beUrl', 'http://backend.enelformulae.todo.to.it')
    .value('appUrl', 'http://formulae.enel.com/app')
    .value('gameUrl', 'http://formulae.enel.com/game')
    .value('currentSeason', {id: 's4'})
    .value('showcaseRace', {id: 'r9'})

}(window.angular));

(function (angular) {
  'use strict'

  /**
    MainApp
    httpProvider configurations for MainApp
  **/

  angular
    .module('MainApp')
    .config(AppConfig)

  /* @ngInject */
  function AppConfig($httpProvider) {

    // Is a Boolean that indicates whether or not cross-site Access-Control requests
    // should be made using credentials such as cookies or authorization headers.
    // The default is false. Set to true to send credentials in cross-site XMLHttpRequest invocations.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Requests_with_credentials
    $httpProvider.defaults.withCredentials = false
  }
}(window.angular));

(function (angular) {
  'use strict'

  /**
    MainApp
    translateProvider configurations for MainApp
  **/

  angular
    .module('MainApp')
    .config(AppConfig)

  /* @ngInject */
  function AppConfig($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: './locales/',
      suffix: '.json'
    })
    // var availableLanguages = ['en', 'it', 'fr', 'de', 'es']
    var availableLanguages = ['en', 'it', 'es']
    $translateProvider.registerAvailableLanguageKeys(availableLanguages)
    $translateProvider.preferredLanguage(availableLanguages[0])
  }
}(window.angular));

(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('MainApp')
    .service('RacesSrv', ContructorForRacesSrv)

  /* @ngInject */
  function ContructorForRacesSrv($rootScope, $http, $q, currentSeason) {
    var self = this

    var seasonsUrl = '../assets/jsonData/seasons.json'
    var seasons = null
    var races = {}
    var racesData = {}

    self.getSeasons = _getSeasons
    self.getRaces = _getRaces
    self.getRace = _getRace
    self.getRaceData = _getRaceData
    self.getCurrentRace = _getCurrentRace
    self.getRaceWithData = _getRaceWithData
    self.getCurrentSeason = _getCurrentSeason

    // instance methods
    function _getSeasons() {
      return seasons ? $q.resolve(seasons) : _initializeSeasons()
    }
    function _getCurrentSeason() {
      return  $q.resolve(_getRaces())
                .then(function(res) {
                  var races = res
                  var firstRace = _.first(races)
                  var seasonStartDay = moment(firstRace.date, "DD MMM YYYY").subtract(1, "days")
                  var checkTime = moment().tz(firstRace.timezone)
                  if (checkTime.diff(seasonStartDay, "days") > 0) currentSeason.live = true
                  return currentSeason
                }, function(err) {
                  console.error(err)
                  return {}
                })
    }
    function _getRaces(season) {
      var season = season || currentSeason
      return races[season.id] ? $q.resolve(races[season.id]) : _initializeRaces(season)
    }
    function _getRace(season, race) {
      return  $q.resolve(_getRaces(season))
                .then(function(res) {
                  var races = res
                  return _.find(races, race)
                }, function(err) {
                  console.error(err)
                  return {}
                })
    }
    function _getCurrentRace(closest) {
      return  $q.resolve(_getRaces())
                .then(function(res) {
                  var races = res
                  var currentRace = _.find(races, { live: true })
                  if (!currentRace && closest.future) currentRace = _.find(races, closest)
                  if (!currentRace && closest.past) currentRace = _.findLast(races, closest)
                  return currentRace
                }, function(err) {
                  console.error(err)
                  return {}
                })
    }
    function _getRaceData(season, race) {
      var dataKey = season.id+race.id
      return racesData[dataKey] ? $q.resolve(racesData[dataKey]) : _initializeRaceData(season, race)
    }
    function _initializeRaceData(season, race) {
      return $http.get('../assets/jsonData/'+season.id+'/history/'+season.id+race.id+'.json')
                  .then(function(res){
                    var dataKey = season.id+race.id
                    racesData[dataKey] = res.data
                    return racesData[dataKey]
                  }, function (err) {
                    return {}
                    console.error(err)
                  })
    }
    function _getRaceWithData(season, race) {
      return $q.all([_getRace(season, race),
                     _getRaceData(season, race)])
                .then(function (res) {
                  return _.assign(res[0], res[1])
                }, function (err) {
                  console.error(err)
                })
    }

    function _initializeSeasons() {
      return $http.get(seasonsUrl)
                  .then(function(res){
                    seasons = res.data.seasons
                    return seasons
                  }, function (err) {
                    console.error(err)
                  })
    }
    function _initializeRaces(season) {
      return $http.get('../assets/jsonData/'+season.id+'/races.json')
                  .then(function(res) {
                    races[season.id] = res.data.races
                    _.forEach(races[season.id], function (r, i) {
                      var today_tz = moment().tz(r.timezone)
                      var r_day = moment(r.date, "DD MMM YYYY").utcOffset('+00:00', true)
                      var diff = r_day.diff(today_tz.clone().utcOffset('+00:00', true), "hours", true)
                      // console.log(r_day.format(), today_tz.format())
                      // console.log(diff, today_tz.clone().add(diff,'hours').format())
                      if (diff <= -24) r.past = true
                      else if (diff >= -5) r.future = true
                      else r.live = true
                    })
                    return races[season.id]
                  }, function(err) {
                    console.error(err)
                  })
    }
  }

}(window.angular));

(function (angular) {
  'use strict'

  /**
    Module configuration for WebApp
  **/

  angular
    .module('WebApp', [
      'ui.router',
      'MainApp',
      'SnippetManager',
      'Streamgraph',
      'DonutChart'
    ])

}(window.angular));

(function (angular) {
  'use strict'

  /**
    Run configurations for WebApp
  **/

  angular
    .module('WebApp')
    .run(RunWebApp)

  /* @ngInject */
  function RunWebApp(later) {

    // var schedule = later.parse.cron('4,9,14,19,24,29,34,39,44,49,54,59 * * * *')
    // var schedule = later.parse.text('every '+ 1 +' minutes')
    // console.info("Setting schedule: ", schedule)
    // function log() {
    //   console.log('schedule to update all models every 5 minutes')
    // }
    // later.setInterval(log, schedule)
  }

}(window.angular));

(function (angular) {
  'use strict'

  /**
    Routing configurations for WebApp
  **/

  angular
    .module('WebApp')
    .config(RouteConfig)

  /* @ngInject */
  function RouteConfig($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, isMobile, $locationProvider, $translateProvider) {

    // Allow case insensitive urls
    $urlMatcherFactoryProvider.caseInsensitive(true)
    // Normalize case insensitive urls
    $urlRouterProvider.rule(function ($injector, $location) {
      // what this function returns will be set as the $location.url
      var path = $location.path(), normalized = path.toLowerCase()
      if (path !== normalized) {
        // instead of returning a new url string, I'll just change the $location.path directly
        // so I don't have to worry about constructing a new url string and
        // so no state change occurs
        $location.replace().path(normalized)
      }
    })

    var defaultLang = $translateProvider.preferredLanguage()
    $urlRouterProvider.when('', '/'+defaultLang+'/landing')
    $urlRouterProvider.when('/', '/'+defaultLang+'/landing')
    $urlRouterProvider.when('/landing', '/'+defaultLang+'/landing/')
    $urlRouterProvider.otherwise('/'+defaultLang+'/landing')

    $stateProvider
      // .state('404', {
      //   url: '/404',
      //   templateUrl: 'templates/404.html'
      // })
      .state('landing', {
        url: '/:lang/landing',
        resolve: {
          upcomings: function (RacesSrv) {
            return RacesSrv.getRaces()
          },
          currentRace: function (RacesSrv) {
            return RacesSrv.getCurrentRace({ future: true })
          },
          currentSeason: function (RacesSrv) {
            return RacesSrv.getCurrentSeason()
          }

        },
        controller: 'LandingCtrl',
        controllerAs: 'landing',
        templateUrl: 'templates/landing.html'
      })
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('LandingCtrl', landingCtrl)

  /* @ngInject */
  function landingCtrl ($scope, $timeout, $http, $translate, $state, $stateParams, _, currentSeason, upcomings, currentRace, appUrl, gameUrl) {
    var vm = this
    $scope.appUrl = appUrl
    $scope.gameUrl = gameUrl
    $scope.languages = $translate.getAvailableLanguageKeys() || []
    if ($scope.languages.length <= 1) $scope.languages = []
    $scope.toggleMenu = function() {
      $('#ham').toggleClass('close')
      $('#landing ul.langs').toggleClass('open')
    }
    $scope.currentLang = $translate.use()
    $scope.gameLang = checkGameLang()
    function checkGameLang() {
      switch ($scope.currentLang) {
        case 'en':
          return 'eng'
        case 'it':
          return 'ita'
        case 'es':
          return 'esp'
        default:
          return 'eng'
      }
    }
    $scope.changeLanguage = function(key){
      var params = angular.extend($stateParams, {lang: key})
      $scope.toggleMenu()
      $translate.use(key)
      $state.go($state.current, params, {reload: false, notify: true})
      $scope.currentLang = key
      $scope.gameLang = checkGameLang()
      console.log($scope.currentLang, $scope.gameLang)
      if (!$scope.$$phase) $scope.$digest()
    }

    $scope.webgl = true
    function detectWebGLContext () {
      // Create canvas element. The canvas is not added to the
      // document itself, so it is never displayed in the
      // browser window.
      var canvas = document.createElement("canvas");
      // Get WebGLRenderingContext from canvas element.
      var gl = canvas.getContext("webgl")
        || canvas.getContext("experimental-webgl");
      // Report the result.
      if (gl && gl instanceof WebGLRenderingContext) {
        $scope.webgl = true
      } else {
        $scope.webgl = false
      }
    }
    detectWebGLContext()

    $scope.compatibilityMsg = ''
    if (bowser.msie) $scope.compatibilityMsg = 'Please use Chrome to enjoy the experience.'
    if (!bowser.chrome) $scope.compatibilityMsg = 'Experience optimised for Chrome.'

    vm.currentSeason = currentSeason
    vm.upcomings = upcomings
    vm.currentRace = currentRace

    var offX = $(window).width() * 10 / 100
    $timeout(function(){ $('#landing #upcoming nav').scrollLeft($('#'+vm.currentRace.id).offset().left + - offX) }, 1000)

    // twit feed
    vm.tweets = []
    retrieveTweetFeed()
    function retrieveTweetFeed() {
      return $http.get('https://runkit.io/marcoaimo/enelfetweetfeed/4.0.0')
                  .then(function(res) {
                    console.log(res.data)
                    vm.tweets = res.data.items
                    // after loaded the tweet feed append embed script from twitter
                    var twitScript = $('<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>')
                    $timeout(function() {
                      $('.twitfeed-wrapper').append(twitScript)
                    },100)
                    // _.each(vm.tweets, function(tw) {
                    //   twttr.widgets
                    //        .createTweet(tw.id, $('.twitfeed-wrapper')[0], {theme: 'light'})
                    //        .then(function(el) {
                    //         // $(el).attr('style')
                    //         // var twbody = $(el.contentDocument.body).find('.EmbeddedTweet')
                    //        })
                    // })
                    $scope.twitDisplayNum = _getTwitDisplayNum()
                  }, function(err) {
                    console.error(err)
                  })
    }

    // twit carousel
    angular.element(window).bind('resize', function() {
      var newVal = _getTwitDisplayNum()
      if ($scope.twitDisplayNum !== newVal) {
        TweenMax.to('.twitter-tweet', .5, { x: '0%' })
        $scope.twitDisplayNum = newVal
      }
      // manuall $digest required as resize event
      // is outside of angular
      if (!$scope.$$phase) $scope.$digest()
    })
    function _getTwitDisplayNum() {
      var twWrapW = $('.twitfeed-wrapper').width()
      if (window.matchMedia("(max-width: 40em)").matches) {
        return 1
      } else if (window.matchMedia("(max-width: 52em)").matches) {
        return 2
      } else {
        return 3
      }
    }
    $scope.twit_previous = function() {
      var wrapw = $('.twitfeed-wrapper').width()
      // var span = wrapw * 2.5 /100
      var span = +$('.twitter-tweet').css('margin').split('px')[1]
      var twwidth = $('.twitter-tweet').width()
      TweenMax.to('.twitter-tweet', .5, { x: '+='+(wrapw+span-0.5) })
    }
    $scope.twit_next = function() {
      var wrapw = $('.twitfeed-wrapper').width()
      // var span = wrapw * 2.5 /100
      var span = +$('.twitter-tweet').css('margin').split('px')[1]
      TweenMax.to('.twitter-tweet', .5, { x: '-='+(wrapw+span-0.5) })
    }

    // fix ie svg
    if (bowser.msie) {
      $timeout(_setSvgSize, 1000)
      angular.element(window).bind('resize', _setSvgSize)
    }
    function _setSvgSize() {
      var svgs = $('svg')
      _.each(svgs, function(svg) {
        console.log(svg)
        var $svg = $(svg)
        var w = $svg.width(),
            h = $svg.height(),
            vw = $svg.attr('viewBox').split(' ')[2],
            vh = $svg.attr('viewBox').split(' ')[3]
        var hstyle = Math.round((w*vh)/vw)
        var wstyle = Math.round((h*vw)/vh)
        console.log(w, h, vw, vh, hstyle, wstyle)
        if (hstyle === wstyle) return
        $svg.css({ height: hstyle/10 +'rem' })
        // $svg.css({ width: wstyle/10 +'rem' })
      })
    }

    // -------

    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }
}(window.angular));

//# sourceMappingURL=main.js.map