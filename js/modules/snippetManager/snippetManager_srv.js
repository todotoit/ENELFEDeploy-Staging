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
    // tours
    var _availableTours = {
      'eMobility': {
        key: 'eMobility',
        label: 'E-Mobility',
        snippets: ['fastRecharge', 'efficiency', 'co2', 'regenerativeBraking', 'v2g']
      },
      'smartEnergy': {
        key: 'smartEnergy',
        label: 'Smart energy',
        snippets: ['raceMicrogrid', 'smartMetering', 'storage', 'v2g', 'firstSmartCity', 'batteryBrains', 'forgetBlackouts'],
      },
      'cleanEnergy': {
        key: 'cleanEnergy',
        label: 'Clean energy',
        snippets: ['raceMicrogrid', 'solarPower', 'howMuchSunGlobal', 'cleanEnergyGlobal', 'enelWorld', 'zeroco2ny'],
      },
      'enelAchievements': {
        key: 'enelAchievements',
        label: 'Enel achievements',
        snippets: ['howMuchSunMexico', 'cleanEnergyChile', 'firstSmartCity', 'formulaE', 'enelWorld'],
      }
    }


    var _availableHotspots = {
      'pin_1_info': {
        stage: 1,
        coords: [0.97, 4.74, 6.46],
        snippets: ['carSpecs']
      },
      'pin_1_tyre': {
        stage: 1,
        coords: [5.98, 2.32, 2.59],
        snippets: ['tyres', 'regenerativeBraking']
      },
      'pin_1_electricity': {
        stage: 1,
        coords: [-5.01, 1.12, -4.63],
        snippets: ['fanBoost', 'fastRecharge', 'batteryPower']
      },
      'pin_1_engine': {
        stage: 1,
        coords: [-3.19, 2.20, -5.73],
        snippets: ['co2', 'efficiency', 'enginePower', 'sound']
      },
      'pin_2_grid': {
        stage: 2,
        coords: [-536, 295, 470],
        snippets: ['raceMicrogrid']
      },
      'pin_2_info': {
        stage: 2,
        coords: [-649, 85, -407],
        snippets: ['circuitNY2017']
      },
      'pin_2_meter': {
        stage: 2,
        coords: [375, 219, 639],
        snippets: ['smartMetering']
      },
      'pin_2_solar': {
        stage: 2,
        coords: [-412, 198, -620],
        snippets: ['solarPower']
      },
      'pin_2_storage': {
        stage: 2,
        coords: [416, 424, -491],
        snippets: ['storage', 'batteryBrains']
      },
      'pin_3_v2g': {
        stage: 3,
        // coords: [-0.039, 0.90, 0.61],
        coords: [181],
        snippets: ['v2g', 'v2gDenmark']
      },
      'pin_3_spain': {
        stage: 3,
        // coords: [-1.04, -0.25, 0.17],
        coords: [566],
        snippets: ['cleanEnergyGlobal', 'cleanEnergyChile']
      },
      'pin_3_rome': {
        stage: 3,
        // coords: [0.091, 0.64, 0.86],
        coords: [206],
        snippets: ['enelWorld']
      },
      'pin_3_milan': {
        stage: 3,
        // coords: [-0.049, 0.74, 0.78],
        coords: [284],
        snippets: ['firstSmartCity', 'internet']
      },
      'pin_3_berlin': {
        stage: 3,
        // coords: [0.081, 0.80, 0.72],
        coords: [43],
        snippets: ['germany']
      },
      'pin_3_fe': {
        stage: 3,
        // coords: [0.95, 0.39, -0.33],
        coords: [-364],
        snippets: ['formulaE']
      },
      'pin_3_solar': {
        stage: 3,
        // coords: [-0.91, 0.38, -0.45],
        coords: [756],
        snippets: ['howMuchSunGlobal', 'howMuchSunMexico']
      },
      'pin_3_ny': {
        stage: 3,
        coords: [462],
        snippets: ['forgetBlackouts', 'zeroco2ny']
      },
      'pin_3_ca': {
        stage: 3,
        coords: [583],
        snippets: ['enelNorthAmerica', 'hybrid']
      }
    }

    // snippets
    var _availableSnippets = {
      'carSpecs': {
        desc: '',
        label: '',
        tpl: self.path + '/carInfo.html'
      },
      'fastRecharge': {
        desc: 'Innovation is ready to charge! Recharging e-cars is faster than you think.',
        label: 'Fast recharge',
        tpl: self.path + '/fastRecharge.html'
      },
      'batteryPower': {
        desc: '',
        label: '',
        tpl: self.path + '/batteryPower.html',
        subContent: [
          {
            desc: '',
            label: 'Provides energy for',
            tpl: self.path + '/subcontents/batteryPower-minutes.html'
          },
          {
            desc: '',
            label: 'Enough to charge',
            tpl: self.path + '/subcontents/batteryPower-phones.html'
          }
        ]
      },
      'batteryBrains': {
        desc: '',
        label: '',
        tpl: self.path + '/batteryBrains.html',
        subContent: [
          {
            desc: '',
            label: 'At the NYC ePrix',
            tpl: self.path + '/subcontents/batteryBrains-ePrix.html'
          },
          {
            desc: '',
            label: 'In NYC and the world',
            tpl: self.path + '/subcontents/batteryBrains-world.html'
          }
        ]
      },
      'fanBoost': {
        desc: '',
        label: '',
        tpl: self.path + '/fanBoost.html'
      },
      'sound': {
        desc: '',
        label: '',
        tpl: self.path + '/sound.html',
        subContent: [
          {
            desc: '',
            label: 'Today\'s achievement',
            tpl: self.path + '/subcontents/sound-noise.html'
          },
          {
            desc: '',
            label: 'Tomorrow\'s cities',
            tpl: self.path + '/subcontents/sound-future.html'
          }
        ]
      },
      'efficiency': {
        desc: '',
        label: '',
        tpl: self.path + '/efficiency.html'
      },
      'co2': {
        desc: '',
        label: '',
        tpl: self.path + '/zeroco2.html',
        subContent: [
          {
            desc: '',
            label: 'Traditional engines',
            tpl: self.path + '/subcontents/co2-kg.html'
          },
          {
            desc: '',
            label: 'Innovative thinking',
            tpl: self.path + '/subcontents/co2-future.html'
          }
        ]
      },
      'enginePower': {
        desc: '',
        label: '',
        tpl: self.path + '/enginePower.html'
      },
      'tyres': {
        desc: '',
        label: '',
        tpl: self.path + '/tyres.html'
      },
      'regenerativeBraking': {
        desc: '',
        label: '',
        tpl: self.path + '/regenerativebraking.html',
        subContent: [
          {
            desc: '',
            label: 'During the race',
            tpl: self.path + '/subcontents/regenerativeBraking-formulaE.html'
          },
          {
            desc: '',
            label: 'On our streets',
            tpl: self.path + '/subcontents/regenerativeBraking-eCar.html'
          }
        ]
      },
      'circuitBerlin2017': {
        desc: '',
        label: '',
        tpl: self.path + '/circuit-berlin-2017.html'
      },
      'circuitNY2017': {
        desc: '',
        label: '',
        tpl: self.path + '/circuit-ny-2017.html'
      },
      'raceMicrogrid': {
        desc: '',
        label: '',
        tpl: self.path + '/raceMicrogrid.html',
        subContent: [
          {
            desc: '',
            label: 'Small scale',
            tpl: self.path + '/subcontents/raceMicrogrid-racetrack.html'
          },
          {
            desc: '',
            label: 'Large scale',
            tpl: self.path + '/subcontents/raceMicrogrid-city.html'
          }
        ]
      },
      'smartMetering': {
        desc: '',
        label: '',
        tpl: self.path + '/smartMetering.html',
        subContent: [
          {
            desc: '',
            label: 'Smart kit',
            tpl: self.path + '/subcontents/smartMetering-kit.html'
          },
          {
            desc: '',
            label: 'Smart meter',
            tpl: self.path + '/subcontents/smartMetering-meter.html'
          }
        ]
      },
      'solarPower': {
        desc: '',
        label: '',
        tpl: self.path + '/solarPower.html',
        subContent: [
          {
            desc: '',
            label: 'Can generate',
            tpl: self.path + '/subcontents/solarPower-generate.html'
          },
          {
            desc: '',
            label: 'Can meet the needs of',
            tpl: self.path + '/subcontents/solarPower-needs.html'
          }
        ]
      },
      'storage': {
        desc: '',
        label: '',
        tpl: self.path + '/storage.html'
      },
      'v2g': {
        desc: '',
        label: '',
        tpl: self.path + '/v2g.html'
      },
      'v2gDenmark': {
        desc: '',
        label: '',
        tpl: self.path + '/v2gDenmark.html'
      },
      'howMuchSunGlobal': {
        desc: '',
        label: '',
        tpl: self.path + '/howMuchSunGlobal.html'
      },
      'howMuchSunMexico': {
        desc: '',
        label: '',
        tpl: self.path + '/howMuchSunMexico.html'
      },
      'cleanEnergyGlobal': {
        desc: '',
        label: '',
        tpl: self.path + '/cleanEnergyGlobal.html'
      },
      'cleanEnergySpain': {
        desc: '',
        label: '',
        tpl: self.path + '/cleanEnergySpain.html'
      },
      'cleanEnergyChile': {
        desc: '',
        label: '',
        tpl: self.path + '/cleanEnergyChile.html'
      },
      'enelWorld': {
        desc: '',
        label: '',
        tpl: self.path + '/enelWorld.html'
      },
      'internet': {
        desc: '',
        label: '',
        tpl: self.path + '/internet.html'
      },
      'firstSmartCity': {
        desc: '',
        label: '',
        tpl: self.path + '/firstSmartCity.html'
      },
      'germany': {
        desc: '',
        label: '',
        tpl: self.path + '/germany.html'
      },
      'formulaE': {
        desc: '',
        label: '',
        tpl: self.path + '/formulaE.html'
      },
      'enelStand': {
        desc: '',
        label: '',
        tpl: self.path + '/enelstand.html'
      },
      'enelNorthAmerica': {
        desc: '',
        label: '',
        tpl: self.path + '/enelNorthAmerica.html'
      },
      'forgetBlackouts': {
        desc: '',
        label: '',
        tpl: self.path + '/forgetBlackouts.html'
      },
      'zeroco2ny': {
        desc: '',
        label: '',
        tpl: self.path + '/zeroco2ny.html'
      },
      'hybrid': {
        desc: '',
        label: '',
        tpl: self.path + '/hybrid.html'
      }
    }

    var _qrcodeSnipsDef = [
      'cleanEnergyGlobal',
      'cleanEnergyChile',
      'howMuchSunGlobal',
      'howMuchSunMexico',
      'fastRecharge',
      'v2g',
      'v2gDenmark',
      'hybrid',
      'enelStand'
    ]

    var _qrcodeSnippets = {}
    _.map(_qrcodeSnipsDef, function(k, i){
      _qrcodeSnippets[k] = _availableSnippets[k]
      _qrcodeSnippets[k].key = k
    })

    console.warn(_qrcodeSnippets)

    self.getAvailableSnippets = _getAvailableSnippets
    self.getQRCodeSnippets = _getQRCodeSnippets
    self.getSnippet = _getSnippet
    self.getAvailableTours = _getAvailableTours
    self.getHotspot = _getHotspot
    self.getTour = _getTour
    return self

    // -------

    function _getAvailableTours() {
      var tours = _.map(angular.copy(_availableTours), function(value, key) {
        value.key = key
        value.snippets = _.map(value.snippets, function(value) {
          var snippet = angular.copy(_availableSnippets[value])
          var hotspot = _.values(_.pickBy(_availableHotspots, function(o, k) {
            o.key = k
            return _.includes(o.snippets, value)
          }))[0]
          snippet.key = value
          if (!hotspot) return snippet
          snippet.hotspot = {
            key: hotspot.key,
            stage: hotspot.stage,
            coords: hotspot.coords
          }
          return snippet
        })
        return value
      })
      if (!_.isEmpty(tours)) return tours
      else console.error('No available tours are defined!')
    }

    function _getAvailableSnippets() {
      var snippets = _.map(angular.copy(_availableSnippets), function(value, key) {
        value.key = key
        return value
      })
      if (!_.isEmpty(snippets)) return snippets
      else console.error('No available snippets are defined!')
    }

    function _getQRCodeSnippets() {
      var snippets = _.map(angular.copy(_qrcodeSnippets), function(value, key) {
        value.key = key
        return value
      })
      if (!_.isEmpty(snippets)) return snippets
      else console.error('No available snippets are defined!')
    }

    function _getTour(key) {
      var tour = angular.copy(_availableTours[key])
      if (!_.isEmpty(tour)) return tour
      else console.error('Tour not found!')
    }

    function _getHotspot(key) {
      var hotspot = angular.copy(_availableHotspots[key])
      hotspot.snippets = _.map(hotspot.snippets, function(value) {
        return angular.copy(_availableSnippets[value])
      })
      if (!_.isEmpty(hotspot)) return hotspot
      else console.error('Hotspot not found')
    }

    function _getSnippet(key) {
      var snippet = angular.copy(_availableSnippets[key])
      if (!_.isEmpty(snippet)) {
        snippet.key = key
        return snippet
      }
      else console.error('Snippet not found!')
    }
  }

}(window.angular));
