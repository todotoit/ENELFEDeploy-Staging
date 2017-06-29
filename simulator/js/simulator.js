(function(window, _) {
  'use strict'

  window.Simulator = window.Simulator || {}

  var appliances = [
    { key: 'Air Conditioning', values: [], status: 'off', maxV: 1080 },
    { key: 'Laser printer', values: [], status: 'on', maxV: 456 },
    { key: 'Microwave', values: [], status: 'off', maxV: 101 },
    { key: 'Refrigerator', values: [], status: 'off', maxV: 785 },
    { key: 'phon', values: [], status: 'on', maxV: 210 }
  ]

  var defaults = {
    sampling_rate: 1+' second', // scheduled update time
    appliances: appliances,
    num_of_appliances: appliances.length,
    dataset_length: 30
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));
