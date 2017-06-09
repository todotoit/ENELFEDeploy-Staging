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
