(function(window, $, _, later, Simulator) {
  'use strict'

  var stuck = null
  var $apps = []
  var time = null
  var maxScale = 0
  var maxScaleOffset = 100
  var stored = false

  function toggleAppliance(app) {
    $(app).toggleClass('active')
    $(app).data('app').status == 'off'? $(app).data('app').status = 'on' : $(app).data('app').status = 'off'
    updateStorage()
  }

  function initializaStorage() {
    _.each(Simulator.appliances, function(app) {
      maxScale += app.maxV
      // initialize data
      _.times(Simulator.dataset_length, function(i) {
        var vv = 0
        Math.random() > 0.5? vv = app.maxV : vv = 0
        var v = { h: i, v: vv }
        app.values.push(v)
      })

      // populate ui list
      var $appElem = $('<li>'+app.key+'<br>maxV: '+app.maxV+'</li>')
      $appElem.data('app', app)
      $appElem.click(function() { return toggleAppliance(this) })
      $apps.push($appElem)
      $('#appliances').find('ul').append($appElem)
    })
    maxScale += maxScaleOffset
  }

  function updateStorage() {
    _.each(Simulator.appliances, function(app) {
      // remove first data
      app.values.shift()
      app.values = _.map(app.values, function(d,i) {
        if (i>0) app.values[i-1].v = d.v
        d.h--
        return d
      })
      // create new data if appliance is on
      var v = app.status === 'on'? { h: app.values.length, v: app.maxV } : { h: app.values.length, v: 0 }
      app.values.push(v)
    })
    stuck.update(Simulator.appliances, stored)
  }

  function startStorage() {
    // set schedule for updates
    var schedule = later.parse.text('every '+ Simulator.sampling_rate)
    console.info("Setting schedule every " + Simulator.sampling_rate + ": ", schedule)
    // start schedule
    time = later.setInterval(updateStorage, schedule)
  }
  function stopStorage() {
    time.clear()
    time = null
  }

  (function init() {
    initializaStorage()
    // initialie area chart
    stuck = new StackedAreaChart('#storage', Simulator.appliances, maxScale)
    startStorage()
    setTimeout(function() {
      stopStorage()
    }, 1000);
  })()

  // event handlers
  $(window).keydown(function(e) {
    // console.warn('keydown', e)
    switch (e.key) {
      case ' ':
        // console.warn('start/stop')
        time? stopStorage() : startStorage()
      break
      case '0':
      case 's':
        // console.warn('activate storage')
        stored? stored = false : stored = true
        stuck.update(Simulator.appliances, stored)
      break
      case '1':
      case '2':
      case '3':
        var appIdx = +e.key-1
        toggleAppliance($apps[appIdx])
      break
      default:
        return
      break
    }
  })

}(window, window.jQuery, window._, window.later, window.Simulator));
