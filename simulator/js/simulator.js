(function(window, _) {
  'use strict'

  window.Simulator = window.Simulator || {}

  var appliances = [
    { key: 'Air Conditioning', icon: 'icon_cooling.svg', uid: ['95E8432A'], status: 'off', values: [], maxV: 4000 },
    { key: 'Hot plate',        icon: 'icon_brewing.svg', uid: ['C5DA2C2A'], status: 'off', values: [], maxV: 2000 },
    { key: 'Hair dryer',       icon: 'icon_drying.svg', uid: ['75423F2A'], status: 'off', values: [], maxV: 1500 },
    { key: 'Microwave',        icon: 'icon_heating.svg', uid: [], status: 'off', values: [], maxV: 1200 },
    { key: 'Laser printer',    icon: 'icon_printing.svg', uid: [], status: 'off', values: [], maxV: 350  }
  ]
  var storageUid = ['35AA462A']

  var defaults = {
    sampling_rate: 1200,                  // millis
    appliances: appliances,
    num_of_appliances: appliances.length,
    rfidReaders: 4,                       // 0 is storage
    dataset_length: 30,
    storageUid: storageUid
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));
