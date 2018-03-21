(function(window, $, _, WebSocket, Simulator) {
  'use strict'

  // simulator
  var $readers = []
  var connectedAppliances = []
  var apps = []
  var stored = false
  var totalDemand = 0
  var treshDemand = 0
  var criticalDemand = 0
  var criticalOffset = 1000
  // chart
  var stuck = null
  var maxDemand = 0
  var maxDemandOffset = 0
  // updates
  var updateInterval = null
  var updateTime = 0
  var animationOffTime = 75
  var tOutSteps = 4
  var tOutPause = null
  // web socket
  var ws = null
  var wssURL = 'ws://7.7.7.7:9000'
  var wsPollingTime = 1000

  function toggleAppliance(app, readerId) {
    // readerId 0 is reserved for storage
    var $reader = $readers[readerId-1]
    if (app.status == 'on') {
      $reader.addClass('on')
      $reader.data().reader.connectedAppliances.push(app)
      connectedAppliances.push(app)
      // populate reader ui element
      $reader.find('span').css('background-image', 'url("assets/'+app.icon+'")')
      $reader.find('h4').text(app.key)
      $reader.find('label').text(app.maxV+'w')
    } else {
      _.pull($reader.data().reader.connectedAppliances, app)
      _.pull(connectedAppliances, app)
      if (_.isEmpty($reader.data().reader.connectedAppliances)) {
        // clean reader ui element
        $reader.removeClass('on')
        $reader.find('span').css('background-image', 'url("assets/icon_arrow_down.svg")')
        $reader.find('h4').text('')
        $reader.find('label').text('')
      } else {
        // populate reader ui element with last element
        var lastapp = _.last($reader.data().reader.connectedAppliances)
        $reader.find('span').css('background-image', 'url("assets/'+lastapp.icon+'")')
        $reader.find('h4').text(lastapp.key)
        $reader.find('label').text(lastapp.maxV+'w')
      }
    }
    if (_.isEmpty(connectedAppliances)) {
      $('#appliances .active').hide()
      $('#appliances .inactive').fadeIn()
    } else {
      $('#appliances .inactive').hide()
      $('#appliances .active').fadeIn()
    }
    // invalid timeout
    if (tOutPause) {
      clearTimeout(tOutPause)
      tOutPause = null
    }
    tOutPause = setTimeout(stopStorage, tOutSteps*updateTime)
    // updateStorage()
    if (!updateInterval) {
      slide()
      startStorage()
    }
  }

  function initializaStorage() {
    updateTime = Simulator.sampling_rate
    apps = Simulator.appliances
    // populate ui readers list
    _.times(Simulator.rfidReaders-1, function(i) {
      var $readerElem = $('<li class="reader"><span></span><h4></h4><label></label></li>')
      $readerElem.data('reader', { id: i+1, connectedAppliances: [] })
      $readers.push($readerElem)
      $('#readers').find('ul').append($readerElem)
    })
    _.each(apps, function(app) {
      // initialize data
      _.times(Simulator.dataset_length, function(i) {
        var vv = 0
        // Math.random() > 0.5? vv = app.maxV : vv = 0
        var v = { h: i, v: vv }
        app.values.push(v)
      })
    })
    maxDemand = _.sumBy(_(apps).sortBy('maxV')
                              .reverse()
                              .take(Simulator.rfidReaders-1)
                              .value(),'maxV')
    maxDemand += maxDemandOffset
    treshDemand = maxDemand * Simulator.threshFactor
    criticalDemand = maxDemand * Simulator.dangerFactor
    $('#appliances .active').hide()
    $('#appliances .inactive').show()
  }
  function updateStorage() {
    totalDemand = _.sumBy(connectedAppliances, 'maxV')
    pushNewData()
    stuck.update(apps, stored)
    updateStorageBehaviour()
  }
  function pushNewData() {
    _.each(apps, function(app) {
      // create new data if appliance is on
      var v = app.status === 'on'? { h: app.values.length, v: app.maxV } : { h: app.values.length, v: 0 }
      app.values.push(v)
    })
  }
  function updateStorageBehaviour() {
    // update percent demand
    var percDemand = totalDemand/maxDemand *100
    if (percDemand > 100) percDemand = 100
    $('#demand > span').css({'width': percDemand+'%', 'background-position-x': percDemand+'%'})
    // update storage energy in/out
    if (totalDemand > treshDemand) {
      // storage => energy out
      $('#storage .active #dot #bolt').fadeOut()
      $('#storage .active #dot').css('transform', 'translateY(-40px)')
    } else {
      // storage => energy in
      $('#storage .active #dot #bolt').fadeIn()
      $('#storage .active #dot').css('transform', 'translateY(0)')
    }
    // update energy flow grid - storage - home
    $('g[id*="arrow"]').removeClass('animate reverse fast')
    $('#grid svg g#theGrid #icoBolt').removeClass('shake-constant')
    $('#grid svg #alert').removeClass('visible')
    $('#grid svg #storage').removeClass('visible')
    if (!stored && !_.isEmpty(connectedAppliances) && totalDemand >= criticalDemand-criticalOffset) {
      $('#arrowGtoH').addClass('animate fast')
      $('#grid svg g#theGrid #icoBolt').addClass('shake-constant')
      $('#grid svg g#theGrid #icoBolt').addClass('shake-opacity')
      $('#grid svg #alert').addClass('visible')
    } else if (!stored && !_.isEmpty(connectedAppliances)) {
      $('#arrowGtoH').addClass('animate')
    } else if (stored && _.isEmpty(connectedAppliances)) {
      $('#grid svg #storage').addClass('visible')
      $('#arrowGtoH').addClass('animate')
      $('#arrowStoH').addClass('animate reverse')
    } else if (stored && totalDemand > treshDemand) {
      $('#grid svg #storage').addClass('visible')
      $('#arrowGtoH').addClass('animate')
      $('#arrowStoH').addClass('animate')
    } else if (stored && !_.isEmpty(connectedAppliances)){
      $('#grid svg #storage').addClass('visible')
      $('#arrowGtoH').addClass('animate')
      $('#arrowStoH').addClass('animate reverse')
    }
  }
  function toggleStorage(storageState) {
    if (storageState) {
      $('#storage .active').hide()
      $('#storage .inactive').show()
      $('main').css('background-position-y', '0%')
      $('article#storage').removeClass('on')
      stored = false
    } else {
      $('#storage .inactive').hide()
      $('#storage .active').show()
      $('main').css('background-position-y', '100%')
      $('article#storage').addClass('on')
      stored = true
    }
    var storUpdated = true
    updateStorageBehaviour()
    return stuck.update(apps, stored, storUpdated)
  }

  function slide() {
    $('.arealine').transition({ x: '-37px', duration: updateTime-(animationOffTime*2), easing: 'easeInOutSine' })
    $('.topline path').transition({ x: '-37px', duration: updateTime-(animationOffTime*2), easing: 'easeInOutSine' })
    $('.areas path').transition({ x: '-37px', duration: updateTime-(animationOffTime*2), easing: 'easeInOutSine' })
    setTimeout(function() {
      updateStorage()
      $('.arealine').css({ x: '0px' })
      $('.topline path').css({ x: '0px' })
      $('.areas path').css({ x: '0px' })
    }, updateTime-animationOffTime)
  }

  function startStorage() {
    if (updateInterval) stopStorage()
    updateInterval = setInterval(slide, updateTime)
    if (tOutPause) {
      clearTimeout(tOutPause)
      tOutPause = null
    }
    tOutPause = setTimeout(stopStorage, tOutSteps*updateTime)
    $('#clock svg line').css('animation-play-state', 'running')
  }
  function stopStorage() {
    clearInterval(updateInterval)
    updateInterval = null
    if (tOutPause) {
      clearTimeout(tOutPause)
      tOutPause = null
    }
    $('#clock svg line').css('animation-play-state', 'paused')
  }

  function handleEvents() {
    $(window).on('customEv', function(e,key) {
      switch (key) {
        case ' ':
          updateInterval? stopStorage() : startStorage()
        break
        case '0':
        case 's':
          toggleStorage(stored)
        break
        case '1':
        case '2':
          var appIdx = +key-1
          var app = apps[appIdx]
          app.status = app.status == 'off'? 'on' : 'off'
          toggleAppliance(app, 1)
        break
        case '3':
          var appIdx = +key-1
          var app = apps[appIdx]
          app.status = app.status == 'off'? 'on' : 'off'
          toggleAppliance(app, 2)
        break
        case '4':
        case '5':
          var appIdx = +key-1
          var app = apps[appIdx]
          app.status = app.status == 'off'? 'on' : 'off'
          toggleAppliance(app, 3)
        break
        default:
          return
        break
      }
    })

  }
  function handleSockEvents() {
    if (!ws) return
    ws.onopen = function(e) {
      console.info('open ws connection!', e)
    }
    ws.onmessage = function(e) {
      var data = JSON.parse(e.data.split(' from ')[0])
      console.log('message received', e, data)
      // toggle storage
      if (data.id === 0) {
        var storageState = _.lowerCase(data.state) === 'off'
        var stor = _.includes(Simulator.storageUid, data.uid)
        if (!stor) return console.error('Invalid Storage UID:', data)
        return toggleStorage(storageState)
      } else {
        var app = _.find(apps, function(app) { return _.includes(app.uid, data.uid) })
        if (!app) return console.error('Invalid UID:', data)
        app.status = _.lowerCase(data.state)
        var readersId = data.id
        return toggleAppliance(app, readersId)
      }
    }
    ws.onclose = function(e) {
      console.info('closed ws connection!', e)
      ws = null
      setTimeout(function() {
        ws = new WebSocket(wssURL)
        handleSockEvents()
      }, wsPollingTime)
    }
    ws.onerror = function(e) {
      console.error('error on ws connection!', e)
    }
  }

  var bmod = false
  var bot = null
  var bottime = 1250
  function toggleBotMode() {
    if (bot) {
      clearInterval(bot)
      bot = null
      bmod = false
    } else bmod = !bmod
    if (bmod) {
      startStorage()
      bot = setInterval(function() {
        var choice = Math.floor(Math.random()*10)
        switch (choice) {
          case 0:
          case 7:
          case 9:
            $(window).trigger('customEv', 's')
          break
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            $(window).trigger('customEv', choice.toString())
          break
          default:
            return
          break
        }
      }, bottime)
    } else {
      stopStorage()
      clearInterval(bot)
      bot = null
    }
  }

  (function init() {
    initializaStorage()
    // initialie area chart
    stuck = new StackedAreaChart('#monitor-chart', apps, Simulator.dataset_length, maxDemand, Simulator.threshFactor, Simulator.dangerFactor)
    if (wssURL) ws = new WebSocket(wssURL)
    handleSockEvents()
    handleEvents()
    toggleStorage(!stored)
    updateStorage()
  })()

  // bot event handlers
  $(window).keydown(function(e) {
    if (e.altKey && e.keyCode === 66) return toggleBotMode()
    $(window).trigger('customEv', e.key)
  })

}(window, window.jQuery, window._, window.WebSocket, window.Simulator));
