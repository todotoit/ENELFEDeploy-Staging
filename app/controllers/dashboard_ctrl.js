(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('DashboardCtrl', dashboardCtrl)

  /* @ngInject */
  function dashboardCtrl ($rootScope, $scope, $window, $http, $timeout, races, liveData, _, ComparisonSrv, ModelSrv) {
    var vm = this

    // races
    vm.races = []
    vm.currentRace = {}
    vm.streamData = []
    vm.streamPaddock = []
    var enelMeterKey = 'Smart_Kit2_FE_040'
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
    vm.races.push(liveData)
    var currentRace = _.last(vm.races)

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
      if (currentRace.metersData) vm.enelMeterStandData = currentRace.metersData[enelMeterKey]? currentRace.metersData[enelMeterKey] : null
      console.log(vm.metersData)
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
      $scope.alldata = vm.streamPaddock
    }

    function emptyAll() {
      var selectedData = []
      $scope.currentAreaShown = 'all'
      vm.streamPaddock.forEach(function(d){
        return selectedData.push(__emptyData(d))
      })
      $scope.alldata = selectedData
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
      $scope.alldata = selectedData
    }

    function hideLoader(){
      $('#loaderdash').fadeOut();
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

    setTimeout(hideLoader, 3000)

    // event handlers
    $scope.getLiveData = function() {
      return ModelSrv.getAllModels()
                     .then(function(res) {
                        console.info(res)
                        if (vm.currentRace.live) {
                          vm.streamData         = res.timeSeries.circuit.zones
                          vm.streamPaddock      = res.timeSeries.paddock.zones
                          vm.totalConsumption   = res.totalConsumption
                          vm.metersData         = res.metersData
                          vm.enelMeterStandData = currentRace.metersData[enelMeterKey]
                          $scope.getComparisons()
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
