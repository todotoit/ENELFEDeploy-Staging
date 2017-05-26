(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('SnippetManager')
    .service('SnippetSrv', ContructorForSnippetSrv)

  /* @ngInject */
  function ContructorForSnippetSrv($q, _) {
    var self  = this
    self.path = '../js/modules/snippetManager/templates'
    var solarSnippetsKeys = ['mexico','panel','more']
    var ecarSnippetsKeys = ['efficiency','v2g','recharge']
    var _availableSnippets = {
      'efficiency': {
        desc: '',
        label: '',
        stage: 1,
        hotspot: [2, 1, 3],
        tpl: self.path + '/efficiency.html'
      },
      'mexico': {
        desc: 'How much energy is there in Mexican skies?',
        label: 'The power of the sun',
        stage: 3,
        tpl: self.path + '/solar25km.html'
      },
      'panel': {
        desc: 'Can you guess how much solar panels can power?',
        label: 'Solar energy for the race',
        stage: 2,
        tpl: self.path + '/solarmexico.html'
      },
      'testDouble': {
        desc: '',
        label: '',
        stage: 2,
        tpl: self.path + '/test.html',
        subContent: [
          {
            desc: '',
            label: 'Could generate',
            tpl: self.path + '/subcontents/test.html'
          },
          {
            desc: '',
            label: 'Can meet the needs of',
            tpl: self.path + '/subcontents/test2.html'
          },
          // {
          //   desc: '',
          //   label: 'Could generate label3',
          //   tpl: self.path + '/subcontents/test3.html'
          // }
        ]
      },
      'efficiency': {
        desc: '',
        label: '',
        stage: 1,
        hotspot: [2, 3, -3],
        tpl: self.path + '/efficiency.html'
      },
      'recharge': {
        desc: 'Innovation is ready to charge! Recharging e-cars is faster than you think.',
        label: 'Fast recharge',
        stage: 1,
        hotspot: [3, 3, 0.8],
        tpl: self.path + '/fastrecharge.html'
      },
      'v2g': {
        desc: 'What if electricity could move around as freely as you do in your car? Soon, it will.',
        label: 'A battery on wheels',
        stage: 3,
        tpl: self.path + '/v2g.html'
      },
      'more': {
        desc: 'The Enel staff is happy to answer any questions you may have.',
        label: 'Would you like to find out more about smart energy?',
        tpl: self.path + '/enelstand.html'
      }
    }

    self.getAvailableSnippets = _getAvailableSnippets
    self.getSolarSnippets = _getSolarSnippets
    self.getEcarSnippets = _getECarSnippets
    self.getSnippet = _getSnippet
    return self

    // -------

    function _getSolarSnippets() {
      return $q(function(resolve, reject) {
        var snippets = _(_availableSnippets).map(function(value, key) {
            value.key = key
            if (_.includes(solarSnippetsKeys, key)) return value
          }).compact().value()
        if (!_.isEmpty(snippets)) resolve(snippets)
        else reject('No snippets!')
      })
    }
    function _getECarSnippets() {
      return $q(function(resolve, reject) {
        var snippets = _(_availableSnippets).map(function(value, key) {
            value.key = key
            if (_.includes(ecarSnippetsKeys, key)) return value
          }).compact().value()
        if (!_.isEmpty(snippets)) resolve(snippets)
        else reject('No snippets!')
      })
    }

    function _getAvailableSnippets() {
      return $q(function(resolve, reject) {
        var snippets = _.map(_availableSnippets, function(value, key) {
          value.key = key
          return value
        })
        if (!_.isEmpty(snippets)) resolve(snippets)
        else reject('No available snippets are defined!')
      })
    }

    function _getSnippet(key, appKey) {
      return $q(function(resolve, reject) {
        var searchKey = key.replace(/ /g, '_')
        if (appKey === 'solar' && !_.includes(solarSnippetsKeys, key)) return reject('Snippet not found!')
        if (appKey === 'ecar' && !_.includes(ecarSnippetsKeys, key)) return reject('Snippet not found!')
        var snippet = _availableSnippets[key]
        if (!_.isEmpty(snippet)) resolve(snippet)
        else reject('Snippet not found!')
      })
    }
  }

}(window.angular));
