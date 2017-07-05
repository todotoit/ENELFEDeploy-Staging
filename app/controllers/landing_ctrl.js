(function (angular) {
  'use strict'

  angular
    .module('WebApp')
    .controller('LandingCtrl', landingCtrl)

  /* @ngInject */
  function landingCtrl ($scope, $window, $http, $state, $timeout, _, SnippetSrv, TweenMax, GA, ModelSrv, races) {
    var vm = this
    vm.snippets = []
    vm.tours = SnippetSrv.getAvailableTours();
    vm.setCurrentTour = setCurrentTour
    vm.currentTour = null
    vm.isMobile = bowser.mobile || false;
    vm.snipCounter = 0;

    var FEScene = null
    var loaderTl = null;
    // Desktop only init
    if(!vm.isMobile){
      angular.element(document).ready(render)

      // races
      vm.races = races
      vm.currentRace = _.last(races)
      vm.streamData = []
      vm.totalConsumption = {}
      getLiveData()
      $scope.$on('ModelSrv::ALL-MODELS-UPDATED', getLiveData)
    }

    function render() {
      showLoader();
      $(window).on("AssetsLoaded", hideLoader)
      var $container = $('#3dcontainer')
      var container = $container.get(0)
      init()

      function init(){
        vm.snipCounter = -1;
        FEScene = new TERMINALIA.FEScene(container, TERMINALIA.CustomShaders)
        FEScene.render()
        // Events
        $(window).on('resize', FEScene.resize)
        $container.on('click', function(e){
          selectedHotspot(FEScene.findObjectOnClick(e))
        })
        $(window).on('keydown', function(event) {
          if (event.key === 't') {
            FEScene.getCameraPosition();
          }

          if (event.key === 'y') {
            FEScene.getWorldRotation();
          }
        });
      }
    }

    function getLiveData() {
      return ModelSrv.getAllModels()
                     .then(function(res) {
                        console.info(res)
                        if (vm.currentRace.live) {
                          vm.streamData       = res.timeSeries.circuit.zones
                          vm.totalConsumption = res.totalConsumption
                        }
                        return res
                     }, function(err) {
                        console.error(err)
                     })
    }

    $scope.selectRace = function(id) {
      var currentRace = _.find(vm.races, {id: id})
      vm.currentRace = angular.copy(currentRace)
      vm.streamData = angular.copy(currentRace.streamData.zones)
      vm.totalConsumption = angular.copy(currentRace.totalConsumption)
      if (!$scope.$$phase) $scope.$digest()
      console.log(vm.currentRace)
    }

    $scope.currentStage = 1
    var stages = ['StageStart', 'StageCircuit', 'StageFinal']
    $scope.checkHotSpot = function(card) {
      vm.snipCounter++
      if(vm.snipCounter > vm.snippets.length-1) vm.snipCounter = 0;
      console.log(card)

      GA.cleanFragAndLandingTrack(card.tpl, labelStages[$scope.currentStage-1])

      if (!card.hotspot) return
      FEScene.resetPinsVisibility(false)

      if (card.hotspot.stage === $scope.currentStage) return pinAnimation(card)
      $scope.currentStage = card.hotspot.stage
      FEScene.startStageAnimation(card.hotspot.stage)
      $(window).on('StageTimeLineEnded', function() {
        pinAnimation(card)
        $(window).off('StageTimeLineEnded')
      })
    }
    function pinAnimation(card) {
      FEScene.highlightPin(stages[card.hotspot.stage-1], card.hotspot.key)
      if (card.hotspot.stage !== 3) {
        FEScene.startCameraAnimation(card.hotspot.coords, 2)
      } else {
        FEScene.startWorldAnimation(card.hotspot.coords, 1)
      }
    }

    $scope.closeCarousel = function() {
      var carouselCtrl = angular.element($('snippet-carousel')).controller('snippetCarousel')
      carouselCtrl.exit(true);
      carouselCtrl.setTour(false);
      vm.snipCounter = -1;
      vm.currentTour = null
      currentPin = null
      if(FEScene) FEScene.resetPinsVisibility(true)
      if (!$scope.$$phase) $scope.$digest()
    }

    var labelStages = ['carView', 'circuitView', 'worldView']
    $scope.zoom = function(zoom) {
      $scope.closeCarousel();
      switch(zoom) {
        case '+':
          if ($scope.currentStage >= 3) return
          GA.trackLandingFrag( labelStages[$scope.currentStage] )
          FEScene.startStageAnimation(++$scope.currentStage)
        break
        case '-':
          if ($scope.currentStage <= 1) return
          GA.trackLandingFrag( labelStages[$scope.currentStage] )
          FEScene.startStageAnimation(--$scope.currentStage)
        break
        default: return
      }
    }

    $scope.tours = ['E-mobility','Smart Energy','Clean Energy','Enel achievements']
    var tour = $('#tour-menu')
    // var hammertour = new Hammer(tour[0], {domEvents: true});
    // hammertour.on('swipeleft', function(e){
    //   e.srcEvent.stopPropagation();
    //   $scope.tours.push($scope.tours[0])
    //   TweenMax.to(tour.find('li'), .5, {x: '-=100%', onComplete: function() {
    //     $scope.tours.shift()
    //     if (!$scope.$$phase) $scope.$digest()
    //     TweenMax.set(tour.find('li'), {x: '+=100%'})
    //   }})
    // });
    // hammertour.on('swiperight', function(e){
    //   e.srcEvent.stopPropagation();
    //   $scope.tours.unshift(_.last($scope.tours))
    //   TweenMax.set(tour.find('li'), {x: '-=100%'})
    //   if (!$scope.$$phase) $scope.$digest()
    //   TweenMax.to(tour.find('li'), .5, {x: '+=100%', onComplete: function() {
    //     $scope.tours = _.initial($scope.tours)
    //   }})
    // });

    var currentPin = null
    function selectedHotspot(key) {
      if (!key || key === 'World' || vm.currentTour) return
      if (key === currentPin) return $scope.closeCarousel()
      currentPin = key
      // key = key.split('pin_').pop();
      var hotspot = SnippetSrv.getHotspot(key);
      vm.snippets = _.reverse(hotspot.snippets)

      if (!$scope.$$phase) $scope.$digest()
    }

    function setCurrentTour(tour, $index){
      var carouselCtrl = angular.element($('snippet-carousel')).controller('snippetCarousel')
      carouselCtrl.setTour(true);
      vm.snipCounter = -1;
      if (vm.currentTour === tour) return $scope.closeCarousel()
      vm.currentTour = tour;
      vm.snippets = _.reverse(angular.copy(tour.snippets))
      if (!$scope.$$phase) $scope.$digest()
      // if(!vm.isMobile){
      //   var el = $('#tour-menu').children().eq($index);
      //   var pos = -el.position().left + $('#tour-wrapper').width() / 2 - el.width() / 2;
      //   console.log(pos)
      //   TweenMax.to($('#tour-menu'), .5, {scrollTo: {x: "#"+el.attr('id')}})
      // }
    }

    function showLoader(){
      // $('#loader > div').fadeIn();
      // loaderTl = new TimelineMax({repeat:-1, delay:.5, repeatDelay:.2});
      // loaderTl.set($('#car > *'), {drawSVG:"0%"})
      // loaderTl.to($('#car > *'), 1,{drawSVG:"0% 40%", ease:Power4.easeOut})
      // loaderTl.to($('#car > *'), 1,{drawSVG:"40% 100%", ease:Power4.easeOut})
      // loaderTl.to($('#car > *'), 1,{drawSVG:"100% 100%", ease:Power4.easeOut})
    }

    function hideLoader(){
      // loaderTl.stop();
      $('#loadercar').fadeOut();
    }

    $scope.gotoDashboard = function() {
      $state.go('dashboard', {reload: true})
      // $timeout(function() { $window.location.reload() }, 500)
    }

    //DISABLE SCROLL
    // if(!bowser.mobile){
    //   var firstMove
    //   window.addEventListener('touchstart', function (e) {
    //     firstMove = true
    //   }, { passive: false })

    //   window.addEventListener('touchend', function (e) {
    //     firstMove = true
    //   }, { passive: false })

    //   window.addEventListener('touchmove', function (e) {
    //     if (firstMove) {
    //       e.preventDefault()
    //       firstMove = false
    //     }
    //   }, { passive: false })
    // }
    // deregister event handlers
    $scope.$on('$destroy', function () {
      $(window).off()
    })
  }
}(window.angular));
