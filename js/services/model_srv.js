(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('MainApp')
    .service('ModelSrv', ContructorForModelsSrv)

  /* @ngInject */
  function ContructorForModelsSrv($rootScope, $http, $q, beUrl) {
    var self = this

    var _totalConsumptionData   = null
    var _timeSeriesData         = {}
    var _metersData             = {}
    // var enelStandMeter = 'Smart_Kit2_FE_043'
    // var denStorageMeter = 'Den_Api_FE_001'
    var garageMeter = 'Computed_Meter_001'

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
      return _totalConsumptionData ? $q.resolve(_totalConsumptionData) : _updateTotal()
    }
    function _getTimeSeries(zone_name) {
      var zone = zone_name || 'circuit'
      return _timeSeriesData[zone] ? $q.resolve(_timeSeriesData[zone]) : _updateTimeSeries(zone_name)
    }
    function _getMeter(meter_name) {
      if (!meter_name) return console.error('Error::Meter name could not be empty')
      return _metersData[meter_name] || _updateMeter(meter_name)
    }
    function _getMeterTimeSeries(meter_name) {
      if (!meter_name) return console.error('Error::Meter name could not be empty')
      return _timeSeriesData[meter_name] || _updateMeterTimeSeries(meter_name)
    }
    function _getAll() {
      return $q.all([_getTotal(),
                     _getTimeSeries(),
                     _getTimeSeries('paddock'),
                     _getMeter(garageMeter),
                     // _getMeter(enelStandMeter),
                     // _getMeter(denStorageMeter),
                     // _getMeterTimeSeries(denStorageMeter)
                    ])
               .then(
                  function(res) {
                    return {
                      totalConsumption: _totalConsumptionData,
                      streamData:       _timeSeriesData['circuit'],
                      streamPaddock:    _timeSeriesData['paddock'],
                      metersData:       _metersData
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
    function _updateMeterTimeSeries(meter_name) {
      return $http.get(beUrl + '/meter_time_series/' + (meter_name || ''))
                  .then(
                    function(res) {
                      console.info(res)
                      _timeSeriesData[meter_name] = res.data
                      return _timeSeriesData[meter_name]
                    }, function(err) {
                      console.error(err)
                      return null
                    })
    }
    function _updateAll() {
      return $q.all([_updateTotal(),
                     _updateTimeSeries(),
                     _updateTimeSeries('paddock'),
                     _updateMeter(garageMeter),
                     // _updateMeter(enelStandMeter),
                     // _updateMeter(denStorageMeter),
                     // _updateMeterTimeSeries(denStorageMeter)
                    ])
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
