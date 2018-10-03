(function(window, _) {
  'use strict'

  window.Simulator = window.Simulator || {}

  var appliances = [
    { key: 'EV Charging', icon: 'icon_EV_charging', uid: ['A5312E2A', 'C59E482A', 'A5DA422A'], status: 'off', values: [], maxV: 7500 },
    { key: 'Cooling',     icon: 'icon_cooling',     uid: ['B5C43A2A', '95E8432A', '1EF3E8C1'], status: 'off', values: [], maxV: 4000 },
    { key: 'Brewing',     icon: 'icon_brewing',     uid: ['C5DA2C2A', '857F3A2A', '3E99E9C1'], status: 'off', values: [], maxV: 2000 },
    { key: 'Drying',      icon: 'icon_drying',      uid: ['75423F2A', '25FB392A', '4E8FE9C1'], status: 'off', values: [], maxV: 1500 },
    { key: 'Heating',     icon: 'icon_heating',     uid: ['3549482A', '8517412A', '8EA8E9C1'], status: 'off', values: [], maxV: 1200 },
    { key: 'Working',     icon: 'icon_working',     uid: ['A5312E2A', 'C59E482A', 'A5DA422A'], status: 'off', values: [], maxV: 300  }
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
    dangerFactor: 0.85
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));
