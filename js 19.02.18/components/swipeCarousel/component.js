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
