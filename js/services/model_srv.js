(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('MainApp')
    .service('ModelSrv', ContructorForModelsSrv)

  /* @ngInject */
  function ContructorForModelsSrv($rootScope, $http, $q) {
    var self = this

    var _totalConsumptionData   = null
    var _timeSeriesData         = {}
    var _metersData             = {}
    var enelStandMeter = 'Smart_Kit_BE_001'
    var denStorageMeter = 'Den_Api_FE_001'

    var beUrl = 'http://backend.enelformulae.todo.to.it'
    // var beUrl = 'http://192.168.3.10:5001'

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
      return _totalConsumptionData || _updateTotal()
    }
    function _getTimeSeries(zone_name) {
      var zone = zone_name || 'circuit'
      return _timeSeriesData[zone] || _updateTimeSeries(zone_name)
    }
    function _getMeter(meter_name) {
      if (!meter_name) return console.error('Error::Meter name could not be empty')
      return _metersData[meter_name] || _updateMeter(meter_name)
    }
    function _getAll() {
      return $q.all([_getTotal(), _getTimeSeries(), _getTimeSeries('paddock'), _getMeter(enelStandMeter), _getMeter(denStorageMeter)])
               .then(
                  function(res) {
                    return {
                      totalConsumption: _totalConsumptionData,
                      timeSeries:       _timeSeriesData,
                      meters:           _metersData
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
    function _updateAll() {
      return $q.all([_updateTotal(), _updateTimeSeries(), _updateTimeSeries('paddock'), _updateMeter(enelStandMeter), _updateMeter(denStorageMeter)])
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
