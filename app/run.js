(function (angular) {
  'use strict'

  /**
    Run configurations for WebApp
  **/

  angular
    .module('WebApp')
    .run(RunWebApp)

  /* @ngInject */
  function RunWebApp(later, ModelSrv) {

    // var schedule = later.parse.cron('4,9,14,19,24,29,34,39,44,49,54,59 * * * *')
    // var scheduleTime = 30 +' seconds' // test
    var scheduleTime = 5 +' minutes'
    var schedule = later.parse.text('every '+ scheduleTime)
    console.info("Setting schedule: ", schedule)
    console.info("Schedule runs every: ", scheduleTime)
    function modelsUpdate() {
      console.info('SCHEDULE:::run model update:::')
      return ModelSrv.updateAllModels()
    }
    later.setInterval(modelsUpdate, schedule)
  }

}(window.angular));
