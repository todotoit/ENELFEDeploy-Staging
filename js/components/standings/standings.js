;(function(window, undefined){
  'use strict'

  /* THIS ARRAY SHOULD BE UPDATED AFTER EACH GP */
  var init = function(el, team_standings, season) {
    var seasonTotalRaces = season.races
    var seasonCurrentRace = season.current

    var $el = $(el)
    var team_standings_desc = team_standings.sort(function(a, b) { return Number(b.totalPoints) - Number(a.totalPoints) });

    var bar_width = $(el).find('.bar_container').width()
    var point_width = 100 / team_standings[0].totalPoints //percent
    var point_px_width = bar_width/team_standings[0].totalPoints //pixels
    var icon_width = 20;

    var pointClasses = { 25:'place_1', 18:'place_2', 15:'place_3', 12:'place_4', 10:'place_5', 8:'place_6', 6:'place_7', 4:'place_8', 2:'place_9', 1:'place_10' }

    $el.find('ul#chart_standings_wrap').html('');
    team_standings.forEach(function(team) {
    	var $list = '<li class="team_standing">';
    	$list +=	'<div class="team_name">'+team.teamName+'</div>';
    	$list +=	'<div class="bar_container">';
    	$list +=	'<div class="bar" style="width:0%">';
    	$list +=		'<div class="bar_points">'+team.totalPoints+'pt</div>';

      team.races.forEach(function(race) {
        var pt = +race.RacePoints
        var extraBar = ''
        if (race.PolePosition) {
          extraBar = '<div class="bar_segment pole_position" style="width:'+3*point_px_width+'px"></div>'
          pt -= 3
        }
        if (race.FastestLap) {
          extraBar = '<div class="bar_segment pole_position" style="width:'+1*point_px_width+'px"></div>'
          pt -= 1
        }

        if (pt > 0) {
          var icon_class = pointClasses[pt]
      		if (pt*point_px_width < icon_width) { icon_class += ' no_bg' }
          $list += '<div class="bar_segment '+icon_class+'" style="width:'+pt*point_px_width+'px"></div>';
        }
    		$list += extraBar
    	})
    	$list +=	'</div></div></li>';
    	$el.find('ul#chart_standings_wrap').append($list);
    })

    this.animate = function() {
      var duration = 250
      var $teamBars = $el.first('ul#chart_standings_wrap').find('li.team_standing .bar')
      var $progressBar = $el.find('.progress .bar').first()
      $el.find('#currentRace').text('0')
      $progressBar.css('width', 0 +'%')
      $teamBars.each(function(i, e){
        $(e).css('width', 0 + '%')
        $(e).find('.bar_points').css('opacity', 0)
        setTimeout(function(){
          $(e).css('overflow', 'visible')
          $(e).css('width', team_standings[i].totalPoints*point_width + '%')
          $(e).find('.bar_points').css('opacity', 1)
        }, (i+1)*duration)
      })
      setTimeout(function(){
        $progressBar.css('width', (seasonCurrentRace / seasonTotalRaces)*100 +'%')
        $el.find('#currentRace').text()
        $({ Counter: 0 }).animate({ Counter: seasonCurrentRace }, {
          duration: 200 * seasonCurrentRace,
          step: function () {
            $el.find('#currentRace').text(Math.ceil(this.Counter));
          }
        })
      }, ($teamBars.length+1) * duration)
    }

    return this;
  }

  window.standingsChart = init

})(window);
