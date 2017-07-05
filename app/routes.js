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
        $location.replace().path(normalized)
      }
    })

    $urlRouterProvider.when('', 'landing')
    $urlRouterProvider.when('/', 'landing')
    $urlRouterProvider.otherwise('landing')

    var liveRace = {
      "id": "r7",
      "live": true,
      "name": "Tempelhof Airport",
      "location": "Berlin",
      "country": "German",
      "date": "10 Jun 2017",
      "videoId": "",
      "circuit": {
        "map": "circuit_berlin",
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
      "meters": 20,
      "mix": [
        {
          "code": "clean",
          "name": "Clean energy",
          "value": 30
        },
        {
          "code": "temp",
          "name": "Temporary solutions",
          "value": 15
        },
        {
          "code": "grid",
          "name": "Urban grid",
          "value": 55
        }
      ],
    }

    $stateProvider
      // .state('404', {
      //   url: '/404',
      //   templateUrl: 'templates/404.html'
      // })
      .state('landing', {
        url: '/landing',
        resolve: {
          races: function($http) {
            return $http.get('../assets/jsonData/races.json')
                        .then(function(res) {
                          var races = res.data.races
                          races.push(liveRace)
                          return races
                        }, function(err) {
                          console.error(err)
                        })
          }
        },
        controller: 'LandingCtrl',
        controllerAs: 'landing',
        templateUrl: 'templates/landing.html'
      })
      .state('dashboard', {
        url: '/dashboard',
        params: {
          reload: null
        },
        onEnter: function($stateParams, $window, $timeout) {
            console.log($stateParams)
            if ($stateParams.reload) $timeout(function() {$window.location.reload()}, 500)
          },
        resolve: {
          liveData: function(ModelSrv) {
            return ModelSrv.getAllModels()
                           .then(function(res) {
                              console.info(res)
                              liveRace.streamData       = res.timeSeries.circuit
                              liveRace.streamPaddock    = res.timeSeries.paddock
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
      .state('3dtest', {
        url: '/3dtest',
        controller: '3dCtrl',
        controllerAs: 'ctrl',
        templateUrl: 'templates/3dtest.html'
      })
      .state('snipTest', {
        url: '/sniptest',
        resolve: {
          snippets: function(SnippetSrv) {
            return SnippetSrv.getAvailableSnippets()
                             .then(function(res) {
                                return res
                             }, function(err) {
                                console.error(err)
                             })
          },
          singleSnip: function(SnippetSrv) {
            return SnippetSrv.getSnippet('cleanEnergyGlobal')
                             .then(function(res) {
                                return res
                             }, function(err) {
                                console.error(err)
                             })
          }
        },
        controller: 'SnipCtrl',
        controllerAs: 'ctrl',
        templateUrl: 'templates/sniptest.html'
      })
  }
}(window.angular));
