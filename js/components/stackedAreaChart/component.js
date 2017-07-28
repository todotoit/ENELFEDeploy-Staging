(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('StackedAreaChart')
    .component('areaChart', {
      templateUrl: '../js/components/stackedAreaChart/template.html',
      controller: AreaChartCtrl,
      controllerAs: 'areaChart',
      bindings: {
        datasource: '<',
        model: '@'
      }
    })

  /* @ngInject */
  function AreaChartCtrl($scope, $element, $attrs, d3, _) {
    var ctrl = this

    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    // ctrl.$onInit = init
    ctrl.$onChanges = update

    // -------- SVG ELEMENTS ---------
    var svg, box, w, h, p,                    // svg config
        axY, axX,                             // axis and scales config
        areas, lns, interpolation = 'basis', // chart paths config
        delay = 100, duration = 300           // animation config

    // -------- SCALES ---------
    var Y = d3.scale.linear()
    var X = d3.time.scale()

    // -------- AXIS ---------
    var formatY = d3.format('.0f')
    var axisY   = d3.svg.axis()
                    .scale(Y)
                    .orient('left')
                    .tickSize(0)
                    .tickFormat(function(d,i) {
                      if(i === 0) return
                      var unit = 'kW'
                      if (ctrl.model === 'storage') unit = '%'
                      return formatY(d)+unit
                    })

    var formatX = d3.time.format('%H:%M')
    var axisX   = d3.svg.axis()
                    .scale(X)
                    .orient('bottom')
                    .tickSize(1)
                    .ticks(d3.time.hours)
                    .tickFormat(function(d,i) {
                      if(i === 0) return
                      return formatX(d)
                    })

    // -------- STACK ---------
    var stack = d3.layout.stack()
                  .values(function(d) { return d.values })
                  .x(function(d) { return moment(d.h) })
                  .y(function(d) { return d.v })

    // -------- STACKED AREAS ---------
    var area = d3.svg.area()
                 .x(function(d) { return p + X(moment(d.h)) })
                 .y0(function(d) { return p + Y(d.y0) })
                 .y1(function(d) { return p + Y(d.y+d.y0) })
                 .interpolate(interpolation)

    // -------- TOP LINE ---------
    var topLine = d3.svg.line()
                    .x(function(d, i){ return p + X(moment(d.h)) })
                    .y(function(d, i){ return p + Y(d.v) })
                    .interpolate(interpolation)

    function _emptyData(data) {
      var values = data.values
      var emptydata = {
        key: data.key,
        values: values.map(function(d){ return { h: d.h, v: 0 } })
      }
      return emptydata
    }

    function init() {
      console.log('init areaChart')
      var data = ctrl.datasource

      // -------- INITIALIZE CHART ---------
      svg = d3.select($element.find('svg').get(0))
      if (ctrl.model === 'storage') svg.attr('viewBox', '0 0 600 350')
      box = svg.attr('viewBox').split(' ')
      w   = +box[2] // width
      h   = +box[3] // height
      p   = 30      // padding
      // create path for each area
      areas = svg.append('g')
      _.times(data.length, function(i) {
        areas.append('path').attr('class', 'area area'+(i+1))
      })
      // create path for top line
      lns = svg.append('g').append('path')
      // create path for axis
      axY = svg.append('g')
               .attr('transform', 'translate('+p+', '+p+')')
               .attr('class', 'axis')
      axX = svg.append('g')
               .attr('transform', 'translate('+p+', '+(h-p)+')')
               .attr('class', 'axis')

      // Initialize chart with emptyData
      var emptydata = _.map(data, function(d) {
        return _emptyData(d)
      })
      emptydata = stack(emptydata)

      // -------- DATA MAP ---------
      var emptyValues  = _(emptydata).groupBy('key').mapValues(function(d){ return d[0].values }).merge().values().flatten().value()
      var emptyTotData = _(emptyValues).groupBy('h').map(function(d){ return { h:d[0].h, v:_.sumBy(d,'v') } }).value()
      var max = 0
      // update scales domain and range
      var xDomain = d3.extent(data[0].values, function(d) { return moment(d.h) })
      X.domain(xDomain)
       .range([0, w-(p*2)])
      var yDomain = [0, max]
      Y.domain(yDomain)
       .range([h-(p*2), 0])
      // update charts
      areas.selectAll('path')
           .data(emptydata)
           .attr('d', function(d){ return area(d.values) })
      lns.attr('d', topLine(emptyTotData))
         .style('fill', 'none')
         .style('stroke', 'white')
         .style('stroke-width', 0)
      // update axis data
      axY.call(axisY)
      axX.call(axisX)
    }

    function update(changedObj) {
      var prevData = changedObj.datasource.previousValue
      var data     = changedObj.datasource.currentValue
      // !!
      // https://github.com/angular/angular.js/issues/14433
      // for some weird reason component $onChanges is called before $onInit
      // so we assume that if we don't have prevData the components is never being initialized
      if (_.isEmpty(prevData)) init()
      console.log('update areaChart')
      data = stack(data)

      // -------- DATA MAP ---------
      var lastIdx = d3.min(data, function(d) {return d.values.length})
      var values  = _(data).groupBy('key').mapValues(function(d){ return d[0].values.slice(0, lastIdx) }).merge().values().flatten().value()
      var totData = _(values).groupBy('h').map(function(d){ return { h:d[0].h, v:_.sumBy(d,'v') } }).value()
      var max     = _.maxBy(totData, 'v').v
      if (ctrl.model === 'storage') max = 100
      // update scales domain and range
      var xDomain = d3.extent(data[0].values, function(d) { return moment(d.h) })
      X.domain(xDomain)
       .range([0, w-(p*2)])
      var yDomain = [0, max]
      Y.domain(yDomain)
       .range([h-(p*2), 0])
      // update charts
      areas.selectAll('path')
           .data(data)
           .transition()
           .delay(delay)
           .duration(duration)
           .attr('d', function(d){
              return area(d.values)
            })
      var strokeWidth = data.length
      // check empty data set
      _.each(data, function(d) { if (_.every(d.values, {v: 0})) strokeWidth-- })
      // if data set is complete add 1 point to stroke
      if (strokeWidth === data.length) strokeWidth+=1
      lns.transition()
         .delay(delay)
         .duration(duration)
         .attr('d', topLine(totData))
         //.style('stroke-width', strokeWidth)//removing the stroke
      // update axis data
      axY.transition().delay(delay).call(axisY)
      axX.transition().delay(delay).call(axisX)
    }
  }
}(window.angular, window.angular.element));
