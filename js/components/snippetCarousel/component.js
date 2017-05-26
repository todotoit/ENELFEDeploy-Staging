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
        onCardSelect: '&'
      }
    })

  /* @ngInject */
  function SnippetCarouselCtrl($scope, $element, $attrs, $timeout, _) {
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
    var card = null
    var $card = null
    var $cards = []
    var callback = null

    $scope.prev = function () {
      if (debounce.id) return
      debounce.start()
      direction = 'left'
      moveCards(direction)
    }

    $scope.next = function () {
      if (debounce.id) return
      debounce.start()
      direction = 'right'
      moveCards(direction)
    }

    $scope.loadCard = function() {
      var el = $element.children('snippet-card')[this.$index]
      setCardPos(el, this.$index)
      $cards.push(el)
      // last card is loaded
      if ($cards.length === $scope.snippets.length) selectCards()
    }

    var showcaseElements = 3
    var xSet = 50
    var ySet = 50
    var xOffset = 0
    var yOffset = 14
    var zOffset = 250
    var opacitySet = 1
    var opacityOffset = .15

    function setCardPos($el, $i) {
      var base = $scope.snippets.length -1 -$i
      var opacity = opacitySet -(base * opacityOffset)
      if ($i < $scope.snippets.length - showcaseElements) opacity = 0
      TweenMax.set($el, { x: -(xSet+(base * xOffset)) +'%',
                          y: -(ySet+(base * yOffset)) +'%',
                          z: -(base * zOffset),
                          opacity: opacity,
                          zIndex: -base
                        }, vel/3)
    }

    // -------

    // init after dom loaded
    function init() {
      $scope.snippets = ctrl.snippets
      callback = ctrl.onCardSelect()
      if ($scope.snippets.length < showcaseElements) showcaseElements = $scope.snippets.length
    }

    function selectCards() {
      card  = _.last($scope.snippets)
      $cards = _.reverse($cards)
      $card = _.first($cards)
      if (callback) callback(card)
      cardHandler()
      debounce.cancel
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

      var x = -50, y = -50, z = 0, opacity = 1, zIndex = 0
      for (var i = 1; i < $cards.length; i++) {
        if (i > showcaseElements) opacity = 0
        TweenMax.to($cards[i], vel, {y: y+'%', z: z, opacity: opacity, zIndex: zIndex}, vel)
        y-=yOffset
        z-=zOffset
        opacity-=opacityOffset
        zIndex--
      }
      tl.set($card, {x: x+'%', y: y-yOffset+'%', z: z-zOffset, opacity: 0}, vel)
      tl.to($card, vel, {y: y+'%', z: z, opacity: opacity}, vel)
    }


    // event handlers
    function cardHandler() {
      hammertime = new Hammer($card, {domEvents: true});
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
