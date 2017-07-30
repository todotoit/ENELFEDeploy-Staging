;(function(window, undefined){

    'use strict'

  /* THIS ARRAY SHOULD BE UPDATED AFTER EACH GP */
  var seasonCurrentRace = 11
  var seasonTotalRaces = 12
  var team_standings = [
  	{
  		name: "RENAULT E.DAMS",
  		total_points: 277,
  		point_detail: ['place_1','place_4','place_1','place_4','place_1','place_4','fastest_lap','place_5','place_1','pole_position','place_9','place_1','pole_position','place_5','place_5','place_1','place_8','place_8','place_7','place_6','place_4','place_7','place_4']
  	},

  	{
  		name: "ABT SCHAEFFLER AUDI SPORT",
  		total_points: 232,
  		point_detail: ['place_2','place_5','place_6','place_3','pole_position','place_7','place_1','place_7','place_2','place_7','place_2','pole_position','place_6','place_3','place_4','place_4','place_5','fastest_lap','place_5','place_1','pole_position']
  	},

  	{
  		name: "MAHINDRA RACING",
  		total_points: 183,
  		point_detail: ['fastest_lap','place_3','place_3','pole_position','place_9','fastest_lap','place_3','place_6','place_3','place_4','place_1','place_3','place_2','pole_position','place_10','place_3','place_2','place_10']
  	},

  	{
  		name: "DS VIRGIN RACING",
  		total_points: 161,
  		point_detail: ['place_2','place_10','place_10','place_3','place_6','fastest_lap','place_2','fastest_lap','place_4','place_7','place_5','place_7','place_1','pole_position','place_1','pole_position','place_6']
  	},

    {
  		name: "TECHEETAH",
  		total_points: 127,
  		point_detail: ['place_8','place_2','place_10','place_2','place_8','place_8','place_6','place_2','place_3','place_8','place_2','place_3']
  	},

    {
      name: "NEXTEV NIO",
      total_points: 59,
      point_detail: ['pole_position','place_8','place_7','place_5','place_9','pole_position','place_9','place_4','place_7','place_10','place_9','place_6']
    },

    {
      name: "ANDRETTI FORMULA E",
      total_points: 32,
      point_detail: ['place_5','place_6','place_6','place_9','place_9','place_9']
    },

    {
      name: "FARADAY FUTURE DRAGON RACING",
      total_points: 31,
      point_detail: ['place_7','fastest_lap','place_8','place_6','place_5','place_10','fastest_lap']
    },

  	{
  		name: "VENTURI FORMULA E",
  		total_points: 28,
  		point_detail: ['place_9','place_10','place_5','place_8','place_10','place_9','fastest_lap','fastest_lap','place_7']
  	},

  	{
  		name: "PANASONIC JAGUAR RACING",
  		total_points: 25,
  		point_detail: ['place_8','place_4','place_10','place_9','fastest_lap','place_10','place_8']
  	}
  ]

  var init = function(el) {

    var $el = $(el)
    var team_standings_desc = team_standings.sort(function(a, b) { return Number(b.total_points) - Number(a.total_points) });

    var bar_width = $(el).find('.bar_container').width()
    var point_width = 100 / team_standings[0].total_points //percent
    var point_px_width = bar_width/team_standings[0].total_points //pixels
    var icon_width = 20;

    $el.find('ul#chart_standings_wrap').html('');
    for(var i = 0; i < team_standings.length; i++ ){
    	var $list = '<li class="team_standing">';
    	$list +=	'<div class="team_name">'+team_standings[i].name+'</div>';
    	$list +=	'<div class="bar_container">';
    	$list +=	'<div class="bar" style="width:0%">';
    	$list +=		'<div class="bar_points">'+team_standings[i].total_points+'pt</div>';
    	var team_points = 0;
    	for (var k = 0; k < team_standings[i].point_detail.length; k++) {
    		var pt = 0;
    		switch(team_standings[i].point_detail[k]){
    			case 'place_1':
    				pt = 25;
    				break;
    			case 'place_2':
    				pt = 18;
    				break;
    			case 'place_3':
    				pt = 15;
    				break;
    			case 'place_4':
    				pt = 12;
    				break;
    			case 'place_5':
    				pt = 10;
    				break;
    			case 'place_6':
    				pt = 8;
    				break;
    			case 'place_7':
    				pt = 6;
    				break;
    			case 'place_8':
    				pt = 4;
    				break;
    			case 'place_9':
    				pt = 2;
    				break;
    			case 'place_10':
    				pt = 1;
    				break;
    			case 'pole_position':
    				pt = 3;
    				break;
    			case 'fastest_lap':
    				pt = 1;
    				break;
    		}

    		team_points += pt;
    		var icon_class = team_standings[i].point_detail[k];
    		if(pt*point_px_width < icon_width){
    			icon_class += ' no_bg';
    		}
    		$list += '<div class="bar_segment '+icon_class+'" style="width:'+pt*point_px_width+'px"></div>';
    	};
    	$list +=	'</div></div></li>';

    	if(team_standings[i].name && team_points != team_standings[i].total_points){
    		console.error('!!! warning: ', team_standings[i].name, 'total_points was:'+ team_standings[i].total_points +', team_points is:'+ team_points)
    	}

    	$el.find('ul#chart_standings_wrap').append($list);

    }

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
          $(e).css('width', team_standings[i].total_points*point_width + '%')
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
