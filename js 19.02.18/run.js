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