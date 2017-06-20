(function(window, $, _, d3) {

  // -------- SVG ELEMENTS ---------
  var svg, box, w, h, p,                   // svg config
      axY, axX,                            // axis and scales config
      areas, lns, interpolation = 'basis', // chart paths config
      delay = 200, duration = 500          // animation config

  // -------- SCALES ---------
  var Y = d3.scale.linear()
  var X = d3.scale.linear()

  // -------- AXIS ---------
  var formatY = d3.format('.0f')
  var axisY   = d3.svg.axis()
                  .scale(Y)
                  .orient('left')
                  .tickSize(0)
                  .tickFormat(function(d,i) {
                    if(i === 0) return
                    return formatY(d)+'kW'
                  })

  var axisX   = d3.svg.axis()
                  .scale(X)
                  .orient('bottom')
                  .tickSize(1)
                  .tickFormat(function(d,i) {
                    if(i === 0) return
                    return d
                  })

  // -------- STACK ---------
  var stack = d3.layout.stack()
                .values(function(d) { return d.values })
                .x(function(d,i)    { return i })
                .y(function(d)      { return d.v })

  // -------- STACKED AREAS ---------
  var area = d3.svg.area()
               .x(function(d,i) { return p + X(i) })
               .y0(function(d)  { return p + Y(d.y0) })
               .y1(function(d)  { return p + Y(d.y+d.y0) })
               .interpolate(interpolation)

  // -------- TOP LINE ---------
  var topLine = d3.svg.line()
                  .x(function(d,i) { return p + X(i) })
                  .y(function(d,i) { return p + Y(d.v) })
                  .interpolate(interpolation)

  var tpl = '<svg id="teamAreaChart" viewBox="0 0 600 250">' +
            '  <linearGradient id="teamAreaChart_bl1" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="350">' +
            '    <stop offset="0%" stop-color="#7d0075"></stop>' +
            '    <stop offset="100%" stop-color="#e00b50"></stop>' +
            '  </linearGradient>' +
            '  <linearGradient id="teamAreaChart_bl2" gradientUnits="userSpaceOnUse" x1="0" y1="50" x2="0" y2="350">' +
            '    <stop offset="0%" stop-color="#8a2583"></stop>' +
            '    <stop offset="100%" stop-color="#ed1e60"></stop>' +
            '  </linearGradient>' +
            '</svg>'

  function _emptyData(data) {
    var values = data.values
    var emptydata = {
      key: data.key,
      values: values.map(function(d){ return { v: 0 } })
    }
    return emptydata
  }

  function init(container, data, max) {

    if (_.isEmpty(data)) return console.error('data is empty')

    // -------- INITIALIZE CHART ---------
    svg = $(container).append(tpl).find('svg')
    box = svg.attr('viewBox').split(' ')
    w   = +box[2] // width
    h   = +box[3] // height
    p   = 30      // padding
    // create path for each area
    svg = d3.select(svg.get(0))
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
    var emptyTotData = _(emptyValues).groupBy('h').map(function(d,i){ return { h:+i, v:_.sumBy(d,'v') } }).value()
    var max = max || 0
    // update scales domain and range
    var xDomain = d3.extent(data[0].values, function(d,i) { return i })
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
  function update(container, data, max) {
    if (_.isEmpty(data)) init(container, data)
    data = stack(data)

    // -------- DATA MAP ---------
    var lastIdx = d3.min(data, function(d) {return d.values.length})
    var values  = _(data).groupBy('key').mapValues(function(d){ return d[0].values.slice(0, lastIdx) }).merge().values().flatten().value()
    var totData = _(values).groupBy('h').map(function(d,i){ return { h:+i, v:_.sumBy(d,'v') } }).value()
    var max     = max || _.maxBy(totData, 'v').v

    // update scales domain and range
    var xDomain = d3.extent(data[0].values, function(d,i) { return i })
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

    // update axis data
    axY.transition().delay(delay).call(axisY)
    axX.transition().delay(delay).call(axisX)
  }
  function destroy() {}

  // -------- CONSTRUCTOR ---------
  function StackedAreaChart(container, datasource, maxScale) {
    var self = this
    self.update = update
    self.destroy = destroy

    init(container, datasource, maxScale)
    update(container, datasource, maxScale)
    return self
  }
  // -------- GLOBAL INTERFACE ---------
  window.StackedAreaChart = StackedAreaChart

}(window, window.jQuery, window._, window.d3));

(function(window, _) {
  window.Simulator = window.Simulator || {}

  var defaults = {
    sampling_rate: 1+' seconds' // scheduled update time
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));

(function(window, $, _, later, Simulator) {
  'use strict'

  var appliances = []
  var numOfApp = 5
  var dataRange = 30
  var maxScale = 0
  var maxScaleOffset = 100

  // create appliances
  _.times(numOfApp, function(i) {
    var ap = { key: 'appliance'+i, values: [], status: 'off', maxV: Math.round(Math.random()*500*100)/100 }
    maxScale += ap.maxV
    // initialize data
    _.times(dataRange, function(i) {
      var v = { h: i, v: 0 }
      ap.values.push(v)
    })
    appliances.push(ap)
    // populate ui list
    var $apElem = $('<li>'+ap.key+'<br>maxV: '+ap.maxV+'</li>')
    $apElem.data('app', ap)
    $apElem.click(function() {
      $(this).toggleClass('active')
      $(this).data('app').status == 'off'? $(this).data('app').status = 'on' : $(this).data('app').status = 'off'
      updateStorage()
    })
    $('#appliances').find('ul').append($apElem)
  })
  maxScale += maxScaleOffset
  // initialie area chart
  var stuck = new StackedAreaChart('#storage', appliances, maxScale)

  // schedule updates
  var schedule = later.parse.text('every '+ Simulator.sampling_rate)
  console.info("Setting schedule every " + Simulator.sampling_rate + ": ", schedule)
  function updateStorage() {
    // console.log('update storage')
    _.each(appliances, function(ap) {
      // remove first data
      ap.values.shift()
      ap.values = _.map(ap.values, function(d) {
        d.h--
        return d
      })
      // create new data if appliance is on
      var v = ap.status === 'on'? { h: ap.values.length, v: ap.maxV } : { h: ap.values.length, v: 0 }
      ap.values.push(v)
    })
    stuck.update('#storage', appliances, maxScale)
  }
  later.setInterval(updateStorage, schedule)


}(window, window.jQuery, window._, window.later, window.Simulator));

//# sourceMappingURL=main.js.map