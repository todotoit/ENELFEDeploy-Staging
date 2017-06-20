(function(window, _) {
  window.Simulator = window.Simulator || {}

  var defaults = {
    sampling_rate: 1+' seconds' // scheduled update time
  }
  _.defaultsDeep(window.Simulator, defaults)

}(window, window._));
