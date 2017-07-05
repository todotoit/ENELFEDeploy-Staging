(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('SnipCtrl', snipCtrl)

  /* @ngInject */
  function snipCtrl ($scope, snippets, singleSnip) {
    var vm = this
    vm.snippets = snippets
    $scope.currentSnip = singleSnip
    console.log($scope.currentSnip)

    //Call by ng-click

    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }
}(window.angular));
