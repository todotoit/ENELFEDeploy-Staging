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
  var criticalOffset = 4500
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
  var slideDuration = 0
  var slideStopped = true
  var stopInterval = null
  // orientation detect
  var aspect = 'landscape'
  var browser = null

  function calcOrient() {
    aspect = ($(window).width() > $(window).height())? 'landscape' : 'portrait'
    $('body').removeClass()
    $('body').addClass('orientation-'+aspect)
    window.aspect = aspect
    browser = bowser.getParser(window.navigator.userAgent)
    if (browser.isPlatform('mobile') && aspect == 'portrait') {
      $('main').hide()
      $('#mobile-cover').show()
      $('#mobile-cover aside').hide()
      $('#mobile-cover article').show()
    } else if ((browser.isPlatform('mobile') && aspect == 'landscape')
        || (browser.isPlatform('tablet') && aspect == 'portrait')) {
      $('main').hide()
      $('#mobile-cover').show()
      $('#mobile-cover article').hide()
      $('#mobile-cover aside').show()
    } else {
      $('#mobile-cover').hide()
      $('main').show()
      //location.reload();
    }
  }

  function selectApp(appIdx, readerIdx) {
    if (!appIdx || !readerIdx) return
    var app = apps[appIdx]
    if (app.status === 'on') return
    app.status = 'on'
    $('.appliance#app'+(+appIdx+1)).addClass('on')
    //console.log('on')
    toggleAppliance(app, readerIdx)
  }
  function deselectApp(appIdx, readerIdx) {
    if (!appIdx || !readerIdx) return
    var app = apps[appIdx]
    if (app.status === 'off') return
    app.status = 'off'
    $('.appliance#app'+(+appIdx+1)).removeClass('on')
    //console.log('off')
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
      $reader.find('h4').text(app.key)
      $reader.find('label').text(app.maxV+'w')
    } else {
      _.pull($reader.data().reader.connectedAppliances, app)
      _.pull(connectedAppliances, app)
      if (_.isEmpty($reader.data().reader.connectedAppliances)) {
        // clean reader ui element
        $reader.removeClass('on')
        $reader.find('h4').text('Plug in an appliance')
        $reader.find('label').text('')
      } else {
        // populate reader ui element with last element
        var lastapp = _.last($reader.data().reader.connectedAppliances)
        $reader.find('h4').text(lastapp.key)
        $reader.find('label').text(lastapp.maxV+'w')
      }
    }
    connectedAppliances = _.uniq(connectedAppliances)
    // invalid timeout
    if (tOutPause) {
      clearTimeout(tOutPause)
      tOutPause = null
    }
    tOutPause = setTimeout(stopStorage, tOutSteps*updateTime)
    // updateStorage()
    //console.log(updateInterval, slideStopped)
    if (!updateInterval) {
      startStorage()
      slide()
    }
  }

  function initializeStorage() {
    updateTime = Simulator.sampling_rate
    slideDuration = updateTime-(animationOffTime*2)
    slideDuration = 500
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
      $appElem.find('#'+app.icon).show()
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
    var grid = (aspect === 'portrait')? $('#grid-wrap') : $('#grid-landscape')
    grid.find('svg g#grid polyline').removeClass('shake-constant')
    grid.find('svg g#copy_storage g').removeClass('visible')
    grid.find('svg g#storage g').removeClass('visible')
    if (!stored && !_.isEmpty(connectedAppliances) && totalDemand >= criticalDemand-criticalOffset) {
      grid.find('#arrow_GtoB').addClass('animate fast')
      grid.find('svg g#grid polyline').addClass('shake-constant')
      grid.find('svg g#grid polyline').addClass('shake-opacity')
      grid.find('svg g#storage g#storageOFF').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageOFF').addClass('visible')
      grid.find('svg g#copy_storage g#warning_storageOFF').addClass('visible')
    } else if (!stored && !_.isEmpty(connectedAppliances)) {
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('svg g#storage g#storageOFF').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageOFF').addClass('visible')
    } else if (stored && _.isEmpty(connectedAppliances)) {
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('#arrow_StoB').addClass('animate reverse')
      grid.find('svg g#storage g#storageIN').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageIN').addClass('visible')
    } else if (stored && totalDemand > treshDemand) {
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('#arrow_StoB').addClass('animate')
      grid.find('svg g#storage g#storageOUT').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageOUT').addClass('visible')
    } else if (stored && !_.isEmpty(connectedAppliances)){
      grid.find('#arrow_GtoB').addClass('animate')
      grid.find('#arrow_StoB').addClass('animate reverse')
      grid.find('svg g#storage g#storageIN').addClass('visible')
      grid.find('svg g#copy_storage g#copy_storageIN').addClass('visible')
    } else {
      grid.find('svg g#storage g#storageOFF').addClass('visible')
    }
  }
  function toggleStorage(storageState) {
    if (storageState) {
      $('main').css('background-position-y', '0%')
      $('#storage-wrap, #storage-landscape').removeClass('on')
      stored = false
    } else {
      $('main').css('background-position-y', '100%')
      $('#storage-wrap, #storage-landscape').addClass('on')
      stored = true
    }
    var storUpdated = true
    updateStorageBehaviour()
    return stuck.update(apps, stored, storUpdated)
  }

  var tl = null
  function slide() {
    slideStopped = false
    $('.arealine').transition({ x: '-6%', duration: slideDuration, easing: 'easeInOutSine' })
    $('.topline path').transition({ x: '-6%', duration: slideDuration, easing: 'easeInOutSine' })
    $('.areas path').transition({ x: '-6%', duration: slideDuration, easing: 'easeInOutSine' })
    tl = setTimeout(queueAnimation, updateTime-animationOffTime)
  }
  function queueAnimation(){
    updateStorage()
    //console.log('add data')
    $('.arealine').css({ x: '0' })
    $('.topline path').css({ x: '0' })
    $('.areas path').css({ x: '0' })
  }

  function startStorage() {
    //console.log('start')
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
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
    slideStopped = true
    updateInterval = null
    //console.log('stop')
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
    $('#toggle svg #switch_OFF').on('click', function() {
      toggleStorage(true)
    })
    $('#toggle svg #switch_ON').on('click', function() {
      toggleStorage(false)
    })
  }

  function init() {
    FastClick.attach(document.body)
    calcOrient()
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
  // resize event handler
  var resizeDebounce = null
  $(window).on( "orientationchange", function() {
    $('body').removeClass()
  })
  $(window).resize(function() {
    if (resizeDebounce) {
      clearTimeout(resizeDebounce)
      resizeDebounce = null
    }
    resizeDebounce = setTimeout(function(){
      browser.isPlatform('mobile') ? calcOrient() : location.reload();
    }, 150)
  })
  // prevent tablet/mobile device bounce effect
  document.ontouchmove = function(event){
    event.preventDefault();
  }

  window.APP = {
    select: selectApp,
    deselect: deselectApp
  }

}(window, window.jQuery, window._, window.WebSocket, window.Simulator));
