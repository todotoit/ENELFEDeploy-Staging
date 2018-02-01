(function (angular) {
  'use strict'

  /**
    MainApp
    translateProvider configurations for MainApp
  **/

  angular
    .module('MainApp')
    .config(AppConfig)

  /* @ngInject */
  function AppConfig($translateProvider) {
    $translateProvider.useStaticFilesLoader({
      prefix: './locales/',
      suffix: '.json'
    })
    // var availableLanguages = ['en', 'it', 'fr', 'de', 'es']
    var availableLanguages = ['en', 'it', 'es']
    $translateProvider.registerAvailableLanguageKeys(availableLanguages)
    $translateProvider.preferredLanguage(availableLanguages[0])
  }
}(window.angular));
