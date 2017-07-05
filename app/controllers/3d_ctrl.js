(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('3dCtrl', tredCtrl)

  /* @ngInject */
  function tredCtrl ($scope) {
    var vm = this
    var container = $('#3dcontainer')[0]
    var FEScene = new TERMINALIA.FEScene(container, TERMINALIA.CustomShaders);
    FEScene.render();

    //Call by ng-click
    $scope.goToStage1 = function() {
      FEScene.startStageAnimation(1);
    }

    $scope.goToStage2 = function() {
      FEScene.startStageAnimation(2);
    }

    $scope.goToStage3 = function() {
      FEScene.startStageAnimation(3);
    }
    
    window.addEventListener('resize', FEScene.resize, false);
    window.addEventListener('click', FEScene.findObjectOnClick, false);
    window.addEventListener('keydown', function(event) {

        if (event.key === '1') {
          FEScene.startStageAnimation(1);
        }

        if (event.key === '2') {
          FEScene.startStageAnimation(2);
        }1

        if (event.key === '3') {
          FEScene.startStageAnimation(3);
        }

		/*
        if (event.key === 'a') {
          FEScene.getCameraPosition();
        }

        if (event.key === 'q') {
          FEScene.startCameraAnimation([2, 1, 3], 2);
        }
		*/

        if (event.key === 'a') {
          //FEScene.startCameraAnimation([3, 3, 0.8], 2);
		      FEScene.movePins(-0.01, 0, 0);
        }

        if (event.key === 'd') {
          FEScene.movePins(0.01, 0, 0);
        }

        if (event.key === 'w') {
          FEScene.movePins(0, 0.01, 0);
        }

        if (event.key === 's') {
          FEScene.movePins(0, -0.01, 0);
        }

        if (event.key === 'e') {
          //FEScene.startCameraAnimation([2, 3, -3], 2)
		      FEScene.movePins(0, 0, 0.01);
        }

        if (event.key === 'q') {
          FEScene.movePins(0, 0, -0.01);
        }

        if (event.key === 't') {
          FEScene.getCameraPosition();
        }

        if (event.key === 'y') {
          FEScene.getWorldRotation();
        }

        if (event.key === 'z') {
          FEScene.highlightPin('StageStart', 'pin_1_electricity');
        }

        if (event.key === 'x') {
          FEScene.highlightPin('StageFinal', 'pin_3_v2g');
          FEScene.highlightPin('StageCircuit', 'pin_2_grid');
        }

        if (event.key === 'c') {
          FEScene.highlightPin('StageFinal', 'pin_3_v2g');
        }
    });

    //DISABLE SCROLL
    var firstMove
    window.addEventListener('touchstart', function (e) {
      firstMove = true
    }, { passive: false })

    window.addEventListener('touchend', function (e) {
      firstMove = true
    }, { passive: false })

    window.addEventListener('touchmove', function (e) {
      if (firstMove) {
        e.preventDefault()
        firstMove = false
      }
    }, { passive: false })
    // deregister event handlers
    // $scope.$on('$destroy', function () {})
  }
}(window.angular));
