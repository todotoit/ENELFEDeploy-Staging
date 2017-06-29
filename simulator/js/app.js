(function(window, $, _, later, TweenMax, TimelineMax, Simulator) {
  'use strict'

  var stuck = null
  var $apps = []
  var time = null
  var maxScale = 0
  var maxScaleOffset = 100
  var stored = false
  var tl = null

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
    // cleanOldData()
    pushNewData()
    stuck.update(Simulator.appliances, stored)
  }
  function cleanOldData() {
    _.each(Simulator.appliances, function(app) {
      // remove first data
      app.values.shift()
      app.values = _.map(app.values, function(d,i) {
        if (i>0) app.values[i-1].v = d.v
        d.h--
        return d
      })
    })
  }
  function pushNewData() {
    _.each(Simulator.appliances, function(app) {
      // create new data if appliance is on
      var v = app.status === 'on'? { h: app.values.length, v: app.maxV } : { h: app.values.length, v: 0 }
      app.values.push(v)
    })
  }

  function slide() {
    $('.arealine').transition({x: '-40px', duration: 1000, easing: 'easeInOutSine',
      complete: function() { $('.arealine').css({x: '0px'}) }
    })
    $('.topline path').transition({x: '-40px', duration: 1000, easing: 'easeInOutSine',
      complete: function() { $('.topline path').css({x: '0px'}) }
    })
    $('.areas').transition({x: '-40px', duration: 1000, easing: 'easeInOutSine',
      complete: function() {
        pushNewData()
        $('.areas').css({x: '0px'})
        stuck.update(Simulator.appliances, stored)
      }
    })
  }

  function startStorage() {
    // set schedule for updates
    var schedule = later.parse.text('every '+ Simulator.sampling_rate)
    console.info("Setting schedule every " + Simulator.sampling_rate + ": ", schedule)
    // start schedule
    // time = later.setInterval(slide, schedule)
    time = setInterval(slide, 1250)
    // if (!tl) {
    //   var area = ['.areas', '.topline path', '.arealine']
    //   tl = new TimelineMax({repeat: -1, repeatDelay:0})
    //   stuck.update(Simulator.appliances, stored)
    //   tl.to(area, 1, {
    //     onStart: function() {
    //       console.log('new')
    //       $('.areas').transition({x: '-=40px', duration: 1000})
    //     },
    //     onComplete: function() {
    //       // TweenMax.set(area, {x: '+=40px'})
    //       pushNewData()
    //       stuck.update(Simulator.appliances, stored)
    //       console.log('clean')
    //       // $('.areas path').css({x: 0})
    //       // $('.toplines path').css({x: 0})
    //       // $('.arealine').css({x: 0})
    //       // cleanOldData()
    //       // stuck.update(Simulator.appliances, stored)
    //     }, ease: 'QuadInOut'
    //   })
    // }
    // tl.resume()
  }
  function stopStorage() {
    // time.clear()
    clearInterval(time)
    time = null
    // tl.pause()
  }

  function handleEvents() {
    $(window).on('customEv', function(e,key) {
      switch (key) {
        case ' ':
          // console.warn('start/stop')
          time? stopStorage() : startStorage()
          // tl && tl.isActive()? stopStorage() : startStorage()
        break
        case '0':
        case 's':
          // console.warn('activate storage')
          stored? stored = false : stored = true
          var storUpdated = true
          // pushNewData()
          stuck.update(Simulator.appliances, stored, storUpdated)
        break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          var appIdx = +key-1
          toggleAppliance($apps[appIdx])
        break
        default:
          return
        break
      }
    })
  }

  var bmod = false
  var bot = null
  var bottime = 750
  function toggleBotMode() {
    if (bot) {
      clearInterval(bot)
      bot = null
    } else bmod = !bmod
    if (bmod) {
      $('article').css('background', 'transparent')
      $('header').css('display', 'flex')
      $('#bottime').val(bottime).focus()
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
      $('article').css('background', 'white')
      $('header').css('display', 'none')
      stopStorage()
      clearInterval(bot)
      bot = null
    }
  }

  (function init() {
    initializaStorage()
    // initialie area chart
    stuck = new StackedAreaChart('#storage', Simulator.appliances, maxScale)
    handleEvents()
    updateStorage()
    // startStorage()
    setTimeout(function() {
      // stopStorage()
    }, 1000);
  })()

  // event handlers
  $(window).keydown(function(e) {
    if (e.altKey && e.keyCode === 66) return toggleBotMode(bottime)
    $(window).trigger('customEv', e.key)
  })
  $('#botsettings').submit(function(e) {
    e.preventDefault()
    var btime = $('#bottime').val()
    if (!btime) return $('#bottime').val(bottime).focus()
    bottime = btime
    toggleBotMode()
  })

}(window, window.jQuery, window._, window.later, window.TweenMax, window.TimelineMax, window.Simulator));
