(function (angular) {
  'use strict'

  /**
    SnippetCard
  **/

  angular
    .module('SnippetCard', [
      'ngSanitize',
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('SnippetCard')
    .component('snippetCard', {
      replace: true,
      templateUrl: '../js/components/snippetCard/template.html',
      controller: SnippetCardCtrl,
      controllerAs: 'snippetCard',
      bindings: {
        snip: '<ngModel',
        onPrevContent: '&',
        onLastContent: '&'
      }
    })

  /* @ngInject */
  function SnippetCardCtrl($scope, $element, $attrs, TweenMax, $sce) {
    var ctrl = this
    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    // ctrl.$onInit = init
    ctrl.$onChanges = init

    $scope.prevTab  = prevTab
    $scope.nextTab  = nextTab
    $scope.setActive = setActive
    $scope.navigateTo = navigateTo
    var hammertime  = null
    var content     = null
    var $content    = null
    var contentIdx  = 0
    var swipeOffset = 30
    var swipeVel    = .5
    var prevCallback = null
    var nextCallback = null

    // -------

    $scope.parseTpl = function(tpl) {
      return $sce.trustAsHtml(tpl);
    }

    function setActive(idx) {
      return idx === contentIdx
    }

    // function prevTab() {
    //   if (contentIdx <= 0) return prevCallback()
    //   contentIdx--
    //   $scope.subsnip = content[contentIdx]
    //   TweenMax.to($content.find('ul'), swipeVel, { x: '+='+ swipeOffset +'%', onComplete: function() {
    //     if (!$scope.$$phase) $scope.$digest()
    //   } })
    //   TweenMax.to($content.find('.sub-snip-content'), swipeVel, { x: '+='+ swipeOffset +'%', opacity: 0.1, onComplete: function() {
    //     if (!$scope.$$phase) $scope.$digest()
    //   } })
    // }
    // function nextTab() {
    //   if (contentIdx >= content.length -1) return nextCallback()
    //   contentIdx++
    //   $scope.subsnip = content[contentIdx]
    //   TweenMax.to($content.find('ul'), swipeVel, { x: '-='+ swipeOffset +'%', onComplete: function() {
    //     if (!$scope.$$phase) $scope.$digest()
    //   } })
    //   TweenMax.to($content.find('.sub-snip-content'), swipeVel, { x: '-='+ swipeOffset +'%', opacity: 0.1, onComplete: function() {
    //     if (!$scope.$$phase) $scope.$digest()
    //   } })
    // }

    function prevTab(digest){
        if (contentIdx <= 0) return prevCallback()
        contentIdx--
        $scope.subsnip = content[contentIdx]
        setTimeout(scrollToCurrent, 100)
        if (!digest) return
        if (!$scope.$$phase) $scope.$digest()
    }

    function nextTab(digest){
        if (contentIdx >= content.length -1) return nextCallback()
        contentIdx++
        $scope.subsnip = content[contentIdx]
        setTimeout(scrollToCurrent, 100)
        if (!digest) return
        if (!$scope.$$phase) $scope.$digest()
    }

    function scrollToCurrent(){
      var current = $element.find('.note.active')
      var container = $element.find('ul.sub-snip-nav')
      var offset = getScrollOffset(current, container)
      var navs = container.find('.note');
      console.log(offset)
      TweenMax.to(navs, .5, {x: offset})
    }

    function getScrollOffset(current, container){
      var idx = current.index();
      console.log(current, idx, current.position(), current.outerWidth(), container.outerWidth())
      if(idx > (container.children().length-1) / 2){
        var offset = container.outerWidth() - current.position().left - current.outerWidth();
      } else {
        var offset = 0;
      }
      return offset;
    }

    // init after dom loaded
    function init() {
      prevCallback = ctrl.onPrevContent()
      nextCallback = ctrl.onLastContent()
      $scope.snip = ctrl.snip
      content = ctrl.snip.subContent || null
      if (!content) return
      if (contentIdx < 0) contentIdx = 0
      else if (contentIdx >= content.length) contentIdx = content.length -1
      $scope.subsnip = content? content[contentIdx] : null
      $element.ready(createContentHandler)
    }

    // event handlers
    function createContentHandler() {
      $content = $element.find('.content')
      if (contentIdx !== 0) TweenMax.set($content.find('li'), { x: '-='+ (swipeOffset * contentIdx) +'%' })
      hammertime = new Hammer($content[0], { domEvents: true, css_hacks:false, touchAction: 'compute' })
      hammertime.on('swipeleft',  function(){
        nextTab(true)
      })
      hammertime.on('swiperight', function() {
        prevTab(true)
      })
      hammertime.on('hammer.input', function (e) {
        e.srcEvent.stopPropagation()
      })
      $element.on('touchmove', function(e) {
        e.stopPropagation()
        e.preventDefault()
      })
      $element.click(function(e) {
        e.stopPropagation()
        e.preventDefault()
      })
    }

    function navigateTo(index){
      if(contentIdx > index) prevTab(false)
      else nextTab(false);
    }

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function() {
      if (!hammertime) return
      hammertime.off('swipeleft')
      hammertime.off('swiperight')
      hammertime.off('hammer.input')
    })
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    SnippetCarousel
  **/

  angular
    .module('SnippetCarousel', [
      'MainApp',
      'SnippetCard'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('SnippetCarousel')
    .component('snippetCarousel', {
      replace: true,
      templateUrl: '../js/components/snippetCarousel/template.html',
      controller: SnippetCarouselCtrl,
      controllerAs: 'snippetCarousel',
      bindings: {
        snippets: '<',
        onCardSelect: '&',
        onExit: '&',
        loop: '=?'
      }
    })

  /* @ngInject */
  function SnippetCarouselCtrl($scope, $element, $attrs, $timeout, _) {
    var ctrl = this
    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    // ctrl.$onInit = init
    $scope.snipCounter = 0;
    ctrl.$onChanges = init
    var vel = .45
    var direction = 'right'
    var debounce = {
      id: null,
      time: vel * 1000, // millis to sec
      start: function() {
        debounce.id = $timeout(debounce.cancel, debounce.time)
      },
      cancel: function() {
        $timeout.cancel(debounce.id)
        debounce.id = null
      }
    }
    var hammertime = null
    var card = null
    var $card = null
    var $cards = []
    var callback = null
    var exitCallback = null;

    $scope.prev = function () {
      if (debounce.id) return
      $scope.snipCounter++
      if($scope.snipCounter > $scope.snippets.length-1 && !ctrl.loop) {
        $scope.exit();
        return;
      }
      debounce.start()
      direction = 'left'
      moveCards(direction)
    }

    $scope.next = function () {
      if (debounce.id) return
      $scope.snipCounter--
      if($scope.snipCounter < 0) $scope.snipCounter = $scope.snippets.length-1;
      debounce.start()
      direction = 'right'
      moveCards(direction)
    }

    $scope.exit = function (callback) {
      _.each($cards, function(s, i) {
        animateCardOut(s, i, true)
      })
      if(exitCallback && !callback) exitCallback();
    }

    ctrl.exit = $scope.exit;

    $scope.loadCard = function() {
      var el = $element.children('snippet-card')[this.$index]
      setCardPos(el, this.$index)
      $cards.push(el)
      // last card is loaded
      if ($cards.length === $scope.snippets.length) selectCards()
    }

    var showcaseElements = 3
    var xSet = 0
    var ySet = 0
    var xOffset = 0
    var yOffset = 15
    var zOffset = 250
    var opacitySet = 1
    var opacityOffset = .15

    function setCardPos($el, $i) {
      var base = $scope.snippets.length -1 -$i
      var opacity = opacitySet -(base * opacityOffset)
      if ($i < $scope.snippets.length - showcaseElements) opacity = 0
      var ypos = -(ySet+(base * yOffset))
      TweenMax.set($el, { x: -(xSet+(base * xOffset)) +'%',
                          y: ypos+20 +'%',
                          // z: -(base * zOffset),
                          scale: 1 - (base * .2),
                          opacity: 0,
                          zIndex: -base
                        }, vel/3)
      TweenMax.to($el, .6, {y: ypos+'%', opacity: opacity, delay: .1 * ($scope.snippets.length - $i), ease: 'easeOut'})
    }

    function animateCardOut($el, $i, pull) {
      TweenMax.to($el, .6, {y: '+=20%', opacity: 0, delay: .1 * ($scope.snippets.length - $i), ease: 'easeOut', onComplete: function(){
        if (pull) {
          _.pull($cards, $el)
          $scope.snippets.splice($i, 1)
          if (!$scope.$$phase) $scope.$digest()
          if (_.isEmpty($scope.snippets)) $element.fadeOut()
        }
      }})
    }


    ctrl.setTour = function(t){
      ctrl.isTour = t;
    }
    // -------

    // init after dom loaded
    function init() {
      $scope.snipCounter = 0;
      hammertime = null
      card = null
      $card = null
      $cards = []
      $scope.snippets = ctrl.snippets
      callback = ctrl.onCardSelect()
      exitCallback = ctrl.onExit
      if (_.isEmpty($scope.snippets)) return
      $element.fadeIn()
      if ($scope.snippets.length < showcaseElements) showcaseElements = $scope.snippets.length
      else showcaseElements = 3
    }

    function selectCards() {
      card  = _.last($scope.snippets)
      $cards = _.reverse($cards)
      $card = _.first($cards)
      if (callback) callback(card)
      cardHandler()
      debounce.cancel()
    }

    function removeLastCard() {
      cleanHandler()
      var tp = _.last($scope.snippets)
      $scope.snippets = _.initial($scope.snippets)
      $scope.snippets.unshift(tp)
      if (!$scope.$$phase) $scope.$digest()
      $cards = $element.children('snippet-card')
      selectCards()
    }

    function moveCards(direction) {
      var tl = new TimelineMax()
      var xOut = direction === 'right'? '50%' : '-100%'
      tl.to($card, vel, {x: xOut, opacity: 0, zIndex: -5, onComplete: removeLastCard}, 0)


      var x = 0, y = 0, z = 0, opacity = 1, zIndex = 0
      var scale = 1
      for (var i = 1; i < $cards.length; i++) {
        if (i > showcaseElements) opacity = 0
        TweenMax.to($cards[i], vel, {
          y: y+'%',
          // z: z,
          scale: scale,
          opacity: opacity,
          zIndex: zIndex}, vel)
        y-=yOffset
        z-=zOffset
        opacity-=opacityOffset
        zIndex--
        scale-= 0.2
      }
      // in case of $cards.length == showcaseElements+1
      if (i > showcaseElements) opacity = 0
      tl.set($card, {
        x: x+'%',
        y: y-yOffset+'%',
        // z: z-zOffset,
        scale: scale-0.2,
        opacity: 0
      }, vel)
      tl.to($card, vel, {
        y: y+'%',
        // z: z,
        scale: scale,
        opacity: opacity
      }, vel)
    }


    // event handlers
    function cardHandler() {
      hammertime = new Hammer($card, {domEvents: true, css_hacks:false, touchAction: 'auto'});
      hammertime.on('swipeleft', function(e){ $scope.prev() });
      hammertime.on('swiperight', function(e){ $scope.next() });
      hammertime.on('hammer.input', function (e) {
        e.preventDefault()
        e.srcEvent.stopPropagation()
      })
      $element.on('touchmove', function(e) {
        e.stopPropagation()
        e.preventDefault()
      })
      $element.click(function(e) {
        e.stopPropagation()
        e.preventDefault()
      })
    }
    function cleanHandler() {
      if (!hammertime) return
      hammertime.off('swipeleft')
      hammertime.off('swiperight')
      hammertime.off('hammer.input')
    }

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function() {
      cleanHandler()
    })
  }

}(window.angular, window.angular.element));

(function (angular) {
  'use strict'

  /**
    SwipeCarousel
  **/

  angular
    .module('SwipeCarousel', [
      'MainApp'
    ])

}(window.angular));

(function (angular, jq) {
  'use strict'

  /**
  **/

  angular
    .module('SwipeCarousel')
    .component('swipeCarousel', {
      replace: true,
      transclude: true,
      templateUrl: '../js/components/swipeCarousel/template.html',
      controller: SwipeCarouselCtrl,
      controllerAs: 'swipeCarousel',
      bindings: {
        snippets: '<',
        onElemSelect: '&onSelect'
      }
    })

  /* @ngInject */
  function SwipeCarouselCtrl($scope, $element, $attrs, $timeout, _) {
    var ctrl = this
    // https://github.com/angular/angular.js/issues/14433
    // for the issue above we decided to use just $onChanges
    ctrl.$onInit = init
    // ctrl.$onChanges = update
    var vel = .45
    var direction = 'right'
    var debounce = {
      id: null,
      time: vel * 1000, // millis to sec
      start: function() {
        debounce.id = $timeout(debounce.cancel, debounce.time)
      },
      cancel: function() {
        $timeout.cancel(debounce.id)
        debounce.id = null
      }
    }
    var hammertime = null
    var elem = null
    var $elem = null
    var callback = null

    $scope.load = function() {
      console.log(this)
    }

    $scope.prev = function () {
      if (debounce.id) return
      debounce.start()
      direction = 'left'
      // moveCards(direction)
    }

    $scope.next = function () {
      if (debounce.id) return
      debounce.start()
      direction = 'right'
      // moveCards(direction)
    }

    // -------

    // init after dom loaded
    function init() {
      $scope.snippets = ctrl.snippets
      callback = ctrl.onElemSelect()
    }

    // event handlers
    function cardHandler() {
      hammertime = new Hammer($elem, {domEvents: true});
      hammertime.on('swipeleft', function(e){ $scope.prev() });
      hammertime.on('swiperight', function(e){ $scope.next() });
    }
    function cleanHandler() {
      if (!hammertime) return
      hammertime.off('swipeleft')
      hammertime.off('swiperight')
    }

    // deregister event handlers
    // $scope.$on events will be automatically deleted on $destroy
    $scope.$on('$destroy', function() {
      cleanHandler()
    })
  }

}(window.angular, window.angular.element));

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
        touchEnabled: '<?'
      }
    })

  /* @ngInject */
  function StreamgraphCtrl($scope, $element, $attrs, d3, _, everpolate, isMobile) {
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
        cursor, areas, clipMask,
        lyOrder = '', lyOffset = 'silhouette', lyInterpolation = 'basis', // chart paths config
        delay = 1000, duration = 3000, ease = 'exp-out',                  // animation config
        enelCursor = {                                                    // brand cursor
          width: 15,
          height: 52.5
        },
        vertical, tooltip

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
                '</defs'

    function init() {
      console.log('init streamgraph')
      var data = ctrl.datasource
      $element.find('svg').empty()
      $element.find('svg').html(grads)
      _callback = ctrl.onSelect()
      touchEnabled = _.isUndefined(ctrl.touchEnabled)? true : ctrl.touchEnabled

      // -------- INITIALIZE CHART ---------
      svg = d3.select($element.find('svg').get(0))
      box = svg.attr('viewBox').split(' ')
      w   = +box[2] -enelCursor.width // width
      h   = +box[3]                   // height
      vp  = 15                        // vertical padding

      // tooltip elements
      tooltip = d3.select($element.find('.tooltip').get(0))
                  .style('visibility', 'hidden')
      vertical = d3.select($element.find('.vertical').get(0))
                   .style('visibility', 'hidden')

      // create container for chart
      chart = svg.append('g')
                 .attr('id', 'streamBox')
                 .attr('transform', 'translate(' + enelCursor.width + ',' + 0 + ')')
      // create path for each area
      areas = chart.append('g')
                   .attr('class', 'chart')
      // Add 'curtain' rectangle to hide entire graph
      clipMask = chart.append('defs').append('clipPath')
                      .attr('id', 'clipMask')
                      .append('rect')
                      .attr('x', -1 * w)
                      .attr('y', -1 * h+vp)
                      .attr('height', h-vp)
                      .attr('width', 0)
                      .attr('transform', 'rotate(180)')

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

      var prevData = changedObj.datasource.previousValue
      var data     = changedObj.datasource.currentValue
      // !!
      // https://github.com/angular/angular.js/issues/14433
      // for some weird reason component $onChanges is called before $onInit
      // so we assume that if we don't have prevData the components is never being initialized
      init()
      console.log('update streamgraph')

      // -------- DATA MAP ---------
      var lastIdx = d3.min(data, function(d) {return d.values.length})
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
      // update scales domain and range
      var xDomain = d3.extent(data, function(d) { return d.date })
      var yDomain = [0, d3.max(data, function(d) { return d.y0 + d.y })]
      X.domain(xDomain).range([0, w])
      Y.domain(yDomain).range([h-vp, vp])
      Z.range(colorrange)
      // update charts
      areas.selectAll('.layer')
           .data(dataLayers).enter()
           .append('path')
           .attr('clip-path', 'url(#clipMask)')
           .attr('class', function(d,i) { return 'layer layer-'+(i+1) })
           .attr('d', function(d,i) { return area(d.values) })
           .attr('fill', function(d, i) { return 'url(#stream_gr'+(i+1)+')' })
      if (touchEnabled) _attachToolipEvents()

      // update axis data
      lnX.call(xLine.tickSize(h))
      axX.call(xAxis)

      // define transition
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
      clipMask.attr('x', 0)
      t.select('#clipMask rect')
       .attr('width', w)
       .attr('x', -1 * w)

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
      if (isDesktop) {
        var top   = d3.mouse(this)[1]
        left = ((left * $('streamgraph svg').width()) / w)
        vleft = (vleft * $('streamgraph svg').width()) / w
        top = (top * $('streamgraph svg').height()) / h
        top -= (tooltipBBox.height/2 +20) // offset
        tooltip.style('top', top - (tooltipBBox.height/2) + 'px' )
      }
      vertical.style('left', vleft + 'px' )
      tooltip.style('left',  left - (tooltipBBox.width/2) + 'px' )
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
      vertical.style('visibility', 'visible')
      tooltip.style('visibility', 'visible')
    }
    function _hideTooltip(d,i) {
      svg.selectAll('.layer')
         .transition()
         .duration(250)
         .attr('opacity', '1')
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
      // angular two way databinding seems not work here...
      // use d3 instead
      tooltip.select('.key').text(d.key)
      tooltip.select('.time').text(time)
      tooltip.select('.number-lg').text(selected.value)
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

(function (angular) {
  'use strict'

  /**
    StackedAreaChart
  **/

  angular
    .module('StackedAreaChart', [
      'MainApp'
    ])

}(window.angular));

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

;(function(window, undefined){

    'use strict'

  /* THIS ARRAY SHOULD BE UPDATED AFTER EACH GP */
  var seasonCurrentRace = 10
  var seasonTotalRaces = 12
  var team_standings = [
  	{
  		name: "RENAULT E.DAMS",
  		total_points: 259,
  		point_detail: ['place_1','place_4','place_1','place_4','place_1','place_4','fastest_lap','place_5','place_1','pole_position','place_9','place_1','pole_position','place_5','place_5','place_1','place_8','place_8','place_7','place_6','place_4']
  	},

  	{
  		name: "ABT SCHAEFFLER AUDI SPORT",
  		total_points: 194,
  		point_detail: ['place_2','place_5','place_6','place_3','pole_position','place_7','place_1','place_7','place_2','place_7','place_2','pole_position','place_6','place_3','place_4','place_4','place_5','fastest_lap']
  	},

  	{
  		name: "MAHINDRA RACING",
  		total_points: 182,
  		point_detail: ['fastest_lap','place_3','place_3','pole_position','place_9','fastest_lap','place_3','place_6','place_3','place_4','place_1','place_3','place_2','pole_position','place_10','place_3','place_2']
  	},

  	{
  		name: "DS VIRGIN RACING",
  		total_points: 153,
  		point_detail: ['place_2','place_10','place_10','place_3','place_6','fastest_lap','place_2','fastest_lap','place_4','place_7','place_5','place_7','place_1','pole_position','place_1','pole_position']
  	},

    {
  		name: "TECHEETAH",
  		total_points: 94,
  		point_detail: ['place_8','place_2','place_10','place_2','place_8','place_8','place_6','place_2','place_3','place_8']
  	},

    {
      name: "NEXTEV NIO",
      total_points: 59,
      point_detail: ['pole_position','place_8','place_7','place_5','place_9','pole_position','place_9','place_4','place_7','place_10','place_9','place_6']
    },

    {
      name: "ANDRETTI FORMULA E",
      total_points: 30,
      point_detail: ['place_5','place_6','place_6','place_9','place_9']
    },

    {
      name: "FARADAY FUTURE DRAGON RACING",
      total_points: 30,
      point_detail: ['place_7','fastest_lap','place_8','place_6','place_5','place_10']
    },

  	{
  		name: "VENTURI FORMULA E",
  		total_points: 28,
  		point_detail: ['place_9','place_10','place_5','place_8','place_10','place_9','fastest_lap','fastest_lap','place_7']
  	},

  	{
  		name: "PANASONIC JAGUAR RACING",
  		total_points: 21,
  		point_detail: ['place_8','place_4','place_10','place_9','fastest_lap','place_10']
  	}
  ]

  var init = function(el) {

    var $el = $(el)
    var team_standings_desc = team_standings.sort(function(a, b) { return Number(b.total_points) - Number(a.total_points) });

    var bar_width = $(el).find('.bar_container').width()
    var point_width = 100 / team_standings[0].total_points //percent
    var point_px_width = bar_width/team_standings[0].total_points //pixels
    var icon_width = 20;

    $el.find('ul#chart_standings_wrap').html('');
    for(var i = 0; i < team_standings.length; i++ ){
    	var $list = '<li class="team_standing">';
    	$list +=	'<div class="team_name">'+team_standings[i].name+'</div>';
    	$list +=	'<div class="bar_container">';
    	$list +=	'<div class="bar" style="width:0%">';
    	$list +=		'<div class="bar_points">'+team_standings[i].total_points+'pt</div>';
    	var team_points = 0;
    	for (var k = 0; k < team_standings[i].point_detail.length; k++) {
    		var pt = 0;
    		switch(team_standings[i].point_detail[k]){
    			case 'place_1':
    				pt = 25;
    				break;
    			case 'place_2':
    				pt = 18;
    				break;
    			case 'place_3':
    				pt = 15;
    				break;
    			case 'place_4':
    				pt = 12;
    				break;
    			case 'place_5':
    				pt = 10;
    				break;
    			case 'place_6':
    				pt = 8;
    				break;
    			case 'place_7':
    				pt = 6;
    				break;
    			case 'place_8':
    				pt = 4;
    				break;
    			case 'place_9':
    				pt = 2;
    				break;
    			case 'place_10':
    				pt = 1;
    				break;
    			case 'pole_position':
    				pt = 3;
    				break;
    			case 'fastest_lap':
    				pt = 1;
    				break;
    		}

    		team_points += pt;
    		var icon_class = team_standings[i].point_detail[k];
    		if(pt*point_px_width < icon_width){
    			icon_class += ' no_bg';
    		}
    		$list += '<div class="bar_segment '+icon_class+'" style="width:'+pt*point_px_width+'px"></div>';
    	};
    	$list +=	'</div></div></li>';

    	if(team_standings[i].name && team_points != team_standings[i].total_points){
    		console.error('!!! warning: ', team_standings[i].name, 'total_points was:'+ team_standings[i].total_points +', team_points is:'+ team_points)
    	}

    	$el.find('ul#chart_standings_wrap').append($list);

    }

    this.animate = function() {
      var duration = 250
      var $teamBars = $el.first('ul#chart_standings_wrap').find('li.team_standing .bar')
      var $progressBar = $el.find('.progress .bar').first()
      $el.find('#currentRace').text('0')
      $progressBar.css('width', 0 +'%')
      $teamBars.each(function(i, e){
        $(e).css('width', 0 + '%')
        $(e).find('.bar_points').css('opacity', 0)
        setTimeout(function(){
          $(e).css('overflow', 'visible')
          $(e).css('width', team_standings[i].total_points*point_width + '%')
          $(e).find('.bar_points').css('opacity', 1)
        }, (i+1)*duration)
      })
      setTimeout(function(){
        $progressBar.css('width', (seasonCurrentRace / seasonTotalRaces)*100 +'%')
        $el.find('#currentRace').text()
        $({ Counter: 0 }).animate({ Counter: seasonCurrentRace }, {
          duration: 200 * seasonCurrentRace,
          step: function () {
            $el.find('#currentRace').text(Math.ceil(this.Counter));
          }
        })
      }, ($teamBars.length+1) * duration)
    }

    return this;
  }

  window.standingsChart = init

})(window);

;(function(window, undefined){

    'use strict'


    var init = function(el){

      var svg
      var defs
      var ids = ['#first', '#second', '#third', '#fourth']
      var w
      var h

    	d3.xml('../js/components/teamSankey/teamSankey.svg', function(xml){

    		var node = d3.select(el).node()
        $(node).append(xml.documentElement);

        svg = d3.select(el).select('svg')

        var vb = svg.attr('viewBox').split(' ')
        w = vb[2]
        h = vb[3]

        defs = svg.append('defs')

        ids.forEach(function(d, i){
          svg.select(d)
            .attr('opacity', 0)
        })

        svg.selectAll('#lines > g').each(function(e, i){
          createClippingMask(i)
          d3.select(this)
            .attr('id', 'ln_' + i)
            .attr('clip-path', 'url(#linem'+i+')')
        })

      })

      function createClippingMask(id){
        defs.append('clipPath')
          .attr('id', 'linem' + id)
          .append('rect')
          .attr('width', 0)
          .attr('height', h)

      }

      this.animate = function() {

        ids.forEach(function(d, i){

          svg.select(d)
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .delay(500 + 250*i)
            .attr('opacity', 1)

        })

        var leng = svg.selectAll('#lines > g').length

        defs.selectAll('clipPath rect')
          .attr('width', 0)
          .transition()
          .duration(1200)
          .delay(function(d, i){
            return 2500 + 200*(leng-i)
          })
          .attr('width', w)

      }

      return this;
    }





        // global interface name
    window.teamSankey = init

})(window);

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
        snippets: ['fastRecharge', 'efficiency', 'co2', 'regenerativeBraking', 'v2g']
      },
      'smartEnergy': {
        key: 'smartEnergy',
        label: 'Smart energy',
        snippets: ['raceMicrogrid', 'smartMetering', 'v2g', 'firstSmartCity', 'forgetBlackouts'],
      },
      'cleanEnergy': {
        key: 'cleanEnergy',
        label: 'Clean energy',
        snippets: ['raceMicrogrid', 'howMuchSunGlobal', 'cleanEnergyGlobal', 'enelWorld', 'zeroco2ny'],
      },
      'enelAchievements': {
        key: 'enelAchievements',
        label: 'Enel achievements',
        snippets: ['howMuchSunMexico', 'cleanEnergyChile', 'firstSmartCity', 'formulaE', 'enelWorld'],
      }
    }


    var _availableHotspots = {
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
      'pin_2_grid': {
        stage: 2,
        coords: [626, 260, -364],
        snippets: ['raceMicrogrid']
      },
      'pin_2_info': {
        stage: 2,
        coords: [623, 313, 327],
        snippets: ['circuitMontreal2017']
      },
      'pin_2_meter': {
        stage: 2,
        coords: [-715, 145, 245],
        snippets: ['smartMetering']
      },
      // 'pin_2_solar': {
      //   stage: 2,
      //   coords: [-412, 198, -620],
      //   snippets: ['solarPower']
      // },
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
        snippets: ['cleanEnergyGlobal', 'cleanEnergyChile']
      },
      'pin_3_rome': {
        stage: 3,
        // coords: [0.091, 0.64, 0.86],
        coords: [206],
        snippets: ['enelWorld']
      },
      'pin_3_milan': {
        stage: 3,
        // coords: [-0.049, 0.74, 0.78],
        coords: [284],
        snippets: ['firstSmartCity', 'internet']
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
      }
    }

    // snippets
    var _availableSnippets = {
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
            tpl: self.path + '/subcontents/batteryPower-minutes.html'
          },
          {
            desc: '',
            label: 'Enough to charge',
            tpl: self.path + '/subcontents/batteryPower-phones.html'
          }
        ]
      },
      'batteryBrains': {
        desc: '',
        label: '',
        tpl: self.path + '/batteryBrains.html',
        subContent: [
          {
            desc: '',
            label: 'At the NYC ePrix',
            tpl: self.path + '/subcontents/batteryBrains-ePrix.html'
          },
          {
            desc: '',
            label: 'In NYC and the world',
            tpl: self.path + '/subcontents/batteryBrains-world.html'
          }
        ]
      },
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
            tpl: self.path + '/subcontents/sound-noise.html'
          },
          {
            desc: '',
            label: 'Tomorrow\'s cities',
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
            tpl: self.path + '/subcontents/co2-kg.html'
          },
          {
            desc: '',
            label: 'Innovative thinking',
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
            tpl: self.path + '/subcontents/regenerativeBraking-formulaE.html'
          },
          {
            desc: '',
            label: 'On our streets',
            tpl: self.path + '/subcontents/regenerativeBraking-eCar.html'
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
      'raceMicrogrid': {
        desc: '',
        label: '',
        tpl: self.path + '/raceMicrogrid.html',
        subContent: [
          {
            desc: '',
            label: 'Small scale',
            tpl: self.path + '/subcontents/raceMicrogrid-racetrack.html'
          },
          {
            desc: '',
            label: 'Large scale',
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
            tpl: self.path + '/subcontents/smartMetering-kit.html'
          },
          {
            desc: '',
            label: 'Smart meter',
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
            label: 'Can generate',
            tpl: self.path + '/subcontents/solarPower-generate.html'
          },
          {
            desc: '',
            label: 'Can meet the needs of',
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
      'cleanEnergySpain': {
        desc: '',
        label: '',
        tpl: self.path + '/cleanEnergySpain.html'
      },
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

(function (angular) {
  'use strict'

  /**
    ComparisonManager
  **/

  angular
    .module('ComparisonManager', [
      'MainApp'
    ])

}(window.angular));

(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('ComparisonManager')
    .service('ComparisonSrv', ContructorForComparisonSrv)

  /* @ngInject */
  function ContructorForComparisonSrv($q, _) {
    var self  = this
    self.path = '../js/modules/comparisonManager/templates'
    var comparisons = {
      'households': {
        label: 'Households for 1 day',
        param: 1/(11700/365),
        unit: '',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_house'
      },
      'TV': {
        label: 'Watching TV 24/7',
        param: 1/0.07/24/30/12,
        unit: 'years',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_tv'
      },
      'eVehicle': {
        label: 'E-vehicle autonomy',
        param: 6.25,
        unit: 'km',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_car'
      }
    }

    self.getComparisons = _getComparisonsForValue
    return self

    // -------

    function _getComparisonsForValue(val) {
      return $q(function(resolve, reject) {
        var snippets = _.map(comparisons, function(obj, key) {
          obj.key = key
          obj.value = Math.round(val*obj.param*10)/10
          return obj
        })
        if (!_.isEmpty(snippets)) resolve(snippets)
        else reject('No available snippets are defined!')
      })
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
  function RunMainApp($rootScope, $state, fastclick, isMobile) {
    fastclick.attach(document.body)

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeStart to ' + toState.name + ' - fired when the transition begins')
      console.debug('toState, toParams:', toState, toParams)
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

(function (angular) {
  'use strict'

  angular
    .module('MainApp')
    .service('GA', ContructorForGA)

  /* @ngInject */
  function ContructorForGA ($rootScope, $interval, $timeout) {
    console.log('ContructorForGA')

    ga('create', 'UA-7954920-14', 'auto')
    ga('send', 'pageview')

    var that = this
    var sessionTime = 1000 * 60 * 1.5
    var overSessionTime = 1000 * 60 * 5
    var intrvl
    var readyToSession = true

    // $interval(function(){
    //   recordSession()
    // }, overSessionTime)

    /*
    webapp/landing/car/card_id
    webapp/landing/racetrack/card_id
    webapp/landing/world/card_id
    */
    that.track = function (v) {
      console.warn(v)
      if (window.ga) {
        ga('set', 'page', v)
        ga('send', 'pageview', v)
      }
    }

    that.trackLandingFrag = function(v){
      that.track(location.pathname + 'landing/' + v)
    }

    that.cleanFragAndLandingTrack = function(str, prepend){
      var re = /([^\/]*)\.html/g
      var frag = re.exec(str)
      that.trackLandingFrag(prepend + '/' + frag[1])
    }


    function recordSession(){
      console.log('recordSession')
      ga('send', 'pageview', {'sessionControl': 'start'})
      ga('send', 'event', 'webapp', 'sessioncheck');
    }

    that.startWatcher = function () {
      intrvl = $timeout(function () {
        readyToSession = true
      }, sessionTime)
    }

    that.resetWatcher = function () {
      if(readyToSession){
        recordSession()
        readyToSession = false
      }
      $timeout.cancel(intrvl)
      that.startWatcher()
    }

    $('body').on('mousedown touchstart', function(){
      that.resetWatcher()
    })

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, options) {
      var path = location.pathname + toState.name
      that.track(path)
    })

    return that
  }
}(window.angular));

(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('MainApp')
    .service('ModelSrv', ContructorForModelsSrv)

  /* @ngInject */
  function ContructorForModelsSrv($rootScope, $http, $q) {
    var self = this

    var _totalConsumptionData   = null
    var _timeSeriesData         = {}
    var _metersData             = {}
    var enelStandMeter = 'Smart_Kit_BE_001'
    var denStorageMeter = 'Den_Api_FE_001'

    var beUrl = 'http://backend.enelformulae.todo.to.it'
    // var beUrl = 'http://192.168.3.10:5001'

    self.getTotal               = _getTotal
    self.getTimeSeries          = _getTimeSeries
    self.getMeter               = _getMeter
    self.updateTotalConsumption = _updateTotal
    self.updateTimeSeries       = _updateTimeSeries
    self.updateMeter            = _updateMeter

    self.getAllModels           = _getAll
    self.updateAllModels        = _updateAll
    return self

    // -------

    // instance methods
    function _getTotal() {
      return _totalConsumptionData || _updateTotal()
    }
    function _getTimeSeries(zone_name) {
      var zone = zone_name || 'circuit'
      return _timeSeriesData[zone] || _updateTimeSeries(zone_name)
    }
    function _getMeter(meter_name) {
      if (!meter_name) return console.error('Error::Meter name could not be empty')
      return _metersData[meter_name] || _updateMeter(meter_name)
    }
    function _getMeterTimeSeries(meter_name) {
      if (!meter_name) return console.error('Error::Meter name could not be empty')
      return _timeSeriesData[meter_name] || _updateMeterTimeSeries(meter_name)
    }
    function _getAll() {
      return $q.all([_getTotal(),
                     _getTimeSeries(),
                     _getTimeSeries('paddock'),
                     _getMeter(enelStandMeter),
                     _getMeter(denStorageMeter),
                     _getMeterTimeSeries(denStorageMeter)
                    ])
               .then(
                  function(res) {
                    return {
                      totalConsumption: _totalConsumptionData,
                      timeSeries:       _timeSeriesData,
                      meters:           _metersData
                    }
                  }, function(err) {
                    console.error(err)
                    return null
                  })
    }

    function _updateTotal() {
      console.log('get from ', beUrl)
      return $http.get(beUrl + '/zoneenergyconsumption')
                  .then(
                    function(res) {
                      console.info(res)
                      _totalConsumptionData = res.data
                      return _totalConsumptionData
                    }, function(err) {
                      console.error(err)
                      return null
                    })
    }
    function _updateTimeSeries(zone_name) {
      return $http.get(beUrl + '/time_series/' + (zone_name || ''))
                  .then(
                    function(res) {
                      console.info(res)
                      zone_name = zone_name || 'circuit'
                      _timeSeriesData[zone_name] = res.data
                      return _timeSeriesData[zone_name]
                    }, function(err) {
                      console.error(err)
                      return null
                    })
    }
    function _updateMeter(meter_name) {
      return $http.get(beUrl + '/meter/' + (meter_name || ''))
                  .then(
                    function(res) {
                      console.info(res)
                      _metersData[meter_name] = res.data
                      return _metersData[meter_name]
                    }, function(err) {
                      console.error(err)
                      return null
                    })
    }
    function _updateMeterTimeSeries(meter_name) {
      return $http.get(beUrl + '/meter_time_series/' + (meter_name || ''))
                  .then(
                    function(res) {
                      console.info(res)
                      _timeSeriesData[meter_name] = res.data
                      return _timeSeriesData[meter_name]
                    }, function(err) {
                      console.error(err)
                      return null
                    })
    }
    function _updateAll() {
      return $q.all([_updateTotal(),
                     _updateTimeSeries(),
                     _updateTimeSeries('paddock'),
                     _updateMeter(enelStandMeter),
                     _updateMeter(denStorageMeter),
                     _updateMeterTimeSeries(denStorageMeter)
                    ])
               .then(
                  function(res) {
                    console.info('All models updated: ', res)
                    return $rootScope.$broadcast('ModelSrv::ALL-MODELS-UPDATED')
                  }, function(err) {
                    console.error(err)
                    return null
                  })
    }
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
    Module configuration for WebApp
  **/

  angular
    .module('WebApp', [
      'ui.router',
      'ngAnimate',
      'MainApp',
      'SnippetManager',
      'ComparisonManager',
      'Streamgraph',
      'DonutChart',
      'StackedAreaChart',
      'SnippetCard',
      'SnippetCarousel',
      'SwipeCarousel'
    ])
    .controller('MainCtrl', mainCtrl)

    function mainCtrl($rootScope, $scope, $state) {
      $scope.menuOpen = false
      $scope.loading = $rootScope.loading

      $('#app-menu').css({visibility: 'visible'})

      $scope.toggleMenu = function() {
        $scope.menuOpen = !$scope.menuOpen
        $('#ham').toggleClass('close')
        $('header h4').toggleClass('visible')
      }

      $scope.goTo = function(stateName) {
        $state.go(stateName, {reload: true})
        $scope.toggleMenu()
      }
    }

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
  function RunWebApp($rootScope, later, ModelSrv) {

    // var schedule = later.parse.cron('4,9,14,19,24,29,34,39,44,49,54,59 * * * *')
    // var scheduleTime = 30 +' seconds' // test
    var scheduleTime = 5 +' minutes'
    var schedule = later.parse.text('every '+ scheduleTime)
    console.info("Setting schedule: ", schedule)
    console.info("Schedule runs every: ", scheduleTime)
    function modelsUpdate() {
      console.info('SCHEDULE:::run model update:::')
      return ModelSrv.updateAllModels()
    }
    later.setInterval(modelsUpdate, schedule)

    $rootScope.loaded = false
    $rootScope.forceReload = false
    $rootScope.showLoader = function() {
      $rootScope.loaded = false
    }
    $rootScope.hideLoader = function() {
      if ($rootScope.forceReload) return
      $rootScope.loaded = true
    }

    $rootScope.$on('$stateChangeStart', $rootScope.showLoader)
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
  function RouteConfig($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, isMobile, $locationProvider) {

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
        // $location.replace().path(normalized)
      }
    })

    $urlRouterProvider.when('', 'landing')
    $urlRouterProvider.when('/', 'landing')
    $urlRouterProvider.when('/landing-mobile', 'landing-mobile/')
    $urlRouterProvider.otherwise('landing')

    var liveRace = {
      "id": "r10",
      "live": false,
      "name": "Brooklyn circuit",
      "location": "New York",
      "country": "USA",
      "date": "16 Jul 2017",
      "videoId": "",
      "circuit": {
        "map": "circuit_ny",
        "length": "",
        "laps": "",
        "fastestLap": {
          "race": {
            "firstName": "",
            "lastName": "",
            "time": ""
          },
          "outright": {
            "firstName": "",
            "lastName": "",
            "time": ""
          }
        }
      },
      "meters": 30,
      "mix": null,
    }
    var liveRace = null

    $stateProvider
      // .state('404', {
      //   url: '/404',
      //   templateUrl: 'templates/404.html'
      // })
      .state('landing', {
        url: '/landing',
        resolve: {
          liveData: function() { return liveRace }
        },
        controller: 'LandingCtrl',
        controllerAs: 'landing',
        templateUrl: 'templates/landing.html',
        onEnter: function(isMobile, $state) {
          if (isMobile) return $state.go('landingMobile', {}, {reload: true})
        },
        onExit: function($rootScope, $window, $timeout) {
          $rootScope.forceReload = true
          $timeout(function() { $window.location.reload() }, 300)
        }
      })
      .state('landingMobile', {
        url: '/landing-mobile/:tourKey/:snippetKey',
        params: {
          tourKey: {squash: true, value: null},
          snippetKey: {squash: true, value: null}
        },
        templateUrl: 'templates/landing-mobile.html',
        controller: 'LandingMobileCtrl',
        controllerAs: 'landing',
        onEnter: function() {
          $('header').hide()
          $('header.mobile-header').show()
        },
        onExit: function() {
          $('header').show()
          $('header.mobile-header').hide()
        },
        resolve: {
          tours: function(SnippetSrv) {
            return SnippetSrv.getAvailableTours()
          },
          currentTour: function(SnippetSrv, $stateParams, tours) {
            var tourKey = $stateParams.tourKey
            return _.find(tours, {key: tourKey})
          },
          currentSnippet: function(SnippetSrv, $stateParams, currentTour) {
            if (!currentTour) return null
            var snippetKey = $stateParams.snippetKey || currentTour.snippets[0]
            return SnippetSrv.getSnippet(snippetKey)
          }
        }
      })
      .state('dashboard', {
        url: '/dashboard',
        resolve: {
          liveData: function(ModelSrv) {
            if (!liveRace) return null
            return ModelSrv.getAllModels()
                           .then(function(res) {
                              console.info(res)
                              liveRace.streamData       = res.timeSeries.circuit
                              liveRace.streamPaddock    = res.timeSeries.paddock
                              liveRace.streamDen        = res.timeSeries['Den_Api_FE_001']
                              liveRace.totalConsumption = res.totalConsumption
                              liveRace.metersData       = res.meters
                              return liveRace
                           }, function(err) {
                              console.error(err)
                           })
          },
          races: function($http) {
            return $http.get('../assets/jsonData/races.json')
                        .then(function(res) {
                          return res.data.races
                        }, function(err) {
                          console.error(err)
                        })
          }
        },
        controller: 'DashboardCtrl',
        controllerAs: 'dashboard',
        templateUrl: 'templates/dashboard.html'
      })
      .state('formulae', {
        url: '/formulae',
        resolve: {
          teams: function($http) {
            return $http.get('../assets/jsonData/teams.json')
                        .then(function(res) {
                          return res.data.teams
                        }, function(err) {
                          console.error(err)
                        })
          },
          drivetrains: function($http) {
            return $http.get('../assets/jsonData/drivetrains.json')
                        .then(function(res) {
                          return res.data.drivetrains
                        }, function(err) {
                          console.error(err)
                        })
          }
        },
        controller: 'FormulaeCtrl',
        controllerAs: 'formulae',
        templateUrl: 'templates/formulae.html'
      })
      .state('3dtest', {
        url: '/3dtest',
        controller: '3dCtrl',
        controllerAs: 'ctrl',
        templateUrl: 'templates/3dtest.html'
      })
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('LandingCtrl', landingCtrl)

  /* @ngInject */
  function landingCtrl ($rootScope, $scope, $window, $http, $state, $timeout, $interval, _, SnippetSrv, TweenMax, GA, ModelSrv, liveData) {
    var vm = this
    vm.snippets = []
    vm.tours = SnippetSrv.getAvailableTours();
    vm.setCurrentTour = setCurrentTour
    vm.currentTour = null
    vm.isMobile = bowser.mobile || false;
    vm.snipCounter = 0;

    var idle = null
    var idleTOut = 15000 // millis

    var FEScene = null
    // Desktop only init
    angular.element(document).ready(render)

    // races
    vm.races = []
    vm.currentRace = liveData || {}
    vm.totalConsumption = {}
    getLiveData()
    if (vm.currentRace.live) {
      $scope.$on('ModelSrv::ALL-MODELS-UPDATED', getLiveData)
    }

    function render() {
      $('header h4').text('')
      $(window).on("AssetsLoaded", $rootScope.hideLoader)

      var $container = $('#3dcontainer')
      var container = $container.get(0)
      $timeout(function() {
        startGraphAnimation()
        // Events
        $('#landing > section .zoom g[id*="stage-"]').click(function() {
          var stage = +this.id.split('stage-')[1]
          zoom(stage)
        })
      }, 500)
      init()

      function init() {
        vm.snipCounter = -1;
        FEScene = new TERMINALIA.FEScene(container, TERMINALIA.CustomShaders)
        FEScene.render()

        // Idle timeout
        startIdle()
        $(window).on('resize', FEScene.resize)
        $(window).on('click', function(e){
          stopIdle()
          selectedHotspot(FEScene.findObjectOnClick(e))
        })
        $(window).on('keydown', function(event) {
          if (event.key === 't') { FEScene.getCameraPosition() }
          if (event.key === 'y') { FEScene.getWorldRotation() }
          if (event.key === 'i') { FEScene.enableStage1Stage2AutoRotateAnimation(true) }
          if (event.key === 'o') { FEScene.enableStage3AutoRotateAnimation(true) }
        });
      }
    }

    function startGraphAnimation() {
      var graph = $('#landing footer .graph svg')
      var graphTime = 1500
      var data = []
      // populate data array
      _.times(7, function() {
        var d = Math.round((Math.random()+0.3)*10)/10
        data.push(d)
      })
      // loop
      $interval(function() {
        _.times(7,function(i) {
          graph.find('#line'+(i+1)).css({'transform': 'scaleY('+data[i]+')'})
          // TweenMax.to(graph.find('#line'+(i+1)), .5, {scaleY: data[i]})
        })
        data.shift()
        var d = Math.round((Math.random()+0.3)*10)/10
        data.push(d)
      }, graphTime)
    }

    function startIdle() {
      if (idle) return
      idle = $timeout(function() {
        if(currentPin || vm.currentTour) return
        $('#landing > section .idle').addClass('active')
        switch($scope.currentStage) {
          case 1:
          case 2:
            FEScene.enableStage1Stage2AutoRotateAnimation(true)
          break
          case 3:
            FEScene.enableStage3AutoRotateAnimation(true)
          break
          default: return
        }
      }, idleTOut)
    }

    function stopIdle() {
      $timeout.cancel(idle)
      $('#landing > section .idle').removeClass('active')
      switch($scope.currentStage) {
        case 1:
        case 2:
          FEScene.enableStage1Stage2AutoRotateAnimation(false)
        break
        case 3:
          FEScene.enableStage3AutoRotateAnimation(false)
        break
        default: return
      }
      idle = null
      startIdle()
    }

    var hammerzoom = new Hammer($('#landing > section .zoom')[0], {domEvents: true})
    hammerzoom.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    hammerzoom.on('swipeup', function(e){
      e.srcEvent.preventDefault()
      e.srcEvent.stopPropagation()
      var stage = $scope.currentStage -1
      zoom(stage)
    });
    hammerzoom.on('swipedown', function(e){
      e.srcEvent.preventDefault()
      e.srcEvent.stopPropagation()
      var stage = $scope.currentStage +1
      zoom(stage)
    });

    function getLiveData() {
      return ModelSrv.getAllModels()
                     .then(function(res) {
                        console.info(res)
                        vm.totalConsumption = res.totalConsumption
                        return res
                     }, function(err) {
                        console.error(err)
                     })
    }

    $scope.currentStage = 1
    var stages = ['StageStart', 'StageCircuit', 'StageFinal']
    $scope.checkHotSpot = function(card) {
      vm.snipCounter++
      if(vm.snipCounter > vm.snippets.length-1) vm.snipCounter = 0;

      GA.cleanFragAndLandingTrack(card.tpl, labelStages[$scope.currentStage-1])

      if (!card.hotspot) return
      FEScene.resetPinsVisibility(false)

      if (card.hotspot.stage === $scope.currentStage) return pinAnimation(card)
      $scope.currentStage = card.hotspot.stage
      FEScene.startStageAnimation(card.hotspot.stage)
      switch(card.hotspot.stage) {
        case 1:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(0%)'})
        break
        case 2:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(120%)'})
        break
        case 3:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(240%)'})
        break
        default: return
      }
      $(window).on('StageTimeLineEnded', function() {
        pinAnimation(card)
        $(window).off('StageTimeLineEnded')
      })
    }
    function pinAnimation(card) {
      if(!vm.currentTour) return
      FEScene.highlightPin(stages[card.hotspot.stage-1], card.hotspot.key)
      if (card.hotspot.stage !== 3) {
        FEScene.startCameraAnimation(card.hotspot.coords, 2)
      } else {
        FEScene.startWorldAnimation(card.hotspot.coords, 1)
      }
    }

    $scope.closeCarousel = function() {
      $('.zoom').fadeIn()
      var carouselCtrl = angular.element($('snippet-carousel')).controller('snippetCarousel')
      carouselCtrl.exit(true);
      carouselCtrl.setTour(false);
      vm.snipCounter = -1;
      vm.currentTour = null
      currentPin = null
      if (FEScene) FEScene.resetPinsVisibility(true)
      if (!$scope.$$phase) $scope.$digest()
    }

    var labelStages = ['carView', 'circuitView', 'worldView']
    function zoom(zoom) {
      switch(zoom) {
        case 1:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(0%)'})
        break
        case 2:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(120%)'})
        break
        case 3:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(240%)'})
        break
        default: return
      }
      $scope.closeCarousel();
      $scope.currentStage = zoom
      GA.trackLandingFrag(labelStages[$scope.currentStage])
      FEScene.startStageAnimation($scope.currentStage)
    }

    $scope.tours = ['E-mobility','Smart Energy','Clean Energy','Enel achievements']
    var tour = $('#tour-menu')

    var currentPin = null
    function selectedHotspot(key) {
      if (!key || key === 'World' || vm.currentTour) return
      if (key === currentPin) return $scope.closeCarousel()
      currentPin = key
      var hotspot = SnippetSrv.getHotspot(key);
      vm.snippets = _.reverse(hotspot.snippets)

      if (!$scope.$$phase) $scope.$digest()
    }

    function setCurrentTour(tour, $index) {
      stopIdle()
      $('.zoom').fadeOut()
      var carouselCtrl = angular.element($('snippet-carousel')).controller('snippetCarousel')
      carouselCtrl.setTour(true);
      vm.snipCounter = -1;
      if (vm.currentTour === tour) return $scope.closeCarousel()
      vm.currentTour = tour;
      vm.snippets = _.reverse(angular.copy(tour.snippets))
      if (!$scope.$$phase) $scope.$digest()
      var el = $('#tour-menu').children().eq($index);
      var pos = -el.position().left + $('#tour-wrapper').width() / 2 - el.width() / 2;
      TweenMax.to($('#tour-menu'), .5, {scrollTo: {x: "#"+el.attr('id')}})
    }

    // deregister event handlers
    $scope.$on('$destroy', function () {
      $(window).off()
    })
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('LandingMobileCtrl', landingMobileCtrl)

  /* @ngInject */
  function landingMobileCtrl($rootScope, $scope, $state, tours, currentTour, currentSnippet) {
    var vm = this
    vm.select = select
    vm.selectSnippet = selectSnippet
    vm.closeTour = closeTour
    vm.openMenu = openMenu
    vm.closeMenu = closeMenu
    vm.allTours = tours
    vm.currentTour = currentTour

    vm.currentSnippet = currentSnippet
    vm.allSnippets = [];

    angular.element(document).ready($rootScope.hideLoader)

    if (!vm.currentTour) return openMenu()
    else if (!vm.currentSnippet) return select(vm.currentTour)
    else {
      vm.allSnippets = vm.currentTour.snippets
      return selectSnippet(vm.currentSnippet)
    }

    function select(tour) {
      if (!tour) return console.error('No tour selected!')
      var searchKey = tour.key
      vm.currentTour = _.find(vm.allTours, {key: tour.key})
      vm.allSnippets = vm.currentTour.snippets
      vm.currentSnippet = vm.allSnippets[0]
      // update url without reload the page
      $state.go('landingMobile', {tourKey: vm.currentTour.key, snippetKey: vm.currentSnippet.key}, {notify: false})
      closeMenu()
    }

    function closeTour(){
      vm.currentTour = null;
      vm.currentSnippet = null;
      vm.allSnippets = [];
      $state.go('landingMobile', {tourKey: null, snippetKey: null}, {notify: false})
      openMenu()
    }

    function selectSnippet(snippet) {
      if (!snippet) return console.error('No snippet selected!')
      vm.currentSnippet = _.find(vm.allSnippets, {key: snippet.key})
      $state.go('landingMobile', {tourKey: vm.currentTour.key, snippetKey: vm.currentSnippet.key}, {notify: false})
    }

    function openMenu() {
      $('#landing-mobile').css({'transform':'translateY(-100%)'})
      $('#landing-mobile-menu').css({'transform':'translateY(0)'})
    }
    function closeMenu() {
      if (!vm.currentTour) return select(vm.allTours[0])
      $('#landing-mobile').css({'transform':'translateY(0)'})
      $('#landing-mobile-menu').css({'transform':'translateY(100%)'})
    }

    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }

}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('3dCtrl', tredCtrl)

  /* @ngInject */
  function tredCtrl ($scope, $rootScope) {
    var vm = this
    var container = $('#3dcontainer')[0]
    var FEScene = new TERMINALIA.FEScene(container, TERMINALIA.CustomShaders);
    FEScene.render();
    angular.element(document).ready($rootScope.hideLoader)

    //Call by ng-click
    $scope.goToStage1 = function() {
      FEScene.startStageAnimation(1);
    }

    $scope.goToStage2 = function() {
      FEScene.startStageAnimation(2);
    }

    $scope.goToStage3 = function() {
      FEScene.startStageAnimation(3);
    }
    
    window.addEventListener('resize', FEScene.resize, false);
    window.addEventListener('click', FEScene.findObjectOnClick, false);
    window.addEventListener('keydown', function(event) {

        if (event.key === '1') {
          FEScene.startStageAnimation(1);
        }

        if (event.key === '2') {
          FEScene.startStageAnimation(2);
        }1

        if (event.key === '3') {
          FEScene.startStageAnimation(3);
        }

		/*
        if (event.key === 'a') {
          FEScene.getCameraPosition();
        }

        if (event.key === 'q') {
          FEScene.startCameraAnimation([2, 1, 3], 2);
        }
		*/

        if (event.key === 'a') {
          //FEScene.startCameraAnimation([3, 3, 0.8], 2);
		      FEScene.movePins(-1, 0, 0);
        }

        if (event.key === 'd') {
          FEScene.movePins(1, 0, 0);
        }

        if (event.key === 'w') {
          FEScene.movePins(0, 1, 0);
        }

        if (event.key === 's') {
          FEScene.movePins(0, -1, 0);
        }

        if (event.key === 'e') {
          //FEScene.startCameraAnimation([2, 3, -3], 2)
		      FEScene.movePins(0, 0, 1);
        }

        if (event.key === 'q') {
          FEScene.movePins(0, 0, -1);
        }

        if (event.key === 't') {
          FEScene.getCameraPosition();
        }

        if (event.key === 'y') {
          FEScene.getWorldRotation();
        }

        if (event.key === 'z') {
          FEScene.highlightPin('StageStart', 'pin_1_electricity');
        }

        if (event.key === 'x') {
          FEScene.highlightPin('StageFinal', 'pin_3_v2g');
          FEScene.highlightPin('StageCircuit', 'pin_2_grid');
        }

        if (event.key === 'c') {
          FEScene.highlightPin('StageFinal', 'pin_3_v2g');
        }

        if (event.key === 'u') {
          FEScene.enableStage3AutoRotateAnimation(true);
        }

        if (event.key === 'i') {
          FEScene.enableStage1Stage2AutoRotateAnimation(true);
        }
    });

    //DISABLE SCROLL
    var firstMove
    window.addEventListener('touchstart', function (e) {
      firstMove = true
    }, { passive: false })

    window.addEventListener('touchend', function (e) {
      firstMove = true
    }, { passive: false })

    window.addEventListener('touchmove', function (e) {
      if (firstMove) {
        e.preventDefault()
        firstMove = false
      }
    }, { passive: false })
    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('SnipCtrl', snipCtrl)

  /* @ngInject */
  function snipCtrl ($scope, snippets, singleSnip) {
    var vm = this
    vm.snippets = snippets
    $scope.currentSnip = singleSnip
    console.log($scope.currentSnip)

    //Call by ng-click

    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('DashboardCtrl', dashboardCtrl)

  /* @ngInject */
  function dashboardCtrl ($rootScope, $scope, $window, $http, $timeout, races, liveData, _, ComparisonSrv, ModelSrv) {
    var vm = this

    $('header h4').text('Discover the energy behind Formula E')
    angular.element(document).ready($rootScope.hideLoader)

    // races
    vm.races = []
    vm.currentRace = {}
    vm.streamData = []
    vm.streamPaddock = []
    vm.streamDen = []
    $scope.allData = []
    $scope.allDendata = []
    $scope.paddockData = {}
    var enelMeterKey = 'Smart_Kit_BE_001'
    var denMeterKey = 'Den_Api_FE_001'
    vm.metersData = null
    vm.enelMeterStandData = null
    vm.totalConsumption = {
      total_energy: 0,
      zones: []
    }
    vm.mixes = []
    vm.selectedKey = null
    $scope.selectAll = selectAll
    $scope.select = select
    $scope.currentAreaShown = 'all'

    vm.races = races
    if (liveData) vm.races.push(liveData)
    var currentRace = _.last(vm.races)

    console.log(currentRace)

    // -------

    $scope.snippets = []
    $scope.getComparisons = function() {
      return ComparisonSrv.getComparisons(vm.totalConsumption.total_energy)
                          .then(function(res) {
                            $scope.snippets = res
                            return res
                          }, function(err) {
                            console.error(err)
                          })
    }

    var currentRaceIdx = null
    $scope.selectRace = function(id) {
      if (!_.isEmpty(vm.streamPaddock)) emptyAll()
      var currentRace = _.find(vm.races, {id: id})
      vm.currentRace = angular.copy(currentRace)
      if (_.isEmpty(currentRace) || _.isEmpty(currentRace.streamData)) return
      vm.streamData = currentRace.streamData? angular.copy(currentRace.streamData.zones) : []
      vm.streamPaddock = currentRace.streamPaddock? angular.copy(currentRace.streamPaddock.zones) : []
      vm.totalConsumption = angular.copy(currentRace.totalConsumption)
      vm.mixes = currentRace.mix? currentRace.mix : []
      vm.metersData = currentRace.metersData? currentRace.metersData : null
      if (currentRace.metersData) {
        var firstMeterFound = _.keys(vm.metersData)[0]
        vm.enelMeterStandData = !_.isEmpty(vm.metersData[enelMeterKey])? vm.metersData[enelMeterKey] : vm.metersData[firstMeterFound]
        vm.denMeterData = !_.isEmpty(vm.metersData[denMeterKey])? vm.metersData[denMeterKey] : null
        vm.streamDen = vm.denMeterData && currentRace.streamDen? angular.copy(currentRace.streamDen.zones) : []
      }
      var newRaceIdx = _.indexOf(vm.races, currentRace)
      var raceList = $('.races-list ul').find('li')
      var raceListItem = raceList[newRaceIdx]
      if (raceListItem) TweenMax.to(raceList, .5, {x: '+=' + (currentRaceIdx-newRaceIdx)*100 + '%'})
      if (!$scope.$$phase) $scope.$digest()
      currentRaceIdx = newRaceIdx
      $scope.getComparisons()
      $timeout(selectAll, 1000)
    }
    $scope.selectRace(currentRace.id)
    raceHandler()


    function checkMQ() {
      return $window.matchMedia("(max-width: 52em)").matches
    }

    var hammerRace = null
    function raceHandler() {
      if (!bowser.mobile && !bowser.tablet) return
      hammerRace = new Hammer($('.races-list').get(0), {domEvents: true});
      hammerRace.on('swipeleft', function(e){ $scope.selectRace('r'+(currentRaceIdx+2)) });
      hammerRace.on('swiperight', function(e){ $scope.selectRace('r'+(currentRaceIdx)) });
    }
    function cleanRaceHandler() {
      if (!hammerRace) return
      hammerRace.off('swipeleft')
      hammerRace.off('swiperight')
    }

    var currentBalanceIdx = 1
    $scope.selectBalance = function(id) {
      if (!bowser.mobile && !bowser.tablet) return
      if (!checkMQ()) return
      var balanceList = $('#balance ul').find('li')
      if (id >= balanceList.length || id < 0) return
      TweenMax.to(balanceList, .5, {x: '+=' + (currentBalanceIdx-id)*100 + '%'})
      if (!$scope.$$phase) $scope.$digest()
      currentBalanceIdx = id
    }
    var hammerBalance = null
    function balanceHandler() {
      if (!bowser.mobile && !bowser.tablet) return
      hammerBalance = new Hammer($('#balance ul').get(0), {domEvents: true});
      hammerBalance.on('swipeleft', function(e){ $scope.selectBalance(currentBalanceIdx+1) });
      hammerBalance.on('swiperight', function(e){ $scope.selectBalance(currentBalanceIdx-1) });
    }
    function cleanBalanceHandler() {
      if (!hammerBalance) return
      hammerBalance.off('swipeleft')
      hammerBalance.off('swiperight')
    }

    var currentMixIdx = 1
    $scope.selectMix = function(id) {
      if (!bowser.mobile && !bowser.tablet) return
      if (!checkMQ()) return
      var mixList = $('#energy_mix ul').find('li')
      if (id >= mixList.length || id < 0) return
      TweenMax.to(mixList, .5, {x: '+=' + (currentMixIdx-id)*100 + '%'})
      if (!$scope.$$phase) $scope.$digest()
      currentMixIdx = id
    }
    var hammerMix = null
    function mixHandler() {
      if (!bowser.mobile && !bowser.tablet) return
      if (_.isEmpty(vm.mixes)) return
      hammerMix = new Hammer($('#energy_mix ul').get(0), {domEvents: true});
      hammerMix.on('swipeleft', function(e){ $scope.selectMix(currentMixIdx+1) });
      hammerMix.on('swiperight', function(e){ $scope.selectMix(currentMixIdx-1) });
    }
    function cleanMixHandler() {
      if (!hammerMix) return
      hammerMix.off('swipeleft')
      hammerMix.off('swiperight')
    }

    $scope.loadPercentage = function(zone, label, idx) {
      var percentage = zone[label]/vm.totalConsumption['total_'+label]*100
      var percSel = $('#dashboard #balance .zone_balance .percentage-bar').get(idx)
      TweenMax.to(percSel, .5, {width: percentage+'%'})
      return percentage
    }

    balanceHandler()
    mixHandler()

    function selectAll() {
      vm.selectedKey = null
      $scope.currentAreaShown = 'all'
      $scope.paddockData = _.find(vm.totalConsumption.zones, {name: 'Paddock'})
      $scope.alldata = vm.streamPaddock
      $scope.allDendata = vm.streamDen
    }

    function emptyAll() {
      var selectedData = []
      var selectedDenData = []
      $scope.currentAreaShown = 'all'
      vm.streamPaddock.forEach(function(d){
        return selectedData.push(__emptyData(d))
      })
      vm.streamDen.forEach(function(d){
        return selectedDenData.push(__emptyData(d))
      })
      console.log(selectedDenData)
      $scope.alldata = selectedData
      $scope.allDendata = selectedDenData
    }

    function select(key){
      $scope.currentAreaShown = key
      if (!key || key === vm.selectedKey) return selectAll()
      vm.selectedKey = key
      var selectedData = []
      vm.streamPaddock.forEach(function(d){
        if (d.key === key) return selectedData.push(d)
        return selectedData.push(__emptyData(d))
      })
      var pdata = _.find(vm.totalConsumption.zones, {name: 'Paddock'})
      $scope.paddockData = _.find(pdata.subzones, {name: _.capitalize(key)})
      $scope.alldata = selectedData
    }

    function __emptyData(data) {
      var values = data.values
      var emptydata = {
        key: data.key,
        values: values.map(function(d){
          return { h: d.h, v: 0 }
        })
      }
      return emptydata
    }

    // event handlers
    $scope.getLiveData = function() {
      return ModelSrv.getAllModels()
                     .then(function(res) {
                        console.info(res)
                        if (vm.currentRace.live) {
                          if (!_.isEmpty(vm.streamPaddock)) emptyAll()
                          vm.streamData         = res.timeSeries.circuit.zones
                          vm.streamPaddock      = res.timeSeries.paddock.zones
                          vm.totalConsumption   = res.totalConsumption
                          vm.metersData         = res.metersData
                          vm.enelMeterStandData = currentRace.metersData[enelMeterKey]
                          vm.denMeterData       = currentRace.metersData[denMeterKey]
                          vm.streamDen          = res.timeSeries[denMeterKey].zones
                          $scope.getComparisons()
                          $timeout(selectAll, 1000)
                        }
                        return res
                     }, function(err) {
                        console.error(err)
                     })
    }
    $scope.$on('ModelSrv::ALL-MODELS-UPDATED', $scope.getLiveData)

    // deregister event handlers
    $scope.$on('$destroy', function () {
      cleanRaceHandler()
      cleanBalanceHandler()
      cleanMixHandler()
    })
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('FormulaeCtrl', formulaeCtrl)

  /* @ngInject */
  function formulaeCtrl ($rootScope, $scope, $timeout, teams, drivetrains) {
    var vm = this

    $('header h4').text('More about the Formula E season')
    angular.element(document).ready($rootScope.hideLoader)

    var standings = new standingsChart('#chart_standings')
    var drivetrainsChart = new teamSankey('#chart_drivetrains')

    $scope.teams = teams
    $scope.currentTeam = null
    $scope.teamSelected = false

    $scope.drivetrains = drivetrains
    $scope.currentDrive = drivetrains.idle

    $scope.selectTeam = function (team, $event) {
      var toggle = !team || team === $scope.currentTeam
      $('#specs_teams #car_profile img').removeClass('active')
      $('#car_specs #car_cursor').removeClass('active')
      $('#teams_list .toggle').removeClass('close')
      $scope.currentTeam = null
      if (toggle) {
        $('#teams_list select').removeClass('active')
        $scope.teamSelected = false
        return TweenMax.to($('#car_profile svg g#traccia > *'), 1.5, {drawSVG:"100%", delay:.4, ease:Power2.easeOut});
      }
      if (!$scope.$$phase) $scope.$digest()
      if ($event) $($event.currentTarget).find('.toggle').addClass('close')
      else $('#teams_list select').addClass('active')
      $timeout(function() {
        $scope.currentTeam = team
        TweenMax.to($('#car_profile svg g#traccia > *'), 1.5, {drawSVG:"0%", delay:0, ease:Power2.easeOut, onStart: function() {
          $('#specs_teams #car_profile img').addClass('active')
          $('#car_specs #car_cursor').addClass('active')
        }});
        $scope.teamSelected = true
        if (!$scope.$$phase) $scope.$digest()
      }, 300)
    }
    $scope.selectTeamIdx = function(idx) {
      var team = idx? $scope.teams[idx] : null
      $scope.selectTeam(team)
    }

    $scope.selectDrive = function (drive, $event) {
      var toggle = !drive || drive === $scope.currentDrive
      $('#drive_list .toggle').removeClass('close')
      $('#drive_list select').removeClass('active')
      $scope.currentDrive = null
      if (toggle) {
        drive = $scope.drivetrains.idle
      }
      if (!$scope.$$phase) $scope.$digest()
      if (!toggle && $event) $($event.currentTarget).find('.toggle').addClass('close')
      if (!toggle && !$event) $('#drive_list select').addClass('active')
      $('#ill_powertrain_idle').css({opacity: 0})
      $('#ill_powertrain_longitudinal').css({opacity: 0})
      $('#ill_powertrain_traverse_element').css({opacity: 0})
      $('#ill_powertrain_traverse1').css({opacity: 0})
      $('#ill_powertrain_traverse2').css({opacity: 0})
      switch (drive.title) {
        case '1 Longitudinal motor':
          $('#ill_powertrain_longitudinal').css({opacity: 1})
        break
        case '1 Transverse motor':
          $('#ill_powertrain_traverse_element').css({opacity: 1})
          $('#ill_powertrain_traverse1').css({opacity: 1})
        break
        case '2 Transverse motors':
          $('#ill_powertrain_traverse_element').css({opacity: 1})
          $('#ill_powertrain_traverse1').css({opacity: 1})
          $('#ill_powertrain_traverse2').css({opacity: 1})
        break
        default:
          $('#ill_powertrain_idle').css({opacity: 1})
          $('#ill_powertrain_longitudinal').css({opacity: 1})
        break
      }
      $timeout(function() {
        $scope.currentDrive = drive
        if (!$scope.$$phase) $scope.$digest()
      }, 300)
    }
    $scope.selectDriveIdx = function(idx) {
      var drive = idx? $scope.drivetrains.drives[idx] : null
      $scope.selectDrive(drive)
    }

    $timeout(function() {
      standings.animate()
      drivetrainsChart.animate()
      // car profile tween
      TweenMax.set($('#car_profile'), {opacity: 1});
      TweenMax.set($('#car_profile svg g > *'), {drawSVG:"0%"});
      TweenMax.to($('#car_profile svg g#traccia > *'), 1.5, {drawSVG:"100%", delay:.4, ease:Power2.easeOut});
    }, 1000)

    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }
}(window.angular));

//# sourceMappingURL=main.js.map