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

  function selectApp(appIdx, readerIdx) {
    if (!appIdx || !readerIdx) return
    var app = apps[appIdx]
    app.status = 'on'
    toggleAppliance(app, readerIdx)
  }
  function deselectApp(appIdx, readerIdx) {
    if (!appIdx || !readerIdx) return
    var app = apps[appIdx]
    app.status = 'off'
    toggleAppliance(app, readerIdx)
  }
  function toggleAppliance(app, readerId) {
    // readerId 0 is reserved for storage
    var $reader = $readers[readerId-1]
    if (app.status == 'on') {
      $reader.addClass('on')
      $reader.data().reader.connectedAppliances.push(app)
      connectedAppliances.push(app)
      // populate reader ui element
      // $reader.find('span').css('background-image', 'url("assets/'+app.icon+'")')
      $reader.find('h4').text(app.key)
      $reader.find('label').text(app.maxV+'w')
    } else {
      _.pull($reader.data().reader.connectedAppliances, app)
      _.pull(connectedAppliances, app)
      if (_.isEmpty($reader.data().reader.connectedAppliances)) {
        // clean reader ui element
        $reader.removeClass('on')
        // $reader.find('span').css('background-image', 'url("assets/icon_arrow_down.svg")')
        $reader.find('h4').text('Plug in an appliance')
        $reader.find('label').text('')
      } else {
        // populate reader ui element with last element
        var lastapp = _.last($reader.data().reader.connectedAppliances)
        // $reader.find('span').css('background-image', 'url("assets/'+lastapp.icon+'")')
        $reader.find('h4').text(lastapp.key)
        $reader.find('label').text(lastapp.maxV+'w')
      }
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

  function initializeStorage() {
    updateTime = Simulator.sampling_rate
    apps = Simulator.appliances
    // populate ui readers list
    var socketTemp = $('#power #power-strip #socket_temp').removeAttr('id')
    socketTemp.remove()
    _.times(Simulator.rfidReaders-1, function(i) {
      var $readerElem = socketTemp.clone()
      $readerElem.data('reader', { id: i+1, connectedAppliances: [] })
      $readers.push($readerElem)
      $('#power #power-strip').append($readerElem)
    })
    var placeholderTemp = $('#bucket #placeholders #placeholder_temp').removeAttr('id'),
        applianceTemp = $('#bucket #appliances #app_temp').removeAttr('id')
    placeholderTemp.remove()
    applianceTemp.remove()
    _.each(apps, function(app,i) {
      var $appElem = applianceTemp.clone()
      $appElem.attr('id', 'app'+(i+1))
      $('#bucket #placeholders').append(placeholderTemp.clone())
      $('#bucket #appliances').append($appElem)
      // initialize data
      _.times(Simulator.dataset_length, function(i) {
        var vv = 0
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
    $('#demand > span').css({'height': percDemand+'%', 'background-position-y': 100 - percDemand+'%'})
    // update energy flow grid - storage - home
    $('[id*="arrow"]').removeClass('animate reverse fast')
    $('#grid svg g#grid polyline').removeClass('shake-constant')
    $('#grid svg g#copy_storage g').removeClass('visible')
    $('#grid svg g#storage g').removeClass('visible')
    if (!stored && !_.isEmpty(connectedAppliances) && totalDemand >= criticalDemand-criticalOffset) {
      $('#arrow_GtoB').addClass('animate fast')
      $('#grid svg g#grid polyline').addClass('shake-constant')
      $('#grid svg g#grid polyline').addClass('shake-opacity')
      $('#grid svg g#storage g#storageOFF').addClass('visible')
      $('#grid svg g#copy_storage g#copy_storageOFF').addClass('visible')
      $('#grid svg g#copy_storage g#warning_storageOFF').addClass('visible')
    } else if (!stored && !_.isEmpty(connectedAppliances)) {
      $('#arrow_GtoB').addClass('animate')
      $('#grid svg g#storage g#storageOFF').addClass('visible')
      $('#grid svg g#copy_storage g#copy_storageOFF').addClass('visible')
    } else if (stored && _.isEmpty(connectedAppliances)) {
      $('#arrow_GtoB').addClass('animate')
      $('#arrow_StoB').addClass('animate reverse')
      $('#grid svg g#storage g#storageIN').addClass('visible')
      $('#grid svg g#copy_storage g#copy_storageIN').addClass('visible')
    } else if (stored && totalDemand > treshDemand) {
      $('#arrow_GtoB').addClass('animate')
      $('#arrow_StoB').addClass('animate')
      $('#grid svg g#storage g#storageOUT').addClass('visible')
      $('#grid svg g#copy_storage g#copy_storageOUT').addClass('visible')
    } else if (stored && !_.isEmpty(connectedAppliances)){
      $('#arrow_GtoB').addClass('animate')
      $('#arrow_StoB').addClass('animate reverse')
      $('#grid svg g#storage g#storageIN').addClass('visible')
      $('#grid svg g#copy_storage g#copy_storageIN').addClass('visible')
    } else {
      $('#grid svg g#storage g#storageOFF').addClass('visible')
    }
  }
  function toggleStorage(storageState) {
    if (storageState) {
      $('main').css('background-position-y', '0%')
      $('article#storage').removeClass('on')
      stored = false
    } else {
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
        case '6':
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
      }
    })
  }
  function handleUIEvents() {
    $('article#storage #toggle svg #switch_OFF').on('click', function() {
      toggleStorage(true)
    })
    $('article#storage #toggle svg #switch_ON').on('click', function() {
      toggleStorage(false)
    })
  }

  function init() {
    initializeStorage()
    // initialie area chart
    stuck = new StackedAreaChart('#monitor-chart', apps, Simulator.dataset_length, maxDemand, Simulator.threshFactor, Simulator.dangerFactor)
    handleEvents()
    handleUIEvents()
    toggleStorage(!stored)
    updateStorage()
    dragQueer.init()
  }
  $(document).ready(init)

  // bot event handlers
  $(window).keydown(function(e) {
    $(window).trigger('customEv', e.key)
  })

  window.APP = {
    select: selectApp,
    deselect: deselectApp
  }

}(window, window.jQuery, window._, window.WebSocket, window.Simulator));
