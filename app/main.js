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
      if (idx > (container.children().length-1) / 2){
        var offset = container.outerWidth() - current.position().left - current.outerWidth();
      } else {
        var offset = 0;
      }
      if ($scope.snip.extraClass == 'enelx') {
        if (idx > (container.children().length-1) / 2){
          var offset = container.outerWidth() - current.position().left - current.outerWidth() -80;
        } else if (idx == (container.children().length-1) / 2) {
          var offset = -80
        } else {
          var offset = 0;
        }
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

    var formatX = d3.time.format('%I %p')
    var axisX   = d3.svg.axis()
                    .scale(X)
                    .orient('bottom')
                    .tickSize(1)
                    .ticks(d3.time.hours)
                    .tickFormat(function(d,i) {
                      // if(i === 0) return
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
      if (!values) return
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
      if (!data) return
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
      var emptydata = _.map(data, function(d) { return _emptyData(d) })
      var lastIdx = d3.min(emptydata, function(d) {return d.values.length})
      emptydata = _.map(_(emptydata).groupBy('key').mapValues(function(d){ return d[0].values.slice(0, lastIdx) }).value(), function(v,k) { return { key:k, values:v } })
      emptydata = stack(emptydata)

      // -------- DATA MAP ---------
      var emptyValues  = _(emptydata).groupBy('key').mapValues(function(d){ return d[0].values }).merge().values().flatten().value()
      var emptyTotData = _(emptyValues).groupBy('h').map(function(d){ return { h:d[0].h, v:_.sumBy(d,'v') } }).value()
      var max = 0
      // update scales domain and range
      if (_.isEmpty(data)) return
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
      data = _.orderBy(data, 'key')
      var lastIdx = data? d3.min(data, function(d) {return d.values.length}) : 0
      data = _.map(_(data).groupBy('key').mapValues(function(d){ return d[0].values.slice(0, lastIdx) }).value(), function(v,k) { return { key:k, values:v } })
      data = stack(data)

      // -------- DATA MAP ---------
      var values  = _(data).groupBy('key').mapValues(function(d){ return d[0].values }).merge().values().flatten().value()
      var totData = _(values).groupBy('h').map(function(d){ return { h:d[0].h, v:_.sumBy(d,'v') } }).value()
      if (_.isEmpty(totData)) return
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
  var init = function(el, team_standings, season) {
    var seasonTotalRaces = season.races
    var seasonCurrentRace = season.current

    var $el = $(el)
    var team_standings_desc = team_standings.sort(function(a, b) { return Number(b.totalPoints) - Number(a.totalPoints) });

    var bar_width = $(el).find('.bar_container').width()
    var point_width = 100 / team_standings[0].totalPoints //percent
    var point_px_width = bar_width/team_standings[0].totalPoints //pixels
    var icon_width = 20;

    var pointClasses = { 25:'place_1', 18:'place_2', 15:'place_3', 12:'place_4', 10:'place_5', 8:'place_6', 6:'place_7', 4:'place_8', 2:'place_9', 1:'place_10' }

    $el.find('ul#chart_standings_wrap').html('');
    team_standings.forEach(function(team) {
    	var $list = '<li class="team_standing">';
    	$list +=	'<div class="team_name">'+team.teamName+'</div>';
    	$list +=	'<div class="bar_container">';
    	$list +=	'<div class="bar" style="width:0%">';
    	$list +=		'<div class="bar_points">'+team.totalPoints+'pt</div>';

      team.races.forEach(function(race) {
        var pt = +race.RacePoints
        var extraBar = ''
        if (race.PolePosition) {
          extraBar += '<div class="bar_segment pole_position" style="width:'+3*point_px_width+'px"></div>'
          pt -= 3
        }
        if (race.FastestLap) {
          extraBar += '<div class="bar_segment fastest_lap" style="width:'+1*point_px_width+'px"></div>'
          pt -= 1
        }

        if (pt > 0) {
          var icon_class = pointClasses[pt]
      		if (pt*point_px_width < icon_width) { icon_class += ' no_bg' }
          $list += '<div class="bar_segment '+icon_class+'" style="width:'+pt*point_px_width+'px"></div>';
        }
    		$list += extraBar
    	})
    	$list +=	'</div></div></li>';
    	$el.find('ul#chart_standings_wrap').append($list);
    })

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
          $(e).css('width', team_standings[i].totalPoints*point_width + '%')
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


    var init = function(el, season){

      var svg
      var defs
      var ids = ['#first', '#second', '#third', '#fourth']
      var w
      var h

      var xmlPath = '../js/components/teamSankey/teamSankey_'+season.id+'.svg'

    	d3.xml(xmlPath, function(xml){

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
        snippets: ['itGeoTerm', 'it3sun', 'circuitTemplate','enelXMobility', 'motorsport']
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
        translateLabel: 'ctrlroom_comparison_house',
        param: 1/(2100/365),
        unit: '',
        translateUnitLabel: '',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_house'
      },
      'TV': {
        label: 'Watching TV 24/7',
        translateLabel: 'ctrlroom_comparison_tv',
        param: 1/0.07/24/30/12,
        unit: 'years',
        translateUnitLabel: 'ctrlroom_comparison_unit',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_tv'
      },
      'eVehicle': {
        label: 'E-vehicle autonomy',
        translateLabel: 'ctrlroom_comparison_evehicle',
        param: 6.25,
        unit: 'km',
        translateUnitLabel: '',
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
  function ContructorForModelsSrv($rootScope, $http, $q, beUrl) {
    var self = this

    var _totalConsumptionData   = null
    var _timeSeriesData         = {}
    var _metersData             = {}
    // var enelStandMeter = 'Smart_Kit2_FE_043'
    // var denStorageMeter = 'Den_Api_FE_001'
    var garageMeter = 'Computed_Meter_001'

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
      return _totalConsumptionData ? $q.resolve(_totalConsumptionData) : _updateTotal()
    }
    function _getTimeSeries(zone_name) {
      var zone = zone_name || 'circuit'
      return _timeSeriesData[zone] ? $q.resolve(_timeSeriesData[zone]) : _updateTimeSeries(zone_name)
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
                     _getMeter(garageMeter),
                     // _getMeter(enelStandMeter),
                     // _getMeter(denStorageMeter),
                     // _getMeterTimeSeries(denStorageMeter)
                    ])
               .then(
                  function(res) {
                    return {
                      totalConsumption: _totalConsumptionData,
                      streamData:       _timeSeriesData['circuit'],
                      streamPaddock:    _timeSeriesData['paddock'],
                      metersData:       _metersData
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
                     _updateMeter(garageMeter),
                     // _updateMeter(enelStandMeter),
                     // _updateMeter(denStorageMeter),
                     // _updateMeterTimeSeries(denStorageMeter)
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
    .value('showcaseRace', {id: 'r7'})

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

    function mainCtrl($rootScope, $scope, $state, $stateParams, $translate) {
      $scope.menuOpen = false
      $scope.loading = $rootScope.loading
      $scope.languages = $translate.getAvailableLanguageKeys() || []
      if ($scope.languages.length <= 1) $scope.languages = []

      $('#app-menu').css({visibility: 'visible'})

      $scope.current_page_translate_label = 'menu_ctrlroom_title'
      $scope.setActiveHeader = function(label) {
        $scope.current_page_translate_label = label
      }

      $scope.toggleMenu = function() {
        $scope.menuOpen = !$scope.menuOpen
        $('#ham').toggleClass('close')
        $('header h4').toggleClass('visible')
      }

      $scope.goTo = function(stateName, params) {
        params = params || {}
        if (!params.lang) params.lang = $translate.use()
        $state.go(stateName, params, {reload: true, notify: true})
        $scope.toggleMenu()
      }

      $scope.changeLanguage = function(key){
        var params = angular.extend($stateParams, {lang: key})
        $translate.use(key).then(function() { $scope.goTo($state.current.name, params) })
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
        // $location.replace().path(normalized)
      }
    })

    var defaultLang = $translateProvider.preferredLanguage()
    $urlRouterProvider.when('', '/'+defaultLang+'/landing')
    $urlRouterProvider.when('/', '/'+defaultLang+'/landing')
    $urlRouterProvider.when('/landing', '/'+defaultLang+'/landing/')
    $urlRouterProvider.when('/landing-mobile', '/'+defaultLang+'/landing-mobile/')
    $urlRouterProvider.when('/dashboard', '/'+defaultLang+'/dashboard')
    $urlRouterProvider.when('/formulae', '/'+defaultLang+'/formulae')
    $urlRouterProvider.otherwise('/'+defaultLang+'/landing')

    // refactor wip
    var liveRace = null

    $stateProvider
      // .state('404', {
      //   url: '/404',
      //   templateUrl: 'templates/404.html'
      // })
      .state('3dtest', {
        url: '/:lang/3dtest',
        templateUrl: 'templates/3dtest.html',
        controller: '3dCtrl'
      })
      .state('cardtest', {
        url: '/:lang/cardtest',
        templateUrl: 'templates/cardtest.html',
        controller: 'CardCtrl',
        controllerAs: 'cards'
      })
      .state('streamtest', {
        url: '/:lang/streamtest',
        templateUrl: 'templates/streamtest.html',
        controller: 'StreamCtrl',
        controllerAs: 'stream',
        resolve: {
          races: function(RacesSrv) {
            return RacesSrv.getRaces()
                           .then(function(res) { return _.filter(res, 'past') })
          },
          liveData: function(RacesSrv, races, currentSeason) {
            var selectedRace = _.last(races)
            return RacesSrv.getRaceData(currentSeason, selectedRace)
                           .then(function (res) { return _.assign(selectedRace, res) })
          }
        }
      })
      .state('landing', {
        url: '/:lang/landing',
        resolve: {
          showcaseRace: function(RacesSrv, currentSeason, showcaseRace) {
            return RacesSrv.getRaceWithData(currentSeason, showcaseRace)
          }
        },
        controller: 'LandingCtrl',
        controllerAs: 'landing',
        templateUrl: 'templates/landing.html',
        onEnter: function(isMobile, $state, $stateParams) {
          if (isMobile) return $state.go('landingMobile', {lang: $stateParams.lang}, {reload: true})
        },
        onExit: function($rootScope, $window, $timeout) {
          $rootScope.forceReload = true
          $timeout(function() { $window.location.reload() }, 300)
        }
      })
      .state('landingMobile', {
        url: '/:lang/landing-mobile/:tourKey/:snippetKey',
        params: {
          lang: {squash: true},
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
        url: '/:lang/dashboard',
        resolve: {
          seasons: function(RacesSrv) {
            return RacesSrv.getSeasons()
          },
          currentSeason: function(RacesSrv) {
            return RacesSrv.getCurrentSeason()
          },
          showcaseRace: function(RacesSrv, currentSeason, showcaseRace) {
            return RacesSrv.getRace(currentSeason, showcaseRace)
          },
          races: function(RacesSrv, showcaseRace) {
            return RacesSrv.getRaces()
                           .then(function(res) {
                             var history = _.reject(res, 'future')
                             return _.unionBy(history, [showcaseRace], 'id')
                           }, function(err) {
                            console.error(err)
                            return []
                           })
          },
          liveData: function(RacesSrv, ModelSrv, races, currentSeason) {
            var selectedRace = _.findLast(races, function(r) { return !r.future })
            return RacesSrv.getRaceData(currentSeason, selectedRace)
                           .then(function (res) {
                              if (!_.isEmpty(res)) return _.assign(selectedRace, res)
                              return ModelSrv.getAllModels()
                                      .then(function(res) {
                                        console.log(res)
                                        return _.assign(selectedRace, res)
                                      }, function (err) { console.error(err) })
                           }, function (err) { console.error(err) })
          }
        },
        controller: 'DashboardCtrl',
        controllerAs: 'dashboard',
        templateUrl: 'templates/dashboard.html'
      })
      .state('formulae', {
        url: '/:lang/formulae',
        params: {
          lang: {squash: true},
          season: {squash: true, value: null}
        },
        resolve: {
          seasons: function(RacesSrv) {
            return RacesSrv.getSeasons()
          },
          currentSeason: function(currentSeason, $stateParams) {
            return $stateParams.season? $stateParams.season : currentSeason
          },
          races: function(RacesSrv, currentSeason) {
            return RacesSrv.getRaces(currentSeason)
                           .then(function(res) {
                             currentSeason.races = res.length
                             currentSeason.current = _.findLastIndex(res, { past: true }) +1
                             return
                           })
          },
          teams: function($http, currentSeason) {
            return $http.get('../assets/jsonData/'+currentSeason.id+'/teams.json')
                        .then(function(res) {
                          return res.data.teams
                        }, function(err) {
                          console.error(err)
                        })
          },
          drivetrains: function($http, currentSeason) {
            return $http.get('../assets/jsonData/'+currentSeason.id+'/drivetrains.json')
                        .then(function(res) {
                          return res.data.drivetrains
                        }, function(err) {
                          console.error(err)
                        })
          },
          standings: function($http, _, currentSeason, teams) {
            return $http.get('../assets/jsonData/'+currentSeason.id+'/teams_standings.json')
                        .then(function(res) {
                          if (_.isEmpty(res.data)) {
                            return _.map(teams,function(t) {
                              return {teamName:t.name, totalPoints:0, races:[] }
                            })
                          }
                          var standings = res.data.SerieData.ChampionshipStanding.ChampionshipData.Standings
                          return _(standings)
                                  .groupBy('TeamName')
                                  .map(function(o, k) {
                                    var obj = { teamName: k, totalPoints: 0, races: [] }
                                    _.each(o, function(oo) {
                                      obj.totalPoints += _.sumBy(oo.Races.Race, function(o) {return +o.RacePoints})
                                      obj.races = _.sortBy(obj.races.concat(oo.Races.Race),'RaceId')
                                    })
                                    return obj
                                  }).values()
                                  .orderBy('totalPoints','desc').value()
                        }, function(err) {
                          console.error(err)
                          return _.map(teams,function(t) {
                            return {teamName:t.name, totalPoints:0, pos:0, races:[] }
                          })
                        })
          }
        },
        controller: 'FormulaeCtrl',
        controllerAs: 'formulae',
        templateUrl: 'templates/formulae.html'
      })
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('LandingCtrl', landingCtrl)

  /* @ngInject */
  function landingCtrl ($rootScope, $scope, $window, $http, $state, $timeout, $interval, _, SnippetSrv, TweenMax, GA, ModelSrv, showcaseRace) {
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

    vm.showcaseRace = showcaseRace
    vm.totalConsumption = showcaseRace.totalConsumption
    if (!vm.showcaseRace.future && !vm.totalConsumption) getLiveData()
    if (vm.showcaseRace.live) $scope.$on('ModelSrv::ALL-MODELS-UPDATED', getLiveData)

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

      if ($scope.webgl) init()
      else $timeout(function() { $rootScope.hideLoader() }, 3000)

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
      return ModelSrv.getTotal()
                     .then(function(res) {
                        console.info(res)
                        vm.totalConsumption = {
                          total_power: res.total_power || 0,
                          total_energy: res.total_energy || 0
                        }
                        return
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
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(33%)'})
        break
        case 3:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(65%)'})
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
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(33%)'})
        break
        case 3:
          $('#landing > section .zoom #navSelected').css({transform: 'translateY(65%)'})
        break
        default: return
      }
      if (!FEScene) return
      $scope.closeCarousel();
      $scope.currentStage = zoom
      GA.trackLandingFrag(labelStages[$scope.currentStage])
      FEScene.startStageAnimation($scope.currentStage)
    }

    $scope.tours = ['E-mobility','Smart Energy','Clean Energy','Enel achievements']
    var tour = $('#tour-menu')

    var currentPin = null
    function selectedHotspot(key) {
      if (!FEScene) return
      if (!key || key === 'World' || vm.currentTour) return
      if (key === currentPin) return $scope.closeCarousel()
      currentPin = key
      var hotspot = SnippetSrv.getHotspot(key);
      vm.snippets = _.reverse(hotspot.snippets)

      if (!$scope.$$phase) $scope.$digest()
    }

    function setCurrentTour(tour, $index) {
      if (!FEScene) return
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
    var displacement = 1;
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
		      FEScene.movePins(-displacement, 0, 0);
        }

        if (event.key === 'd') {
          FEScene.movePins(displacement, 0, 0);
        }

        if (event.key === 'w') {
          FEScene.movePins(0, displacement, 0);
        }

        if (event.key === 's') {
          FEScene.movePins(0, -displacement, 0);
        }

        if (event.key === 'e') {
          //FEScene.startCameraAnimation([2, 3, -3], 2)
		      FEScene.movePins(0, 0, displacement);
        }

        if (event.key === 'q') {
          FEScene.movePins(0, 0, -displacement);
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
    .controller('CardCtrl', cardCtrl)

  /* @ngInject */
  function cardCtrl ($scope, $rootScope, SnippetSrv) {
    var vm = this
    $rootScope.hideLoader()

    vm.snippets = SnippetSrv.getHotspot('test').snippets
    if (!$scope.$$phase) $scope.$digest()

    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }
}(window.angular));

(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('StreamCtrl', streamCtrl)

  /* @ngInject */
  function streamCtrl ($scope, $rootScope, $interval, liveData) {
    var vm = this
    $rootScope.hideLoader()

    vm.selectedRace = liveData
    vm.streamData = angular.copy(vm.selectedRace.streamData.zones)
    vm.selectedRace.replay = false
    vm.replayIdx = d3.min(vm.streamData, function(d) { return d.values.length })

    $scope.toggleLive = function() {
      vm.selectedRace.replay = true
      vm.selectedRace.live = !vm.selectedRace.live
      vm.streamData = angular.copy(vm.selectedRace.streamData.zones)
      if (!$scope.$$phase) $scope.$digest()
    }

    var interval = null
    $scope.replay = function() {
      if (interval) {
        console.log('stop replay')
        $interval.cancel(interval)
        return interval = null
      }
      vm.selectedRace.replay = true
      var topIdx = d3.min(vm.streamData, function(d) { return d.values.length })
      var replayIdx = 0
      interval = $interval(function() {
        vm.streamData = _.map(vm.selectedRace.streamData.zones, function(d) {
          var r = angular.copy(d)
          r.values = _.take(d.values, replayIdx)
          return r
        })
        if (replayIdx < topIdx) replayIdx+=3
        else {
          console.log('stop replay')
          $interval.cancel(interval)
          interval = null
        }
        if (!$scope.$$phase) $scope.$digest()
      }, 100, false)
    }

    $scope.replay2 = function() {
      vm.selectedRace.replay = false
      vm.streamData = angular.copy(vm.selectedRace.streamData.zones)
      if (!$scope.$$phase) $scope.$digest()
    }

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
  function dashboardCtrl ($rootScope, $scope, $window, $http, $timeout, $interval, _,
                          ComparisonSrv, ModelSrv, RacesSrv, seasons, races, liveData, showcaseRace, currentSeason) {
    var vm = this

    $scope.setActiveHeader('menu_ctrlroom_header')
    angular.element(document).ready($rootScope.hideLoader)

    vm.seasons = []
    // races
    vm.races = []
    vm.currentRace = {}
    vm.streamData = []
    vm.streamDap = 0
    vm.streamPaddock = []
    vm.streamDen = []
    $scope.allData = []
    $scope.allDendata = []
    $scope.paddockData = {
      power: 0,
      energy: 0
    }
    var enelMeterKey = 'Smart_Kit2_FE_043'
    var denMeterKey = 'Den_Api_FE_001'
    var garageMeterKey = 'Computed_Meter_001'
    vm.metersData = null
    vm.enelMeterStandData = null
    vm.garageMeterData = null
    vm.totalConsumption = {
      total_energy: 0,
      total_power: 0,
      zones: []
    }
    vm.mixes = []
    vm.selectedKey = null
    $scope.selectAll = selectAll
    $scope.select = select
    $scope.currentAreaShown = 'all'

    vm.seasons = seasons
    vm.races = races
    if (vm.races.length <= 3) $('div.races-list-wrap > ul').css('justify-content','left')
    vm.currentSeason = _.last(vm.seasons)

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

    $scope.selectSeason = function(id) {
      var selectedSeason = _.find(vm.seasons, {id: id})
      return RacesSrv.getRaces(selectedSeason)
                      .then(function(res) {
                        vm.races = _.reject(res, 'future')
                        if (selectedSeason.id === currentSeason.id) vm.races = _.unionBy(vm.races, [showcaseRace], 'id')
                        var selectedRace = _.findLast(vm.races, function(r) { return !r.future })
                        $scope.selectRace(selectedSeason, selectedRace)
                      }, function(err) { console.error(err) })
    }

    var currentRaceIdx = null
    $scope.selectRace = function(season, race) {
      return RacesSrv.getRaceData(season, race)
                           .then(function (res) {
                              if (!_.isEmpty(res)) {
                                race = _.assign(race, res)
                                return $scope.showRace(season, race)
                              }
                              return ModelSrv.getAllModels()
                                      .then(function(res) {
                                        console.log(res)
                                        race = _.assign(race, res)
                                        return $scope.showRace(season, race)
                                      }, function (err) { console.error(err) })
                           }, function (err) { console.error(err) })
    }
    $scope.showRace = function(season, race) {
      if ($scope.replayInterval) {
        console.log('stop replay')
        $interval.cancel($scope.replayInterval)
        $scope.replayInterval = null
      }
      vm.currentSeason = season
      if (!_.isEmpty(vm.streamPaddock)) emptyAll()
      vm.currentRace = angular.copy(race)
      vm.currentRace.replay = false
      if (_.isEmpty(vm.currentRace)) return
      vm.streamData = vm.currentRace.streamData? angular.copy(vm.currentRace.streamData.zones) : []
      vm.streamDap = vm.currentRace.streamData? angular.copy(vm.currentRace.streamData.total_availability) : 0
      vm.streamPaddock = vm.currentRace.streamPaddock? angular.copy(vm.currentRace.streamPaddock.zones) : []
      $scope.paddockData = _.find(vm.totalConsumption.zones, {name: 'Paddock'}) || { power: 0 }
      vm.totalConsumption = angular.copy(vm.currentRace.totalConsumption) || { total_energy: 0, total_power: 0, zones: [] }
      vm.mixes = vm.currentRace.mix? vm.currentRace.mix : []
      if (!_.isEmpty(vm.mixes)) {
        vm.mixes[0].translateLabel = 'ctrlroom_mix_clean'
        vm.mixes[1].translateLabel = 'ctrlroom_mix_temp'
        vm.mixes[2].translateLabel = 'ctrlroom_mix_grid'
      }
      vm.metersData = vm.currentRace.metersData? vm.currentRace.metersData : null
      if (vm.currentRace.metersData) {
        var firstMeterFound = _.keys(vm.metersData)[0]
        vm.enelMeterStandData = !_.isEmpty(vm.metersData[enelMeterKey])? vm.metersData[enelMeterKey] : vm.metersData[firstMeterFound]
        if (!vm.enelMeterStandData) vm.enelMeterStandData = { energy: 0, power: 0 }
        vm.denMeterData = !_.isEmpty(vm.metersData[denMeterKey])? vm.metersData[denMeterKey] : null
        vm.streamDen = vm.denMeterData && vm.currentRace.streamDen? angular.copy(vm.currentRace.streamDen.zones) : []
        vm.garageMeterData = !_.isEmpty(vm.metersData[garageMeterKey])? vm.metersData[garageMeterKey] : null
      } else {
        vm.denMeterData = null
        vm.garageMeterData = null
      }

      var newRaceIdx = _.indexOf(vm.races, vm.currentRace)
      var raceList = $('.races-list > .races-list-wrap')
      var offRX = newRaceIdx >= vm.races.length-3? '0' : '225'
      if (bowser.mobile) offRX = newRaceIdx == vm.races.length-1? '0' : '50'
      // TweenMax.to(raceList, .5, {scrollTo:{x:"#"+vm.currentRace.id, offsetX: offRX}})
      $timeout(function(){ raceList.scrollLeft($('#'+vm.currentRace.id).offset().left - offRX)}, 1000)
      if (!$scope.$$phase) $scope.$digest()
      currentRaceIdx = newRaceIdx
      $scope.getComparisons()
      if (_.isEmpty(vm.currentRace.totalConsumption)) {
        $scope.paddockData = { power: 0, energy: 0 }
        return
      }
      $timeout(selectAll, 1000)
      $timeout(function() {
        cleanMixHandler()
        mixHandler()
      }, 1000)
      $timeout(function() {
        cleanBalanceHandler()
        balanceHandler()
      }, 1000)
    }
    $scope.showRace(vm.currentSeason, liveData)

    function checkMQ() {
      return $window.matchMedia("(max-width: 52em)").matches
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
      hammerBalance = null
      currentBalanceIdx = 1
    }

    var currentMixIdx = 1
    $scope.selectMix = function(id) {
      if (!bowser.mobile && !bowser.tablet) return
      if (!checkMQ()) return
      var mixList = $('#energy_mix > ul').find('li')
      if (id >= mixList.length || id < 0) return
      TweenMax.to(mixList, .5, {x: '+=' + (currentMixIdx-id)*100 + '%'})
      if (!$scope.$$phase) $scope.$digest()
      currentMixIdx = id
    }
    var hammerMix = null
    function mixHandler() {
      if (!bowser.mobile && !bowser.tablet) return
      if (_.isEmpty(vm.mixes)) return
      hammerMix = new Hammer($('#energy_mix > ul').get(0), {domEvents: true});
      hammerMix.on('swipeleft', function(e){ $scope.selectMix(currentMixIdx+1) });
      hammerMix.on('swiperight', function(e){ $scope.selectMix(currentMixIdx-1) });
    }
    function cleanMixHandler() {
      if (!hammerMix) return
      hammerMix.off('swipeleft')
      hammerMix.off('swiperight')
      hammerMix = null
      currentMixIdx = 1
    }

    $scope.loadPercentage = function(zone, label, idx) {
      var percentage = zone[label]/vm.totalConsumption['total_'+label]*100
      var percSel = $('#dashboard #balance .zone_balance .percentage-bar').get(idx)
      TweenMax.to(percSel, .5, {width: percentage+'%'})
      return percentage
    }

    balanceHandler()
    angular.element(document).ready(mixHandler)

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

    $scope.replayInterval = null
    $scope.replayTime = null
    var replayPaused = false
    $scope.replayStream = function() {
      if ($scope.replayInterval) return $scope.pauseReplay()
      vm.currentRace.replay = true
      var topIdx = d3.min(vm.currentRace.streamData.zones, function(d) { return d.values.length })
      var replayIdx = 0
      if (replayPaused) replayIdx = d3.min(vm.streamData, function(d) { return d.values.length })
      replayPaused = false
      console.time('streamgraphReplay')
      $scope.replayInterval = $interval(function() {
        vm.streamData = _.map(vm.currentRace.streamData.zones, function(d) {
          var r = angular.copy(d)
          r.values = _.take(d.values, replayIdx)
          if (_.last(r.values)) $scope.replayTime = _.last(r.values).h
          return r
        })
        if (replayIdx >= topIdx) return $scope.stopReplay()
        replayIdx+=1
        if (!$scope.$$phase) $scope.$digest()
      }, 100)
    }
    $scope.stopReplay = function() {
      console.log('stop replay')
      console.timeEnd('streamgraphReplay')
      $interval.cancel($scope.replayInterval)
      $scope.replayInterval = null
      replayPaused = false
    }
    $scope.pauseReplay = function() {
      console.log('pause replay')
      $interval.cancel($scope.replayInterval)
      $scope.replayInterval = null
      replayPaused = true
    }

    // event handlers
    $scope.getLiveData = function() {
      return ModelSrv.getAllModels()
                     .then(function(res) {
                        console.info(res)
                        if (vm.currentRace.live) {
                          if (!_.isEmpty(vm.streamPaddock)) emptyAll()
                          vm.streamData         = res.streamData.zones
                          vm.streamDap          = res.streamData.total_availability
                          vm.streamPaddock      = res.streamPaddock.zones
                          vm.totalConsumption   = res.totalConsumption
                          vm.metersData         = res.metersData
                          // vm.enelMeterStandData = currentRace.metersData[enelMeterKey]
                          // vm.denMeterData       = currentRace.metersData[denMeterKey]
                          // vm.streamDen          = res.timeSeries[denMeterKey].zones
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
  function formulaeCtrl ($rootScope, $scope, $timeout, $state, $stateParams, seasons, currentSeason, teams, drivetrains, standings) {
    var vm = this

    // $('header h4').text('More about the Formula E season')
    $scope.setActiveHeader('menu_formulae_title')
    angular.element(document).ready($rootScope.hideLoader)

    vm.seasons = seasons
    vm.currentSeason = currentSeason
    $scope.selectSeason = function(id) {
      var seasonIdx = _.findIndex(vm.seasons, {id: id})
      if (seasonIdx < 0) return
      vm.currentSeason = vm.seasons[seasonIdx]
      var params = angular.extend($stateParams, {season: vm.currentSeason})
      $state.go($state.current.name, params, {reload: true, notify: true})
    }

    if (_.isEmpty(teams)) return
    $scope.teams = teams
    $scope.currentTeam = null
    $scope.teamSelected = false

    if (_.isEmpty(drivetrains)) return
    $scope.drivetrains = drivetrains
    $scope.currentDrive = drivetrains.idle

    if (_.isEmpty(standings)) return
    $scope.standings = standings
    console.log(standings)

    var standings = new standingsChart('#chart_standings', $scope.standings, vm.currentSeason)
    var drivetrainsChart = new teamSankey('#chart_drivetrains', vm.currentSeason)

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