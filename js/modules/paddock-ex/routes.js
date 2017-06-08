(function (angular) {
  'use strict'

  /**
    Routing configurations for Paddock
  **/

  angular
    .module('Paddock')
    .config(RouteConfig)

  /* @ngInject */
  function RouteConfig($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('paddock', {
        url: '/paddock',
        controller: 'PaddockCtrl',
        controllerAs: 'paddock',
        resolve: {
          areaChartData: function(PaddockAreaChart) {
            return PaddockAreaChart.get()
          }
        },
        templateUrl: '../js/modules/paddock-ex/paddock.html'
      })
  }
}(window.angular));
