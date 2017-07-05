(function(window, _) {
  'use strict'

  window.Simulator = window.Simulator || {}

  var appliances = [
    { key: 'Cooling', icon: 'icon_cooling.svg',  uid: ['B5C43A2A', '95E8432A'], status: 'off', values: [], maxV: 4000 },
    { key: 'Brewing', icon: 'icon_brewing.svg',  uid: ['C5DA2C2A', '857F3A2A'], status: 'off', values: [], maxV: 2000 },
    { key: 'Drying',  icon: 'icon_drying.svg',   uid: ['75423F2A', '25FB392A'], status: 'off', values: [], maxV: 1500 },
    { key: 'Eating',  icon: 'icon_heating.svg',  uid: ['3549482A', '8517412A'], status: 'off', values: [], maxV: 1200 },
    { key: '?',       icon: 'icon_printing.svg', uid: ['A5312E2A', 'C59E482A', 'A5DA422A'], status: 'off', values: [], maxV: 350  }
  ]
  var storageUid = ['65AB332A', '35AA462A', '75A1322A']

  var defaults = {
    sampling_rate: 1200,                  // millis
    appliances: appliances,
    num_of_appliances: appliances.length,
    rfidReaders: 4,                       // 0 is storage
    dataset_length: 30,
    storageUid: storageUid,
    threshFactor: 0.5,
    dangerFactor: 0.95
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));
