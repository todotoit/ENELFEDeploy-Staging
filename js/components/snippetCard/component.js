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
