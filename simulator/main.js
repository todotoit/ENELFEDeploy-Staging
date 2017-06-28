(function(window, $, _, d3) {
  'use strict'

  // -------- SVG ELEMENTS ---------
  var svgContainer,
      svg, box, w, h, p,                         // svg config
      axY, axX, threshold,                       // axis and scales config
      defs, grad,                                // gradients
      areas, lns, lnsTop, lnsStor,               // chart paths
      interpolation = 'basis',                   // chart paths config
      delay = 200, duration = 450, ease = 'quad' // animation config

  // -------- STORAGE CONST ---------
  var maxScale      = null
  var storageOffset = 50
  var threshFactor  = 0.45

  // -------- SCALES ---------
  var Y      = d3.scale.linear()
  var YStor  = d3.scale.linear()
  var X      = d3.scale.linear()

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

  // var axisX   = d3.svg.axis()
  //                 .scale(X)
  //                 .orient('bottom')
  //                 .tickSize(1)
  //                 .tickFormat(function(d,i) {
  //                   if(i === 0) return
  //                   return d
  //                 })

  // -------- STACK ---------
  var stack = d3.layout.stack()
                .values(function(d) { return d.values })
                .x(function(d,i)    { return i })
                .y(function(d)      { return d.v })

  // -------- STACKED AREAS ---------
  var area = d3.svg.area()
               .x(function(d,i) { return p + X(i) })
               .y0(function(d)  { return h - p })
               .y1(function(d)  { return p + YStor(d.y+d.y0) })
               .interpolate(interpolation)

  // -------- TOP LINES ---------
  var topLine   = d3.svg.line()
                    .x(function(d,i) { return p + X(i) })
                    .y(function(d,i) { return p + Y(d.v) })
                    .interpolate(interpolation)
  var storLine  = d3.svg.line()
                    .x(function(d,i) { return p + X(i) })
                    .y(function(d,i) { return p + YStor(d.v) })
                    .interpolate(interpolation)
  var stackLine = d3.svg.line()
                    .x(function(d,i) { return p + X(i) })
                    .y(function(d,i) { return p + Y(d.y+d.y0) })
                    .interpolate(interpolation)

  // -------- CHART SVG TEMPLATE ---------
  var tpl = '<svg id="teamAreaChart" viewBox="0 0 600 500"></svg>'

  function _emptyData(data) {
    var values = data.values
    var emptydata = {
      key: data.key,
      values: values.map(function(d){ return { v: 0 } })
    }
    return emptydata
  }

  function init(data, max) {
    if (_.isEmpty(data)) return console.error('data is empty')

    // -------- INITIALIZE CHART ---------
    svg = $(svgContainer).append(tpl).find('svg')
    box = svg.attr('viewBox').split(' ')
    w   = +box[2] // width
    h   = +box[3] // height
    p   = 30      // padding
    svg = d3.select(svg.get(0))
    // create areas gradient fill
    defs = svg.append('defs')
    grad = defs.append('linearGradient').attr('id', 'stor3Grd').attr('gradientUnits', 'userSpaceOnUse')
               .attr('x1', 0).attr('y1', p).attr('x2', 0).attr('y2', h-p)
    grad.append('stop').attr('offset', 0).attr('stop-color', 'lightblue')
    grad.append('stop').attr('offset', 1-threshFactor).attr('stop-color', 'lightblue')
    grad.append('stop').attr('class', 'storstop').attr('offset', 1-threshFactor).attr('stop-color', 'blue')
    grad.append('stop').attr('offset', 1).attr('stop-color', '#ffffff')
    // create areas group
    areas = svg.append('g').attr('class', 'areas')
    // create lines groups
    lns = svg.append('g').attr('class','toplines')
    // create path for each data
    _.each(data, function(d) {
      areas.append('path').attr('class', 'area area-'+_.kebabCase(d.key))
      lns.append('path').attr('class', 'arealine line-'+_.kebabCase(d.key))
    })
    lnsTop  = lns.append('g').attr('class', 'topline').append('path')
    lnsStor = lns.append('g').attr('class', 'topline storage').append('path')
    lns.select('.topline').append('circle').attr('class', 'topcircle')
    lns.select('.topline.storage').append('circle').attr('class', 'storcircle')
    lns.append('line').attr('class', 'threshold')
    // create path for axis
    axY = svg.append('g')
             .attr('transform', 'translate('+p+', '+p+')')
             .attr('class', 'axis')
    // axX = svg.append('g')
    //          .attr('transform', 'translate('+p+', '+(h-p)+')')
    //          .attr('class', 'axis')

    // Initialize chart with emptyData
    var emptydata = _.map(data, function(d) { return _emptyData(d) })
    emptydata = stack(emptydata)

    // -------- DATA MAP ---------
    var lastIdx        = d3.min(data, function(d) {return d.values.length})
    var emptyValues    = _(emptydata).groupBy('key').mapValues(function(d){ return d[0].values }).merge().values().flatten().value()
    var emptyTotData   = _(emptyValues).groupBy('h').map(function(d,i){ return { h:+i, v:_.sumBy(d,'v') } }).value()
    var max = maxScale = max || 0
    var thresh         = max * threshFactor
    console.log(thresh ,max, threshFactor)

    // update scales domain and range
    var xDomain = [0, lastIdx-1]
    var xRange  = [0, w-(p*2)]
    X.domain(xDomain).range(xRange)
    var yDomain = [0, max]
    var yRange  = [h-(p*2), 0]
    Y.domain(yDomain).range(yRange)
    YStor.domain(yDomain).range(yRange)

    // update charts
    areas.selectAll('path')
         .data(emptydata)
         .attr('d', function(d){ return area(d.values) })
         .attr('fill', function()  { return 'url(#'+grad.attr('id')+')' })
    lns.select('.threshold')
       .attr('x1', p)
       .attr('y1', p+Y(thresh))
       .attr('x2', w-p)
       .attr('y2', p+Y(thresh))
    lns.selectAll('.arealine')
       .data(emptydata)
       .attr('d', function(d) { return stackLine(d.values) })
    lnsTop.attr('d', topLine(emptyTotData))
    lnsStor.attr('d', storLine(emptyTotData))
    lns.selectAll('circle')
       .data(emptyTotData)
       .attr('r', 0)
       .attr("cx", function(d) { return w-p })
       .attr("cy", function(d) { return p+Y(d.v) })

    // update axis data
    axY.call(axisY)
    // axX.call(axisX)
  }
  function update(data, stored) {
    if (_.isEmpty(data)) return console.error('data is empty')
    data = stack(data)

    // -------- DATA MAP ---------
    var lastIdx = d3.min(data, function(d) {return d.values.length})
    var values  = _(data).groupBy('key').mapValues(function(d){ return d[0].values.slice(0, lastIdx) }).merge().values().flatten().value()
    var totData = _(values).groupBy('h').map(function(d,i){ return { h:+i, v:_.sumBy(d,'v') } }).value()
    var max     = maxScale || _.maxBy(totData, 'v').v
    var thresh  = maxScale * threshFactor

    // update scales domain and range
    // var xDomain = d3.extent(data[0].values, function(d,i) { return d.h })
    var xDomain = [0, lastIdx-1]
    var xRange  = [0, w-(p*2)]
    X.domain(xDomain).range(xRange)
    var yDomain = [0, max]
    var yRange  = [h-(p*2), 0]
    Y.domain(yDomain).range(yRange)
    stored? YStor.domain(yDomain).range([p+Y(thresh+storageOffset), Y(thresh)]) : YStor.domain(yDomain).range(yRange)

    // update charts
    areas.selectAll('path').data(data)
         .transition()
         .attr('d', function(d) { return area(d.values) })
    grad.select('.storstop')
        .transition()
        .attr('stop-color', function() { return stored? 'green': 'blue' })
    lns.selectAll('.arealine').data(data)
       .transition()
       .attr('d', function(d){ return stackLine(d.values) })
       .style('stroke-opacity',   function() { return stored? '.3': '1' })
    lnsTop
       .transition()
       .attr('d', topLine(totData))
       .style('stroke-dasharray', function() { return stored? '1 5': '' })
       .style('stroke-width',     function() { return stored? '1': '3' })
    lnsStor
       .transition()
       .attr('d', storLine(totData))
       .style('stroke-width',     function() { return stored? '3': '0' })
    lns.select('.topcircle')
       .transition()
       .attr('r',  function() { return stored? '1' : '5' })
       .attr("cx", function() { return w-p })
       .attr("cy", function() { return p + Y(_.last(totData).v) })
    lns.select('.storcircle')
       .transition()
       .attr('r',  function() { return stored? '5' : '0' })
       .attr("cx", function() { return w-p })
       .attr("cy", function() { return p + YStor(_.last(totData).v) })

    // update axis data
    axY.transition().delay(delay).call(axisY)
    // axX.transition().delay(delay).call(axisX)
  }
  function destroy() {}

  // -------- CONSTRUCTOR ---------
  function StackedAreaChart(container, datasource, maxScale) {
    var self = this
    self.update = update
    self.destroy = destroy
    self.container = svgContainer = container

    init(datasource, maxScale)
    return self
  }
  // -------- GLOBAL INTERFACE ---------
  window.StackedAreaChart = StackedAreaChart

}(window, window.jQuery, window._, window.d3));

(function(window, _) {
  'use strict'

  window.Simulator = window.Simulator || {}

  var appliances = [
    { key: 'Air Conditioning', values: [], status: 'off', maxV: 1080 },
    { key: 'Laser printer', values: [], status: 'off', maxV: 456 },
    { key: 'Microwave', values: [], status: 'off', maxV: 101 }
  ]

  var defaults = {
    sampling_rate: 1+' second', // scheduled update time
    appliances: appliances,
    num_of_appliances: appliances.length,
    dataset_length: 30
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));

(function(window, $, _, later, Simulator) {
  'use strict'

  var stuck = null
  var $apps = []
  var time = null
  var maxScale = 0
  var maxScaleOffset = 100
  var stored = false

  function toggleAppliance(app) {
    $(app).toggleClass('active')
    $(app).data('app').status == 'off'? $(app).data('app').status = 'on' : $(app).data('app').status = 'off'
    updateStorage()
  }

  function initializaStorage() {
    _.each(Simulator.appliances, function(app) {
      maxScale += app.maxV
      // initialize data
      _.times(Simulator.dataset_length, function(i) {
        var vv = 0
        Math.random() > 0.5? vv = app.maxV : vv = 0
        var v = { h: i, v: vv }
        app.values.push(v)
      })

      // populate ui list
      var $appElem = $('<li>'+app.key+'<br>maxV: '+app.maxV+'</li>')
      $appElem.data('app', app)
      $appElem.click(function() { return toggleAppliance(this) })
      $apps.push($appElem)
      $('#appliances').find('ul').append($appElem)
    })
    maxScale += maxScaleOffset
  }

  function updateStorage() {
    _.each(Simulator.appliances, function(app) {
      // remove first data
      app.values.shift()
      app.values = _.map(app.values, function(d,i) {
        if (i>0) app.values[i-1].v = d.v
        d.h--
        return d
      })
      // create new data if appliance is on
      var v = app.status === 'on'? { h: app.values.length, v: app.maxV } : { h: app.values.length, v: 0 }
      app.values.push(v)
    })
    stuck.update(Simulator.appliances, stored)
  }

  function startStorage() {
    // set schedule for updates
    var schedule = later.parse.text('every '+ Simulator.sampling_rate)
    console.info("Setting schedule every " + Simulator.sampling_rate + ": ", schedule)
    // start schedule
    time = later.setInterval(updateStorage, schedule)
  }
  function stopStorage() {
    time.clear()
    time = null
  }

  function handleEvents() {
    $(window).on('customEv', function(e,key) {
      switch (key) {
        case ' ':
          // console.warn('start/stop')
          time? stopStorage() : startStorage()
        break
        case '0':
        case 's':
          // console.warn('activate storage')
          stored? stored = false : stored = true
          stuck.update(Simulator.appliances, stored)
        break
        case '1':
        case '2':
        case '3':
          var appIdx = +key-1
          toggleAppliance($apps[appIdx])
        break
        default:
          return
        break
      }
    })
  }

  var bmod = false
  var bot = null
  function toggleBotMode() {
    bmod = !bmod
    if (bmod) {
      $('article').css('background', 'transparent')
      startStorage()
      bot = setInterval(function() {
        var choice = Math.floor(Math.random()*10)
        switch (choice) {
          case 0:
          case 5:
          case 9:
            $(window).trigger('customEv', 's')
          break
          case 1:
          case 2:
          case 3:
            $(window).trigger('customEv', choice.toString())
          break
          default:
            return
          break
        }
      }, 750)
    } else {
      $('article').css('background', 'white')
      stopStorage()
      clearInterval(bot)
      bot = null
    }
  }

  (function init() {
    initializaStorage()
    // initialie area chart
    stuck = new StackedAreaChart('#storage', Simulator.appliances, maxScale)
    handleEvents()
    startStorage()
    setTimeout(function() {
      stopStorage()
    }, 1000);
  })()

  // event handlers
  $(window).keydown(function(e) {
    if (e.altKey && e.keyCode === 66) return toggleBotMode()
    $(window).trigger('customEv', e.key)
  })

}(window, window.jQuery, window._, window.later, window.Simulator));

//# sourceMappingURL=main.js.map