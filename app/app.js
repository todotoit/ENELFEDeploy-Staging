(function (angular) {
  'use strict'

  /**
    Module configuration for WebApp
  **/

  angular
    .module('WebApp', [
      'ui.router',
      'MainApp',
      'SnippetManager',
      'ComparisonManager',
      'Streamgraph',
      'DonutChart',
      'StackedAreaChart',
      'SnippetCard',
      'SnippetCarousel',
      'SwipeCarousel'
    ])

}(window.angular));
