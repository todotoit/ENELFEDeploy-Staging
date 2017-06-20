(function(window, $, _, later, Simulator) {
  'use strict'

  var appliances = []
  var numOfApp = 5
  var dataRange = 30
  var maxScale = 0
  var maxScaleOffset = 100

  // create appliances
  _.times(numOfApp, function(i) {
    var ap = { key: 'appliance'+i, values: [], status: 'off', maxV: Math.round(Math.random()*500*100)/100 }
    maxScale += ap.maxV
    // initialize data
    _.times(dataRange, function(i) {
      var v = { h: i, v: 0 }
      ap.values.push(v)
    })
    appliances.push(ap)
    // populate ui list
    var $apElem = $('<li>'+ap.key+'<br>maxV: '+ap.maxV+'</li>')
    $apElem.data('app', ap)
    $apElem.click(function() {
      $(this).toggleClass('active')
      $(this).data('app').status == 'off'? $(this).data('app').status = 'on' : $(this).data('app').status = 'off'
      updateStorage()
    })
    $('#appliances').find('ul').append($apElem)
  })
  maxScale += maxScaleOffset
  // initialie area chart
  var stuck = new StackedAreaChart('#storage', appliances, maxScale)

  // schedule updates
  var schedule = later.parse.text('every '+ Simulator.sampling_rate)
  console.info("Setting schedule every " + Simulator.sampling_rate + ": ", schedule)
  function updateStorage() {
    // console.log('update storage')
    _.each(appliances, function(ap) {
      // remove first data
      ap.values.shift()
      ap.values = _.map(ap.values, function(d) {
        d.h--
        return d
      })
      // create new data if appliance is on
      var v = ap.status === 'on'? { h: ap.values.length, v: ap.maxV } : { h: ap.values.length, v: 0 }
      ap.values.push(v)
    })
    stuck.update('#storage', appliances, maxScale)
  }
  later.setInterval(updateStorage, schedule)


}(window, window.jQuery, window._, window.later, window.Simulator));
