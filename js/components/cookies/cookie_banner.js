(function ($) {
  $(document).ready(function () {
    var pref = $.fx.cssPrefix
    var prefix = pref + 'transform'

    var userAgree = window.docCookies.getItem('doNotProfile')

    console.log('user agree? ' + userAgree)

    if (!userAgree) {
      $('#cookie').css('display', 'block')

      window.addEventListener('scroll', setCookie);
      $('main').on('click', setCookie);
      $('[js_ok_cookie]').on('click', function () {
        setCookie()
        return false
      })
    }

    function setCookie () {
      var expirationDate = new Date(new Date().setYear(new Date().getFullYear() + 1))

      window.docCookies.setItem('doNotProfile', 1, expirationDate, '/')
      window.removeEventListener('scroll', setCookie);
      $('main').off('click', setCookie);
      $('[js_ok_cookie]').off('click')

      TweenMax.to('#cookie', .5, {opacity: 0,
        onComplete: function () { $('#cookie').remove() }
      })
    }
  })
})(window.jQuery);
