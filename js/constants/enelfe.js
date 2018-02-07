(function (angular) {
  'use strict'

  angular
    .module('MainApp')
    .value('beUrl', 'http://backend.enelformulae.todo.to.it')
    .value('appUrl', 'http://formulae.enel.com/app')
    .value('gameUrl', 'http://formulae.enel.com/game')
    .value('currentSeason', {id: 's4'})
    .value('showcaseRace', {id: 'r4'})

}(window.angular));
