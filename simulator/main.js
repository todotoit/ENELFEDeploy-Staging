(function(window, $, _, d3) {
  'use strict'

  // -------- SVG ELEMENTS ---------
  var svgContainer, mask,
      svg, box, w, wright, h, p, pright,         // svg config
      axY, axX, threshold,                       // axis and scales config
      defs, grad, gradStor,                      // gradients
      areas, areaTot, areaTotStor,               // chart paths
      lns, lnsTop, lnsStor,
      circles, labels,
      interpolation = 'basis',                   // chart paths config
      delay = 0, duration = 450, ease = 'quad'   // animation config

  // -------- STORAGE CONST ---------
  var maxScale      = null
  var dataLength    = 30
  var storageOffset = 50
  var threshFactor  = 0
  var dangerFactor  = 0

  // -------- SCALES ---------
  var Y        = d3.scale.linear()
  var YStor    = d3.scale.linear()
  var X        = d3.scale.linear()
  var YStorInv = d3.scale.linear()

  // -------- AXIS ---------
  // var formatY = d3.format('.0f')
  // var axisY   = d3.svg.axis()
  //                 .scale(Y)
  //                 .orient('left')
  //                 .tickSize(0)
  //                 .tickFormat(function(d,i) {
  //                   if(i === 0) return
  //                   return formatY(d)+'kW'
  //                 })

  var axisX   = d3.svg.axis()
                  .scale(X)
                  .orient('top')
                  .tickFormat('')

  // -------- STACK ---------
  var stack = d3.layout.stack()
                .values(function(d) { return d.values })
                .x(function(d,i)    { return i })
                .y(function(d)      { return d.v })

  // -------- STACKED AREAS ---------
  var area = d3.svg.area()
               .x(function(d,i) { return p + X(i) })
               .y0(function(d)  { return h - p })
               .y1(function(d)  { return p + Y(d.y+d.y0) })
               .interpolate(interpolation)
  var areaStor = d3.svg.area()
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
  var tpl = '<svg id="teamAreaChart" viewBox="0 0 600 450"></svg>'

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
    svg = $(svgContainer).append(tpl).find('svg#teamAreaChart')
    box = svg.attr('viewBox').split(' ')
    w   = +box[2] // width
    h   = +box[3] // height
    p   = 30      // padding
    pright = 75   // padding right
    wright = w-pright
    svg = d3.select(svg.get(0))
    // create areas gradient fill
    defs = svg.append('defs')
    var maskGrad = defs.append('linearGradient').attr('id', 'teamAreaChart_mask_grad').attr('gradientUnits', 'userSpaceOnUse')
                       .attr('x1', 0).attr('y1', 0).attr('x2', wright).attr('y2', 0)
    maskGrad.append('stop').attr('offset', 0).attr('stop-color', '#000')
    maskGrad.append('stop').attr('offset', p/wright).attr('stop-color', '#000')
    maskGrad.append('stop').attr('offset', p/wright).attr('stop-color', '#fff')
    maskGrad.append('stop').attr('offset', 1-(p*0.6)/wright).attr('stop-color', '#fff')
    maskGrad.append('stop').attr('offset', 1-p/wright).attr('stop-color', '#000')
    maskGrad.append('stop').attr('offset', 1).attr('stop-color', '#000')
    mask = defs.append('mask').attr('id', 'mask-border')
    mask.append('rect').attr('x',0).attr('y',0).attr('width',wright).attr('height',h).attr('fill', 'url(#teamAreaChart_mask_grad)')
    // gradient for fixed area
    grad = defs.append('linearGradient').attr('id', 'areaGrd').attr('gradientUnits', 'userSpaceOnUse')
               .attr('x1', 0).attr('y1', p).attr('x2', 0).attr('y2', h-p)
    grad.append('stop').attr('offset', 0).attr('stop-color', '#fc1c63')
    grad.append('stop').attr('offset', 1-(threshFactor+threshFactor/1.5)).attr('stop-color', '#fc1c63')
    grad.append('stop').attr('offset', 1-threshFactor).attr('stop-color', '#0555f9')
    grad.append('stop').attr('offset', 1).attr('stop-color', '#ffffff')
    // gradient for storage area
    gradStor = defs.append('linearGradient').attr('id', 'storAreaGrd').attr('gradientUnits', 'userSpaceOnUse')
               .attr('x1', 0).attr('y1', p).attr('x2', 0).attr('y2', h-p)
    gradStor.append('stop').attr('offset', 0).attr('stop-color', '#fc1c63')
    gradStor.append('stop').attr('offset', 1-(threshFactor+threshFactor/1.5)).attr('stop-color', '#fc1c63')
    gradStor.append('stop').attr('class', 'storstop').attr('offset', 1-threshFactor).attr('stop-color', '#0555f9')
    gradStor.append('stop').attr('offset', 1).attr('stop-color', 'rgba(255,255,255,.1)')
    // create areas group
    areas = svg.append('g').attr('class', 'areas').attr('mask', 'url(#mask-border)')
    areaTot = areas.append('g').attr('class', 'areaTot')
    areaTotStor = areas.append('g').attr('class', 'areaStorage')
    // create lines groups
    lns = svg.append('g').attr('class','toplines').attr('mask', 'url(#mask-border)')
    // create circles group
    circles = svg.append('g').attr('class','circles')
    labels  = svg.append('g').attr('class', 'labels')
    // create path for each data
    _.each(data, function(d) {
      areaTot.append('path').attr('class', 'area area-'+_.kebabCase(d.key))
      areaTotStor.append('path').attr('class', 'area area-'+_.kebabCase(d.key))
      lns.append('path').attr('class', 'arealine line-'+_.kebabCase(d.key))
      labels.append('g').attr('class', 'label label-'+_.kebabCase(d.key))
    })
    lnsTop  = lns.append('g').attr('class', 'topline').append('path')
    lnsStor = lns.append('g').attr('class', 'topline storage').append('path')
    circles.append('circle').attr('class', 'topcircle')
    labels.append('g').attr('class', 'label toplabel').append('text').text('Energy demand')
    circles.append('circle').attr('class', 'storcircle')
    labels.append('g').attr('class', 'label storlabel').append('text').text('What your provider sees')

    // create threshold line
    lns.append('line').attr('class', 'threshold')
    lns.append('line').attr('class', 'danger')
    // create path for axis
    // axY = svg.append('g')
    //          .attr('transform', 'translate('+p+', '+p+')')
    //          .attr('class', 'axis')
    axX = svg.append('g')
             .attr('transform', 'translate('+p+', '+(h-p)+')')
             .attr('class', 'axis')

    // Initialize chart with emptyData
    var emptydata = _.map(data, function(d) { return _emptyData(d) })
    emptydata = stack(emptydata)

    // -------- DATA MAP ---------
    var lastIdx        = d3.min(data, function(d) {return d.values.length})
    var emptyValues    = _(emptydata).groupBy('key').mapValues(function(d){ return d[0].values }).merge().values().flatten().value()
    var emptyTotData   = _(emptyValues).groupBy('h').map(function(d,i){ return { h:+i, v:_.sumBy(d,'v') } }).value()
    var max = maxScale = max || 0
    var thresh         = max * threshFactor
    var danger         = max * dangerFactor

    // initialize scales domain and range
    var xDomain = [1, dataLength-1]
    var xRange  = [0, wright]
    X.domain(xDomain).range(xRange)
    var yDomain = [0, max]
    var yRange  = [h-(p*2), 0]
    Y.domain(yDomain).range(yRange)
    YStor.domain(yDomain).range(yRange)

    // initialize charts
    areaTot.selectAll('path')
           .data(emptydata)
           .attr('d', function(d){ return area(d.values) })
           .attr('fill', function()  { return 'url(#'+grad.attr('id')+')' })
    areaTotStor.selectAll('path')
               .data(emptydata)
               .attr('d', function(d){ return areaStor(d.values) })
               .attr('fill', function()  { return 'url(#'+gradStor.attr('id')+')' })
    lns.select('.threshold')
       .attr('x1', p)
       .attr('y1', p+Y(thresh))
       .attr('x2', wright)
       .attr('y2', p+Y(thresh))
    lns.select('.danger')
       .attr('x1', p)
       .attr('y1', p+Y(danger))
       .attr('x2', wright)
       .attr('y2', p+Y(danger))
    lns.append('text').text('Threshold')
       .attr('x', p+(p/2))
       .attr('y', Y(thresh)+(p/2))
    // lns.append('text').html('Extra demand')
    //    .attr('x', p+(p/2))
    //    .attr('y', h -p-(p/2) -Y(thresh/2))
    lns.append('text').text('Critical demand')
       .attr('class', 'danger')
       .attr('x', p+(p/2))
       .attr('y', Y(danger)+(p/2))
    lns.selectAll('.arealine')
       .data(emptydata)
       .attr('d', function(d) { return stackLine(d.values) })
    lnsTop.attr('d', topLine(emptyTotData))
    lnsStor.attr('d', storLine(emptyTotData))
    circles.selectAll('circle')
           .data(emptyTotData)
           .attr('r', 0)
           .attr('cx', function(d) { return wright-p })
           .attr('cy', function(d) { return p+Y(d.v) })
    labels.selectAll('.label')
           .attr('opacity', 0)
           .attr('transform', function(d) { return 'translate(' + wright +','+ (p+Y(_.last(emptyTotData).v)) +')' })
    labels.select('.toplabel')
           .attr('opacity', 1)
           .append('text')
           .attr('class', 'tot_value')
           .attr('y', 10)
           .text(_.last(emptyTotData).v + ' w')
    labels.select('.storlabel')
           .append('text')
           .attr('class', 'tot_value')
           .attr('y', 10)
           .text(_.last(emptyTotData).v + ' w')

    // initialize axis data
    // axY.call(axisY)
    axX.call(axisX.tickSize(h))
  }
  function update(data, stored, storUpdated) {
    if (_.isEmpty(data)) return console.error('data is empty')

    if (!storUpdated) {
      _.each(data, function(app) {
        // remove first data
        app.values.shift()
        app.values = _.map(app.values, function(d,i) {
          if (i>0) app.values[i-1].v = d.v
          d.h--
          return d
        })
      })
    }

    data = stack(data)

    // -------- DATA MAP ---------
    var lastIdx = d3.min(data, function(d) {return d.values.length})
    var values  = _(data).groupBy('key').mapValues(function(d){ return d[0].values.slice(0, lastIdx) }).merge().values().flatten().value()
    var totData = _(values).groupBy('h').map(function(d,i){ return { h:+i, v:_.sumBy(d,'v') } }).value()
    var max     = maxScale || _.maxBy(totData, 'v').v
    var thresh  = maxScale * threshFactor

    // update scales domain and range
    var xDomain = [1, dataLength-1]
    var xRange  = [0, wright]
    X.domain(xDomain).range(xRange)
    var yDomain = [0, max]
    var yRange  = [h-(p*2), 0]
    Y.domain(yDomain).range(yRange)
    stored? YStor.domain(yDomain).range([p+Y(thresh+storageOffset), Y(thresh)]) : YStor.domain(yDomain).range(yRange)
    YStorInv.domain(yRange).range(yDomain)

    // update charts
    areaTot.transition().attr('opacity', function() { return stored? .3 : 1 })
    areaTot.selectAll('path').data(data)
           .transition().duration(function() { return stored && storUpdated? duration : 0 })
           .delay(delay).ease(ease)
           .attr('d', function(d) { return area(d.values) })
           .attr('opacity', function() { return stored? .2 : .4 })
    areaTotStor.transition().attr('opacity', .7)
    areaTotStor.selectAll('path').data(data)
               .transition().duration(function() { return stored && storUpdated? duration : 0 })
               .delay(delay).ease(ease)
               .attr('d', function(d) { return areaStor(d.values) })
    gradStor.select('.storstop')
        .transition().duration(duration).delay(delay).ease(ease)
        .attr('stop-color', function() { return stored? '#55bd5a': '#0555f9' })
    lns.selectAll('.arealine').data(data)
       .transition().duration(function() { return stored && storUpdated? duration : 0 })
       .attr('d', function(d){ return stackLine(d.values) })
       .attr('stroke-width', function() { return stored? 0 : 0 })
       .style('stroke-opacity', function() { return stored? .3 : 1 })
    lnsTop
       .transition().delay(0).duration(function() { return stored && storUpdated? duration : 0 })
       .delay(0).ease(ease)
       .attr('d', topLine(totData))
       .attr('stroke-width', function() { return stored? 0 : 3 })
       .attr('stroke-opacity', function() { return stored? 0 : 1 })
    lnsStor
       .transition().delay(0).duration(function() { return stored && storUpdated? duration : 0 })
       .delay(0).ease(ease)
       .attr('d', storLine(totData))
       .style('stroke-width',     function() { return stored? 3 : 0 })
    circles.select('.topcircle')
           .transition()
           .duration(function() { return storUpdated? duration : duration+100 }).ease(ease)
           .delay(245)
           .attr('r',  function() { return stored? 0 : 5 })
           .attr('cx', function() { return X(dataLength-1)-p*0.6 })
           .attr('cy', function() { return p + Y(_.last(totData).v) })
    labels.select('.toplabel')
           .transition()
           .duration(function() { return storUpdated? duration : duration+100 }).ease(ease)
           .delay(245)
           .attr('transform', function(d) { return 'translate(' + wright +','+ (p+Y(_.last(totData).v)) +')' })
           .select('.tot_value')
           .text(_.last(totData).v + ' w')
    circles.select('.storcircle')
           .transition().duration(function() { return stored? duration : duration/2}).ease(ease)
           .attr('r',  function() { return stored? '5' : '0' })
           .attr('cx', function() { return X(dataLength-1)-p*0.6 })
           .attr('cy', function() { return p + YStor(_.last(totData).v) })
    labels.select('.storlabel')
           .transition().duration(function() { return stored? duration : duration/2}).ease(ease)
           .attr('transform', function(d) { return 'translate(' + wright +','+ (p+YStor(_.last(totData).v)) +')' })
           .attr('opacity', function() { return stored? 1 : 0 })
           .select('.tot_value')
           .text(Math.round(YStorInv(YStor(_.last(totData).v))) + ' w')

    // update axis data
    // axY.transition().delay(delay).call(axisY)
    axX.transition().delay(delay).call(axisX)
  }

  // -------- CONSTRUCTOR ---------
  function StackedAreaChart(container, datasource, dataset_length, maxScale, thFactor, dangFactor) {
    var self = this
    self.update = update
    self.container = svgContainer = container
    dataLength = dataset_length
    threshFactor = thFactor
    dangerFactor = dangFactor

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
    { key: 'Cooling', icon: 'icon_cooling.svg',  uid: ['B5C43A2A', '95E8432A'], status: 'off', values: [], maxV: 4000 },
    { key: 'Brewing', icon: 'icon_brewing.svg',  uid: ['C5DA2C2A', '857F3A2A'], status: 'off', values: [], maxV: 2000 },
    { key: 'Drying',  icon: 'icon_drying.svg',   uid: ['75423F2A', '25FB392A'], status: 'off', values: [], maxV: 1500 },
    { key: 'Eating',  icon: 'icon_heating.svg',  uid: ['3549482A', '8517412A'], status: 'off', values: [], maxV: 1200 },
    { key: '?',       icon: 'icon_printing.svg', uid: ['A5312E2A', 'C59E482A', 'A5DA422A'], status: 'off', values: [], maxV: 350  }
  ]
  var storageUid = ['65AB332A', '35AA462A', '75A1322A']

  var defaults = {
    sampling_rate: 1200,                  // millis
    appliances: appliances,
    num_of_appliances: appliances.length,
    rfidReaders: 4,                       // 0 is storage
    dataset_length: 30,
    storageUid: storageUid,
    threshFactor: 0.5,
    dangerFactor: 0.95
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));

(function(window, $, _, WebSocket, Simulator) {
  'use strict'

  // simulator
  var $readers = []
  var connectedAppliances = []
  var apps = []
  var stored = false
  var totalDemand = 0
  var treshDemand = 0
  // chart
  var stuck = null
  var maxDemand = 0
  var maxDemandOffset = 0
  // updates
  var updateInterval = null
  var updateTime = 0
  var animationOffTime = 75
  // web socket
  var ws = null
  var wssURL = 'ws://192.168.1.133:9000'
  var wsPollingTime = 1000

  function toggleAppliance(app, readerId) {
    // readerId 0 is reserved for storage
    var $reader = $readers[readerId-1]
    if (app.status == 'on') {
      $reader.addClass('on')
      $reader.data().reader.connectedAppliances.push(app)
      connectedAppliances.push(app)
      // populate reader ui element
      $reader.find('span').css('background', 'url("assets/'+app.icon+'")')
      $reader.find('h4').text(app.key)
      $reader.find('label').text(app.maxV+'w')
    } else {
      _.pull($reader.data().reader.connectedAppliances, app)
      _.pull(connectedAppliances, app)
      if (_.isEmpty($reader.data().reader.connectedAppliances)) {
        // clean reader ui element
        $reader.removeClass('on')
        $reader.find('span').css('background', 'none')
        $reader.find('h4').text('')
        $reader.find('label').text('')
      } else {
        // populate reader ui element with last element
        var lastapp = _.last($reader.data().reader.connectedAppliances)
        $reader.find('span').css('background', 'url("assets/'+lastapp.icon+'")')
        $reader.find('h4').text(lastapp.key)
        $reader.find('label').text(lastapp.maxV+'w')
      }
    }
    if (_.isEmpty(connectedAppliances)) {
      $('#appliances .active').hide()
      $('#appliances .inactive').show()
    } else {
      $('#appliances .inactive').hide()
      $('#appliances .active').show()
    }
    // updateStorage()
    if (!updateInterval) {
      slide()
      startStorage()
    }
  }

  function initializaStorage() {
    updateTime = Simulator.sampling_rate
    apps = Simulator.appliances
    // populate ui readers list
    _.times(Simulator.rfidReaders-1, function(i) {
      var $readerElem = $('<li class="reader"><span></span><h4></h4><label></label></li>')
      $readerElem.data('reader', { id: i+1, connectedAppliances: [] })
      $readers.push($readerElem)
      $('#readers').find('ul').append($readerElem)
    })
    _.each(apps, function(app) {
      // maxDemand += app.maxV
      // initialize data
      _.times(Simulator.dataset_length, function(i) {
        var vv = 0
        // Math.random() > 0.5? vv = app.maxV : vv = 0
        var v = { h: i, v: vv }
        app.values.push(v)
      })
    })
    maxDemand = _.sumBy(_(apps).sortBy('maxV')
                              .reverse()
                              .take(Simulator.rfidReaders-1)
                              .value(),'maxV')
    maxDemand += maxDemandOffset
    treshDemand = maxDemand * Simulator.threshFactor
    $('#appliances .active').hide()
    $('#appliances .inactive').show()
  }
  function updateStorage() {
    totalDemand = _.sumBy(connectedAppliances, 'maxV')
    pushNewData()
    stuck.update(apps, stored)
    updateStorageBehaviour()
  }
  function pushNewData() {
    _.each(apps, function(app) {
      // create new data if appliance is on
      var v = app.status === 'on'? { h: app.values.length, v: app.maxV } : { h: app.values.length, v: 0 }
      app.values.push(v)
    })
  }
  function updateStorageBehaviour() {
    // update percent demand
    var percDemand = totalDemand/maxDemand *100
    if (percDemand > 100) percDemand = 100
    $('#demand > span').css({'width': percDemand+'%', 'background-position-x': percDemand+'%'})
    // update storage energy in/out
    if (totalDemand > treshDemand) {
      // storage => energy out
      $('#storage .active #dot #bolt').fadeOut()
      $('#storage .active #dot').css('transform', 'translateY(-40px)')
    } else {
      // storage => energy in
      $('#storage .active #dot #bolt').fadeIn()
      $('#storage .active #dot').css('transform', 'translateY(0)')
    }
    // update energy flow grid - storage - home
    if (!stored && _.isEmpty(connectedAppliances)) {
      $('g[id*="arrow"]').removeClass('animate')
    } else if (!stored && !_.isEmpty(connectedAppliances)) {
      $('g[id*="arrow"]').removeClass('animate')
      $('#arrowGtoH').addClass('animate')
    } else if (stored && _.isEmpty(connectedAppliances)) {
      $('g[id*="arrow"]').removeClass('animate')
      $('#arrowGtoS').addClass('animate')
    } else if (stored && totalDemand > treshDemand) {
      $('g[id*="arrow"]').removeClass('animate')
      $('#arrowGtoH').addClass('animate')
      $('#arrowStoH').addClass('animate')
    } else {
      $('g[id*="arrow"]').removeClass('animate')
      $('#arrowGtoH').addClass('animate')
      $('#arrowGtoS').addClass('animate')
    }
  }
  function toggleStorage(storageState) {
    if (storageState) {
      $('#storage .active').hide()
      $('#storage .inactive').show()
      $('main').css('background-position-y', '0%')
      $('article#storage').removeClass('on')
      stored = false
    } else {
      $('#storage .inactive').hide()
      $('#storage .active').show()
      $('main').css('background-position-y', '100%')
      $('article#storage').addClass('on')
      stored = true
    }
    var storUpdated = true
    updateStorageBehaviour()
    return stuck.update(apps, stored, storUpdated)
  }

  function slide() {
    $('.arealine').transition({ x: '-37px', duration: updateTime-(animationOffTime*2), easing: 'easeInOutSine' })
    $('.topline path').transition({ x: '-37px', duration: updateTime-(animationOffTime*2), easing: 'easeInOutSine' })
    $('.areas path').transition({ x: '-37px', duration: updateTime-(animationOffTime*2), easing: 'easeInOutSine' })
    setTimeout(function() {
      updateStorage()
      $('.arealine').css({ x: '0px' })
      $('.topline path').css({ x: '0px' })
      $('.areas path').css({ x: '0px' })
    }, updateTime-animationOffTime)
  }

  function startStorage() {
    if (updateInterval) stopStorage()
    updateInterval = setInterval(slide, updateTime)
    $('#clock svg line').css('animation-play-state', 'running')
  }
  function stopStorage() {
    clearInterval(updateInterval)
    updateInterval = null
    $('#clock svg line').css('animation-play-state', 'paused')
  }

  function handleEvents() {
    $(window).on('customEv', function(e,key) {
      switch (key) {
        case ' ':
          updateInterval? stopStorage() : startStorage()
        break
        case '0':
        case 's':
          toggleStorage(stored)
        break
        case '1':
        case '2':
          var appIdx = +key-1
          var app = apps[appIdx]
          app.status = app.status == 'off'? 'on' : 'off'
          toggleAppliance(app, 1)
        break
        case '3':
          var appIdx = +key-1
          var app = apps[appIdx]
          app.status = app.status == 'off'? 'on' : 'off'
          toggleAppliance(app, 2)
        break
        case '4':
        case '5':
          var appIdx = +key-1
          var app = apps[appIdx]
          app.status = app.status == 'off'? 'on' : 'off'
          toggleAppliance(app, 3)
        break
        default:
          return
        break
      }
    })

  }
  function handleSockEvents() {
    if (!ws) return
    ws.onopen = function(e) {
      console.info('open ws connection!', e)
    }
    ws.onmessage = function(e) {
      var data = JSON.parse(e.data.split(' from ')[0])
      console.log('message received', e, data)
      // toggle storage
      if (data.id === 0) {
        var storageState = _.lowerCase(data.state) === 'off'
        var stor = _.includes(Simulator.storageUid, data.uid)
        if (!stor) return console.error('Invalid Storage UID:', data)
        return toggleStorage(storageState)
      } else {
        var app = _.find(apps, function(app) { return _.includes(app.uid, data.uid) })
        if (!app) return console.error('Invalid UID:', data)
        app.status = _.lowerCase(data.state)
        var readersId = data.id
        return toggleAppliance(app, readersId)
      }
    }
    ws.onclose = function(e) {
      console.info('closed ws connection!', e)
      ws = null
      setTimeout(function() {
        ws = new WebSocket(wssURL)
        handleSockEvents()
      }, wsPollingTime)
    }
    ws.onerror = function(e) {
      console.error('error on ws connection!', e)
    }
  }

  var bmod = false
  var bot = null
  var bottime = 1250
  function toggleBotMode() {
    if (bot) {
      clearInterval(bot)
      bot = null
      bmod = false
    } else bmod = !bmod
    if (bmod) {
      startStorage()
      bot = setInterval(function() {
        var choice = Math.floor(Math.random()*10)
        switch (choice) {
          case 0:
          case 7:
          case 9:
            $(window).trigger('customEv', 's')
          break
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            $(window).trigger('customEv', choice.toString())
          break
          default:
            return
          break
        }
      }, bottime)
    } else {
      stopStorage()
      clearInterval(bot)
      bot = null
    }
  }

  (function init() {
    initializaStorage()
    // initialie area chart
    stuck = new StackedAreaChart('#monitor-chart', apps, Simulator.dataset_length, maxDemand, Simulator.threshFactor, Simulator.dangerFactor)
    if (wssURL) ws = new WebSocket(wssURL)
    handleSockEvents()
    handleEvents()
    toggleStorage(!stored)
    updateStorage()
  })()

  // bot event handlers
  $(window).keydown(function(e) {
    if (e.altKey && e.keyCode === 66) return toggleBotMode()
    $(window).trigger('customEv', e.key)
  })

}(window, window.jQuery, window._, window.WebSocket, window.Simulator));

//# sourceMappingURL=main.js.map