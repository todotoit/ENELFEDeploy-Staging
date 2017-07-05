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
    $scope.isMobile = bowser.mobile || false;
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
      // console.log($i, $scope.snippets.length, showcaseElements)
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
      console.log('out')
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
      console.log($scope.snippets)
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
      if(!bowser.mobile) cardHandler()
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
      tl.set($card, {
        x: x+'%',
        y: y-yOffset+'%',
        // z: z-zOffset,
        scale: scale-0.2,
        opacity: 0}, vel)
      tl.to($card, vel, {
        y: y+'%',
        // z: z,
        scale: scale,
        opacity: opacity}, vel)
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
        if(!bowser.mobile){
          e.stopPropagation()
          e.preventDefault()
        }
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
