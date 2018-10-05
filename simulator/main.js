(function(window, $, _, d3) {
  'use strict'

  // -------- SVG ELEMENTS ---------
  var svgContainer, mask, maskArea,
      svg, box, w, wright, h, p, pright,         // svg config
      axY, axX, threshold,                       // axis and scales config
      defs, grad, gradStor,                      // gradients
      areas, areaTot, areaTotStor, areaTotInter, // chart paths
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

  // var axisX   = d3.svg.axis()
  //                 .scale(X)
  //                 .orient('top')
  //                 .tickFormat('')

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
  var areaIntersect = d3.svg.area()
                        .x(function(d,i) { return p + X(i) })
                        .y0(function(d)  {
                          var yy = Y(d.v)
                          var ys = YStor(d.v)
                          var val = yy > ys? yy : ys
                          return p + yy
                        })
                        .y1(function(d)  {
                          return p + YStor(d.v)
                        })
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

  var viewW = 600
  var viewH = 420

  var tpl = '<svg id="teamAreaChart" preserveAspectRatio="xMinYMin" >' +
            '  <defs id="pattern_wrap">' +
            '    <pattern id="bolt_pattern" patternUnits="userSpaceOnUse" width="37" height="37">' +
            '      <image xlink:href="assets/pattern_bolt.svg" x="0" y="0" width="37" height="37"></image>' +
            '    </pattern>' +
            '  </defs>' +
            '</svg>'

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

    var tabMq = "(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)"
    var mqP = window.matchMedia(tabMq).matches ? 6 : 5
    var mqPright = window.matchMedia(tabMq).matches ? 10 : 10

    // -------- INITIALIZE CHART ---------
    svg = $(svgContainer).append(tpl).find('svg#teamAreaChart')
    w = svg.width() // +box[2] // width
    h = svg.height() // +box[3] // height
    svg.attr('viewBox','0 0 '+w+' '+h)
    h += 20
    p = w*mqP/100        // padding
    pright = w*mqPright/100   // padding right
    wright = w-pright
    svg = d3.select(svg.get(0))
    // create areas gradient fill
    defs = svg.append('defs')
    var maskGrad = defs.append('linearGradient').attr('id', 'teamAreaChart_mask_grad').attr('gradientUnits', 'userSpaceOnUse')
                       .attr('x1', 0).attr('y1', 0).attr('x2', wright).attr('y2', 0)
    maskGrad.append('stop').attr('offset', 0).attr('stop-color', '#000000')
    maskGrad.append('stop').attr('offset', p/wright).attr('stop-color', '#000000')
    maskGrad.append('stop').attr('offset', p/wright).attr('stop-color', '#ffffff')
    maskGrad.append('stop').attr('offset', 1-(p*0.6)/wright).attr('stop-color', '#ffffff')
    maskGrad.append('stop').attr('offset', 1-p/wright).attr('stop-color', '#000000')
    maskGrad.append('stop').attr('offset', 1).attr('stop-color', '#000000')
    mask = defs.append('mask').attr('id', 'mask-border')
    maskArea = defs.append('mask').attr('id', 'mask-area')
    maskArea.append('path').attr('class', 'area area-mask')
    mask.append('rect').attr('x',0).attr('y',0).attr('width',wright).attr('height',h).attr('fill', 'url(#teamAreaChart_mask_grad)')
    // gradient for fixed area
    grad = defs.append('linearGradient').attr('id', 'areaGrd').attr('gradientUnits', 'userSpaceOnUse')
               .attr('x1', 0).attr('y1', p).attr('x2', 0).attr('y2', h-p)
    grad.append('stop').attr('offset', 0).attr('stop-color', '#FF006E')
    grad.append('stop').attr('offset', 1-(threshFactor+threshFactor/1.5)).attr('stop-color', '#FF006E')
    grad.append('stop').attr('offset', 1-threshFactor).attr('stop-color', '#5738FF')
    grad.append('stop').attr('offset', 1).attr('stop-color', '#ffffff')
    // gradient for storage area
    gradStor = defs.append('linearGradient').attr('id', 'storAreaGrd').attr('gradientUnits', 'userSpaceOnUse')
               .attr('x1', 0).attr('y1', p).attr('x2', 0).attr('y2', h-p)
    gradStor.append('stop').attr('offset', 0).attr('stop-color', '#FF006E')
    gradStor.append('stop').attr('offset', 1-(threshFactor+threshFactor/1.5)).attr('stop-color', '#FF006E')
    gradStor.append('stop').attr('class', 'storstop').attr('offset', 1-threshFactor).attr('stop-color', '#5738FF')
    // gradStor.append('stop').attr('offset', 1).attr('stop-color', 'rgba(255,255,255,.1)')
    // create areas group
    areas = svg.append('g').attr('class', 'areas').attr('mask', 'url(#mask-border)')
    areaTotInter = areas.append('g').attr('class', 'areaIntersection').attr('mask', 'url(#mask-area)')
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
      labels.append('g').attr('class', 'label label-area label-'+_.kebabCase(d.key))
    })
    areaTotInter.append('path').attr('class', 'area area-intersection')
    lnsTop  = lns.append('g').attr('class', 'topline').append('path')
    lnsStor = lns.append('g').attr('class', 'topline storage').append('path')
    circles.append('circle').attr('class', 'topcircle')
    var demandLabel = labels.append('g').attr('class', 'label toplabel')
    demandLabel.append('text').text('Energy').attr('y', -17)
    demandLabel.append('text').text('demand').attr('y', -4)
    circles.append('circle').attr('class', 'storcircle')
    var gridLabel = labels.append('g').attr('class', 'label storlabel')
    gridLabel.append('text').text('From').attr('y', -19)
    gridLabel.append('text').text('the grid').attr('y', -6)

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
    areaTotInter.selectAll('path')
               .data(emptydata)
               .attr('d', function(d){ return areaIntersect(d.values) })
               .attr('fill', function()  { return 'url(#bolt_pattern)' })
    maskArea.selectAll('path')
               .data(emptydata)
               .attr('d', function(d){ return areaIntersect(d.values) })
               .attr('fill', '#ffffff')
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
       .attr('x', 1.5*p)
       .attr('y', Y(thresh)+(p/2))
    // lns.append('text').html('Extra demand')
    //    .attr('x', p+(p/2))
    //    .attr('y', h -p-(p/2) -Y(thresh/2))
    lns.append('text').text('Demand peaks')
       .attr('class', 'danger')
       .attr('x', 1.5*p)
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
           .attr('y', 12)
           .text(_.last(emptyTotData).v + ' w')
    labels.select('.storlabel')
           .append('text')
           .attr('class', 'tot_value')
           .attr('y', 10)
           .text(_.last(emptyTotData).v + ' w')
    labels.selectAll('.label-area').data(data)
          .append('text').text(function(d) { return d.key })
          .attr('y', 10)

    // initialize axis data
    // axY.call(axisY)
    // axX.call(axisX.tickSize(h))
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
    areaTot.transition().attr('opacity', function() { return stored? .5 : 1 })
    areaTot.selectAll('path').data(data)
           .transition().duration(function() { return stored && storUpdated? duration : 0 })
           .delay(delay).ease(ease)
           .attr('d', function(d) { return area(d.values) })
           .attr('opacity', function() { return stored? .2 : .4 })
    areaTotStor.transition().attr('opacity', .5)
    areaTotStor.selectAll('path').data(data)
               .transition().duration(function() { return stored && storUpdated? duration : 0 })
               .delay(delay).ease(ease)
               .attr('d', function(d) { return areaStor(d.values) })
    areaTotInter.selectAll('path')
                .transition().duration(function() { return stored && storUpdated? duration : 0 })
                .delay(delay).ease(ease)
                .attr('d', function(d){ return areaIntersect(totData) })
    maskArea.selectAll('path').data(data)
            .transition().duration(function() { return stored && storUpdated? duration : 0 })
            .delay(delay).ease(ease)
            .attr('d', function(d){ return areaStor(d.values) })
    gradStor.selectAll('.storstop')
        .transition().duration(duration).delay(delay).ease(ease)
        .attr('stop-color', function() { return stored? '#2AFD95': '#5738FF' })
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
           .attr('transform', function(d) {
            var posy = Y(_.last(totData).v)
            var posstor = YStor(_.last(totData).v)
            if (!stored) return 'translate(' + (wright-5) +','+ (p+posy) +')'
            if (posy != 0 && posstor != 0 && posy <= posstor + 10) posy = posstor-20
            return 'translate(' + (wright-5) +','+ (p+posy) +')'
           })
           .select('.tot_value')
           .text(_.last(totData).v + ' w')
    circles.select('.storcircle')
           .transition().duration(function() { return stored? duration : duration/2}).ease(ease)
           .attr('r',  function() { return stored? '5' : '0' })
           .attr('cx', function() { return X(dataLength-1)-p*0.6 })
           .attr('cy', function() { return p + YStor(_.last(totData).v) })
    labels.select('.storlabel')
           .transition().duration(function() { return stored? duration : duration/2}).ease(ease)
           .attr('transform', function(d) {
            var posy = Y(_.last(totData).v)
            var posstor = YStor(_.last(totData).v)
            if (posy != 0 && posstor != 0 && posy <= posstor + 10) posstor = posstor+30
             return 'translate(' + (wright-5) +','+ (p+posstor) +')'
            })
           .attr('opacity', function() { return stored? 1 : 0 })
           .select('.tot_value')
           .text(Math.round(YStorInv(YStor(_.last(totData).v))) + ' w')
    labels.selectAll('.label-area').data(data)
          .transition().duration(function() { return stored? duration : duration/2}).ease(ease)
          .delay(245)
          .attr('opacity', function(d) { return _.last(d.values).v > 0? 1 : 0 })
          .style('text-anchor', 'end')
          .attr('transform', function(d) {
            var ld = _.last(d.values)
            return 'translate(' + (wright-p*0.8) +','+ (p+Y((ld.y+ld.y0))+4) +')' })

    // update axis data
    // axY.transition().delay(delay).call(axisY)
    // axX.transition().delay(delay).call(axisX)
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

window.dragQueer = {
  init: init
}
function init() {
  interact.maxInteractions(1)

  document.querySelectorAll('.placeholder').forEach(function(e, i) {
    e.dataset.empty = false
    e.dataset.element = 'app'+(i+1)
  })
  document.querySelectorAll('.dropzone').forEach(function(e,i) {
    e.dataset.empty = true
    e.dataset.element = ''
    e.dataset.readerId = (i+1)
  })
  document.querySelectorAll('.draggable').forEach(function(e, i) {
    e.dataset.appId = i
  })

  var previousTarget = null,
      selectedTarget = null

  function firstEmptyPlaceholder() {
    var el = null
    document.querySelectorAll('.placeholder').forEach(function(e) {
      if (el) return
      if (e.dataset.empty == 'true') el = e
    })
    return el || previousTarget
  }

  function freePlaceholder(target) {
    var previousElement = document.querySelector('#'+target.dataset.element),
        emptyPlaceholder = firstEmptyPlaceholder()
    var emptyPlaceholderPosition = emptyPlaceholder.getBoundingClientRect(),
        targetPosition = target.getBoundingClientRect()
    previousElement.style.transform = 'translate(0,0)'
    var oldX = previousElement.getBoundingClientRect().x,
        oldY = previousElement.getBoundingClientRect().y
    previousElement.style.transform = 'translate('+(targetPosition.x - oldX)+'px,'
                                      +(targetPosition.y - oldY)+'px)'
    var newX = emptyPlaceholderPosition.x - oldX,
        newY = emptyPlaceholderPosition.y - oldY
    setTimeout(function(){
      previousElement.classList.add('moving')
      previousElement.style.transform = 'translate('+newX+'px,'+newY+'px)'
      setTimeout(function(){
        previousElement.classList.remove('moving')
      }, 300)
    }, 0)
    emptyPlaceholder.dataset.empty = false
    target.dataset.empty = true
    emptyPlaceholder.dataset.element = previousElement.getAttribute('id')
    target.dataset.element = ''
    previousElement.setAttribute('data-x', newX)
    previousElement.setAttribute('data-y', newY)
    // fire app event
    APP.deselect(previousElement.dataset.appId, target.dataset.readerId)
  }

  // target elements with the "draggable" class
  interact('.draggable').draggable({
    // enable inertial throwing
    inertia: true,
    max: 1,
    // keep the element within the area of it's parent
    restrict: {
      restriction: function(x, y, event) {
        var parent = document.querySelector('#apppliances')
        if (event.element.classList.contains('can-drop')
          && (selectedTarget.dataset.empty === 'true'
            || selectedTarget.dataset.element === event.element.getAttribute('id'))) {
          // fire app event
          if (previousTarget) APP.deselect(event.element.dataset.appId, previousTarget.dataset.readerId)
          parent = selectedTarget
          // fire app event
          APP.select(event.element.dataset.appId, selectedTarget.dataset.readerId)
        } else if (event.element.classList.contains('can-drop') && selectedTarget.dataset.empty === 'false') {
          // fire app event
          APP.deselect(event.element.dataset.appId, previousTarget.dataset.readerId)
          freePlaceholder(selectedTarget)
          parent = selectedTarget
          // fire app event
          APP.select(event.element.dataset.appId, selectedTarget.dataset.readerId)
        } else {
          // fire app event
          APP.deselect(event.element.dataset.appId, previousTarget.dataset.readerId)
          parent = firstEmptyPlaceholder()
        }
        return parent
      },
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // enable autoScroll
    autoScroll: false
  })
  .on('dragstart', function (event) {
    event.interaction.x = parseInt(event.target.getAttribute('data-x'), 10) || 0
    event.interaction.y = parseInt(event.target.getAttribute('data-y'), 10) || 0
  })
  // call this function on every dragmove event
  .on('dragmove', function (event) {
    var target = event.target
    // keep the dragged position in the data-x/data-y attributes
    event.interaction.x += event.dx
    event.interaction.y += event.dy

    target.classList.add('over')

    // translate the element
    target.style['transform'] =
      'translate(' + event.interaction.x + 'px, ' + event.interaction.y + 'px)'
  })
  // call this function on every dragend event
  .on('dragend', function (event) {
    // update the position attributes
    event.target.setAttribute('data-x', event.interaction.x)
    event.target.setAttribute('data-y', event.interaction.y)
    event.target.classList.remove('over')
  })

  // enable draggables to be dropped into this
  interact('.dropzone, .placeholder').dropzone({
    // only accept elements matching this CSS selector
    accept: '.drag-drop',
    // Require a 75% element overlap for a drop to be possible
    overlap: 0.5,

    // listen for drop related events:
    ondropactivate: function (event) {
      // add active dropzone feedback
      event.target.classList.add('drop-active')
    },
    ondragenter: function (event) {
      var draggableElement = event.relatedTarget,
          dropzoneElement = event.target

      selectedTarget = dropzoneElement
      // feedback the possibility of a drop
      dropzoneElement.classList.add('drop-target')
      draggableElement.classList.add('can-drop')
    },
    ondragleave: function (event) {
      // remove the drop feedback style
      event.target.classList.remove('drop-target')
      event.relatedTarget.classList.remove('can-drop')
      if (!previousTarget) {
        previousTarget = event.target
        previousTarget.dataset.empty = true
        previousTarget.dataset.element = ''
      }
    },
    ondrop: function (event) {
      previousTarget = null
      selectedTarget.dataset.empty = false
      selectedTarget.dataset.element = event.relatedTarget.getAttribute('id')
      event.relatedTarget.classList.remove('can-drop')
    },
    ondropdeactivate: function (event) {
      // remove active dropzone feedback
      event.target.classList.remove('drop-active')
      event.target.classList.remove('drop-target')
    }
  })
}

(function(window, _) {
  'use strict'

  window.Simulator = window.Simulator || {}

  var appliances = [
    { key: 'EV Charging', icon: 'icon_EV_charging', uid: ['A5312E2A', 'C59E482A', 'A5DA422A'], status: 'off', values: [], maxV: 7500 },
    { key: 'Cooling',     icon: 'icon_cooling',     uid: ['B5C43A2A', '95E8432A', '1EF3E8C1'], status: 'off', values: [], maxV: 4000 },
    { key: 'Brewing',     icon: 'icon_brewing',     uid: ['C5DA2C2A', '857F3A2A', '3E99E9C1'], status: 'off', values: [], maxV: 2000 },
    { key: 'Drying',      icon: 'icon_drying',      uid: ['75423F2A', '25FB392A', '4E8FE9C1'], status: 'off', values: [], maxV: 1500 },
    { key: 'Heating',     icon: 'icon_heating',     uid: ['3549482A', '8517412A', '8EA8E9C1'], status: 'off', values: [], maxV: 1200 },
    { key: 'Working',     icon: 'icon_working',     uid: ['A5312E2A', 'C59E482A', 'A5DA422A'], status: 'off', values: [], maxV: 300  }
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
    dangerFactor: 0.85
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
  var criticalDemand = 0
  var criticalOffset = 4500
  // chart
  var stuck = null
  var maxDemand = 0
  var maxDemandOffset = 0
  // updates
  var updateInterval = null
  var updateTime = 0
  var animationOffTime = 75
  var tOutSteps = 4
  var tOutPause = null
  var slideDuration = 0
  var slideStopped = true
  var stopInterval = null
  // orientation detect
  var aspect = 'landscape'
  var browser = null

  function calcOrient() {
    aspect = ($(window).width() > $(window).height())? 'landscape' : 'portrait'
    $('body').removeClass()
    $('body').addClass('orientation-'+aspect)
    window.aspect = aspect
    browser = bowser.getParser(window.navigator.userAgent)
    if (browser.isPlatform('mobile') && aspect == 'portrait') {
      $('main').hide()
      $('#mobile-cover').show()
      $('#mobile-cover aside').hide()
      $('#mobile-cover article').show()
    } else if ((browser.isPlatform('mobile') && aspect == 'landscape')
        || (browser.isPlatform('tablet') && aspect == 'portrait')) {
      $('main').hide()
      $('#mobile-cover').show()
      $('#mobile-cover article').hide()
      $('#mobile-cover aside').show()
    } else {
      $('#mobile-cover').hide()
      $('main').show()
      //location.reload();
    }
  }

  function selectApp(appIdx, readerIdx) {
    if (!appIdx || !readerIdx) return
    var app = apps[appIdx]
    if (app.status === 'on') return
    app.status = 'on'
    $('.appliance#app'+(+appIdx+1)).addClass('on')
    //console.log('on')
    toggleAppliance(app, readerIdx)
  }
  function deselectApp(appIdx, readerIdx) {
    if (!appIdx || !readerIdx) return
    var app = apps[appIdx]
    if (app.status === 'off') return
    app.status = 'off'
    $('.appliance#app'+(+appIdx+1)).removeClass('on')
    //console.log('off')
    toggleAppliance(app, readerIdx)
  }
  function toggleAppliance(app, readerId) {
    // readerId 0 is reserved for storage
    var $reader = $readers[readerId-1]
    if (app.status == 'on') {
      $reader.addClass('on')
      $reader.data().reader.connectedAppliances.push(app)
      connectedAppliances.push(app)
      // populate reader ui element
      $reader.find('h4').text(app.key)
      $reader.find('label').text(app.maxV+'w')
    } else {
      _.pull($reader.data().reader.connectedAppliances, app)
      _.pull(connectedAppliances, app)
      if (_.isEmpty($reader.data().reader.connectedAppliances)) {
        // clean reader ui element
        $reader.removeClass('on')
        $reader.find('h4').text('Plug in an appliance')
        $reader.find('label').text('')
      } else {
        // populate reader ui element with last element
        var lastapp = _.last($reader.data().reader.connectedAppliances)
        $reader.find('h4').text(lastapp.key)
        $reader.find('label').text(lastapp.maxV+'w')
      }
    }
    connectedAppliances = _.uniq(connectedAppliances)
    // invalid timeout
    if (tOutPause) {
      clearTimeout(tOutPause)
      tOutPause = null
    }
    tOutPause = setTimeout(stopStorage, tOutSteps*updateTime)
    // updateStorage()
    //console.log(updateInterval, slideStopped)
    if (!updateInterval) {
      startStorage()
      slide()
    }
  }

  function initializeStorage() {
    updateTime = Simulator.sampling_rate
    slideDuration = updateTime-(animationOffTime*2)
    slideDuration = 500
    apps = Simulator.appliances
    // populate ui readers list
    var socketTemp = $('#power #power-strip #socket_temp').removeAttr('id')
    socketTemp.remove()
    _.times(Simulator.rfidReaders-1, function(i) {
      var $readerElem = socketTemp.clone()
      $readerElem.data('reader', { id: i+1, connectedAppliances: [] })
      $readers.push($readerElem)
      $('#power #power-strip').append($readerElem)
    })
    var placeholderTemp = $('#bucket #placeholders #placeholder_temp').removeAttr('id'),
        applianceTemp = $('#bucket #appliances #app_temp').removeAttr('id')
    placeholderTemp.remove()
    applianceTemp.remove()
    _.each(apps, function(app,i) {
      var $appElem = applianceTemp.clone()
      $appElem.attr('id', 'app'+(i+1))
      $('#bucket #placeholders').append(placeholderTemp.clone())
      $('#bucket #appliances').append($appElem)
      $appElem.find('#'+app.icon).show()
      // initialize data
      _.times(Simulator.dataset_length, function(i) {
        var vv = 0
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
    criticalDemand = maxDemand * Simulator.dangerFactor
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
    $('#demand > span').css({'height': percDemand+'%', 'background-position-y': 100 - percDemand+'%'})
    // update energy flow grid - storage - home
    $('[id*="arrow"]').removeClass('animate reverse fast')
    var grid = (aspect === 'portrait')? $('#grid-wrap') : $('#grid-landscape')
    grid.find('svg g#grid polyline').removeClass('shake-constant')
    grid.find('svg g#copy_storage g').removeClass('visible')
    grid.find('svg g#storage g').removeClass('visible')
    if (!stored && !_.isEmpty(connectedAppliances) && totalDemand >= criticalDemand-criticalOffset) {
      grid.find('#arrow_GtoB').addClass('animate fast')
      grid.find('svg g#grid polyline').addClass('shake-constant')
      grid.find('svg g#grid polyline').addClass('shake-opacity')
      grid.find('svg g#storage g#storageOFF').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageOFF').addClass('visible')
      grid.find('svg g#copy_storage g#warning_storageOFF').addClass('visible')
    } else if (!stored && !_.isEmpty(connectedAppliances)) {
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('svg g#storage g#storageOFF').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageOFF').addClass('visible')
    } else if (stored && _.isEmpty(connectedAppliances)) {
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('#arrow_StoB').addClass('animate reverse')
      grid.find('svg g#storage g#storageIN').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageIN').addClass('visible')
    } else if (stored && totalDemand > treshDemand) {
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('#arrow_StoB').addClass('animate')
      grid.find('svg g#storage g#storageOUT').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageOUT').addClass('visible')
    } else if (stored && !_.isEmpty(connectedAppliances)){
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('#arrow_StoB').addClass('animate reverse')
      grid.find('svg g#storage g#storageIN').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageIN').addClass('visible')
    } else {
      grid.find('svg g#storage g#storageOFF').addClass('visible')
    }
  }
  function toggleStorage(storageState) {
    if (storageState) {
      $('main').css('background-position-y', '0%')
      $('#storage-wrap, #storage-landscape').removeClass('on')
      stored = false
    } else {
      $('main').css('background-position-y', '100%')
      $('#storage-wrap, #storage-landscape').addClass('on')
      stored = true
    }
    var storUpdated = true
    updateStorageBehaviour()
    return stuck.update(apps, stored, storUpdated)
  }

  var tl = null
  function slide() {
    slideStopped = false
    $('.arealine').transition({ x: '-6%', duration: slideDuration, easing: 'easeInOutSine' })
    $('.topline path').transition({ x: '-6%', duration: slideDuration, easing: 'easeInOutSine' })
    $('.areas path').transition({ x: '-6%', duration: slideDuration, easing: 'easeInOutSine' })
    tl = setTimeout(queueAnimation, updateTime-animationOffTime)
  }
  function queueAnimation(){
    updateStorage()
    //console.log('add data')
    $('.arealine').css({ x: '0' })
    $('.topline path').css({ x: '0' })
    $('.areas path').css({ x: '0' })
  }

  function startStorage() {
    //console.log('start')
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
    updateInterval = setInterval(slide, updateTime)
    if (tOutPause) {
      clearTimeout(tOutPause)
      tOutPause = null
    }
    tOutPause = setTimeout(stopStorage, tOutSteps*updateTime)
    $('#clock svg line').css('animation-play-state', 'running')
  }
  function stopStorage() {
    clearInterval(updateInterval)
    slideStopped = true
    updateInterval = null
    //console.log('stop')
    if (tOutPause) {
      clearTimeout(tOutPause)
      tOutPause = null
    }
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
        case '6':
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
      }
    })
  }
  function handleUIEvents() {
    $('#toggle svg #switch_OFF').on('click', function() {
      toggleStorage(true)
    })
    $('#toggle svg #switch_ON').on('click', function() {
      toggleStorage(false)
    })
  }

  function init() {
    FastClick.attach(document.body)
    calcOrient()
    initializeStorage()
    // initialie area chart
    stuck = new StackedAreaChart('#monitor-chart', apps, Simulator.dataset_length, maxDemand, Simulator.threshFactor, Simulator.dangerFactor)
    handleEvents()
    handleUIEvents()
    toggleStorage(!stored)
    updateStorage()
    dragQueer.init()
  }
  $(document).ready(init)

  // bot event handlers
  $(window).keydown(function(e) {
    $(window).trigger('customEv', e.key)
  })
  // resize event handler
  var resizeDebounce = null
  $(window).on( "orientationchange", function() {
    $('body').removeClass()
  })
  $(window).resize(function() {
    if (resizeDebounce) {
      clearTimeout(resizeDebounce)
      resizeDebounce = null
    }
    resizeDebounce = setTimeout(function(){
      browser.isPlatform('mobile') ? calcOrient() : location.reload();
    }, 150)
  })
  // prevent tablet/mobile device bounce effect
  document.ontouchmove = function(event){
    event.preventDefault();
  }

  window.APP = {
    select: selectApp,
    deselect: deselectApp
  }

}(window, window.jQuery, window._, window.WebSocket, window.Simulator));

//# sourceMappingURL=main.js.map