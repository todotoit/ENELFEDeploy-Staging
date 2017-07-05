var copydir = require('copy-dir')
var path = require('path')
var replace = require('replace')
var pkg = require('./package.json')

if (process.argv[2]) {
  console.log('trying to copy ', process.argv[2])
  if (process.argv[2] === 'fillergame') {
    console.log('deploying fillergame')
    copydir.sync(path.join('..', 'ENEL-FE-FillerGame/public'), 'game')
  }

  if (process.argv[2] === 'podio') {
    console.log('deploying podio')
    copydir.sync(path.join('..', 'ENEL-FE-Podio/public'), 'podio')
  }

  if (process.argv[2] === 'wow') {
    console.log('deploying wow')
    copydir.sync(path.join('..', 'ENEL-FE-Wow/public'), 'wow')
  }

  if (process.argv[2] === 'simulator') {
    console.log('deploying simulator')
    copydir.sync(path.join('..', 'ENEL-FE-Simulator/public'), 'simulator')
  }

  if (process.argv[2] === 'website') {
    console.log('deploying website')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/assets'), 'assets')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/js'), 'js')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/libs'), 'libs')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/website'), 'website')

        // replace({
        //     regex: /\.\.\S*\/assets\/images\//g,
        //     replacement: 'http://1974130908.rsc.cdn77.org/assets/images/',
        //     paths: ['website/index.html',
        //      'website/templates/404.html',
        //      'website/templates/animationtest.html',
        //      'website/templates/battery.html',
        //      'website/templates/landing.html',
        //      'website/templates/race-history.html',
        //      'website/templates/test.html'
        //      ],
        //     recursive: true
        // });
  }

  if (process.argv[2] === 'webapp') {
    console.log('deploying webapp')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/assets'), 'assets')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/js'), 'js')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/libs'), 'libs')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/app'), 'app')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/webapp'), 'app')
  }

  if (process.argv[2] === 'snippets') {
    console.log('deploying snippets')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/assets'), 'assets')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/js'), 'js')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/libs'), 'libs')
    copydir.sync(path.join('..', 'ENEL-F-E-APP/public/snippets'), 'snippets')

    copydir.sync(path.join('..', 'ENEL-F-E-APP/app/redirects/'), '')
  }

  /* if (process.argv[2] === 'tablet') {
    console.log('deploying tablet')
    copydir.sync(path.join('..', 'ENEL-F-E/app/'), 'app')
    copydir.sync(path.join('..', 'ENEL-F-E/app/'), 'monitor')

    replace({
      regex: '.js"',
      replacement: '.js?v=' + pkg.version + '"',
      paths: ['app/index.html', 'monitor/index.html'],
      recursive: true
    })

    replace({
      regex: '.css"',
      replacement: '.css?v=' + pkg.version + '"',
      paths: ['app/index.html', 'monitor/index.html'],
      recursive: true
    })

        // replace({
        //     regex: '<img src="img/',
        //     replacement: '<img src="http://1974130908.rsc.cdn77.org/app/img/',
        //     paths: ['app/index.html'],
        //     recursive: true
        // });
  } */
} else {
  console.log('you need to specify the app name')
}
