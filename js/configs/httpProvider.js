(function (angular) {
  'use strict'

  /**
    MainApp
    httpProvider configurations for MainApp
  **/

  angular
    .module('MainApp')
    .config(AppConfig)

  /* @ngInject */
  function AppConfig($httpProvider) {

    // Is a Boolean that indicates whether or not cross-site Access-Control requests
    // should be made using credentials such as cookies or authorization headers.
    // The default is false. Set to true to send credentials in cross-site XMLHttpRequest invocations.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Requests_with_credentials
    $httpProvider.defaults.withCredentials = false
  }
}(window.angular));
