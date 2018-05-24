(function (angular) {
  'use strict'

  angular
    .module('MainApp')
    .service('GA', ContructorForGA)

  /* @ngInject */
  function ContructorForGA ($rootScope, $interval, $timeout) {
    console.log('ContructorForGA')

    ga('create', 'UA-7954920-14', 'auto')
    ga('set', 'anonymizeIp', true)
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
