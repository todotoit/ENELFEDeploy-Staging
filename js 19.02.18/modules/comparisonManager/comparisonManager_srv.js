(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('ComparisonManager')
    .service('ComparisonSrv', ContructorForComparisonSrv)

  /* @ngInject */
  function ContructorForComparisonSrv($q, _) {
    var self  = this
    self.path = '../js/modules/comparisonManager/templates'
    var comparisons = {
      'households': {
        label: 'Households for 1 day',
        param: 1/(4190/365),
        unit: '',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_house'
      },
      'TV': {
        label: 'Watching TV 24/7',
        param: 1/0.07/24/30/12,
        unit: 'years',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_lcd'
      },
      'eVehicle': {
        label: 'E-vehicle autonomy',
        param: 6.25,
        unit: 'km',
        tpl: self.path + '/test.html',
        svg: 'dash_comparison_car'
      }
      
    }

    self.getComparisons = _getComparisonsForValue
    return self

    // -------

    function _getComparisonsForValue(val) {
      return $q(function(resolve, reject) {
        var snippets = _.map(comparisons, function(obj, key) {
          obj.key = key
          obj.value = Math.round(val*obj.param*10)/10
          return obj
        })
        if (!_.isEmpty(snippets)) resolve(snippets)
        else reject('No available snippets are defined!')
      })
    }

  }

}(window.angular));
