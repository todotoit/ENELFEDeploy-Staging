(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('MainApp')
    .service('PaddockAreaChart', ContructorForPaddockAreaChart)

  /* @ngInject */
  function ContructorForPaddockAreaChart($http) {
    var self  = this
    var _data = null
    var _data1 = null
    var _data2 = null

    self.get    = _get
    self.get1    = _get1
    self.get2    = _get2
    self.update = _update
    self.update1 = _update1
    self.update2 = _update2
    return self

    // -------

    // instance methods
    function _get() {
      return _data || _update()
    }
    function _get1() {
      return _data1 || _update1()
    }
    function _get2() {
      return _data2 || _update2()
    }

    function _update() {
      return $http.get('http://backend.enelformulae.todo.to.it/graphs/areachart/paddock')
                  .then(
                    function(res) {
                      console.info(res)
                      _data = res.data
                      return _data
                    },
                    function(err) {
                      console.error(err)
                      return null
                    })
    }
    function _update1() {
      return $http.get('http://192.168.3.10:5001/graphs/stream')
                  .then(
                    function(res) {
                      console.info(res)
                      _data = res.data
                      return _data
                    },
                    function(err) {
                      console.error(err)
                      return null
                    })
    }
    function _update2() {
      return $http.get('http://192.168.3.10:5001/zoneenergyconsumption')
                  .then(
                    function(res) {
                      console.info(res)
                      _data2 = res.data
                      return _data2
                    },
                    function(err) {
                      console.error(err)
                      return null
                    })
    }
  }

}(window.angular));
