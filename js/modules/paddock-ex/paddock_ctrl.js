(function (angular) {
  'use strict'

  angular
    .module('Paddock')
    .controller('PaddockCtrl', paddockCtrl)

  /* @ngInject */
  function paddockCtrl($scope, areaChartData, moment, d3) {
    var vm = this
    vm.selectedKey = null
    vm.data = areaChartData.zones

    $scope.selectAll = selectAll
    $scope.select = select

    selectAll()

    // -------

    function selectAll() {
      vm.selectedKey = null
      $scope.alldata = vm.data
    }

    function select(key){
      if (!key || key === vm.selectedKey) return selectAll()
      vm.selectedKey = key
      var selectedData = []
      vm.data.forEach(function(d){
        if (d.key === key) return selectedData.push(d)
        return selectedData.push(__emptyData(d))
      })
      $scope.alldata = selectedData
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

    // deregister event handlers
    $scope.$on('$destroy', function () {})
  }

}(window.angular));
