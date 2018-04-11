(function (angular) {
  'use strict'

  /**
  **/

  angular
    .module('MainApp')
    .service('RacesSrv', ContructorForRacesSrv)

  /* @ngInject */
  function ContructorForRacesSrv($rootScope, $http, $q, currentSeason) {
    var self = this

    var seasonsUrl = '../assets/jsonData/seasons.json'
    var seasons = null
    var races = {}
    var racesData = {}

    self.getSeasons = _getSeasons
    self.getRaces = _getRaces
    self.getRace = _getRace
    self.getRaceData = _getRaceData
    self.getCurrentRace = _getCurrentRace
    self.getRaceWithData = _getRaceWithData
    self.getCurrentSeason = _getCurrentSeason

    // instance methods
    function _getSeasons() {
      return seasons ? $q.resolve(seasons) : _initializeSeasons()
    }
    function _getCurrentSeason() {
      return  $q.resolve(_getRaces())
                .then(function(res) {
                  var races = res
                  var firstRace = _.first(races)
                  var seasonStartDay = moment(firstRace.date, "DD MMM YYYY").subtract(1, "days")
                  var checkTime = moment().tz(firstRace.timezone)
                  if (checkTime.diff(seasonStartDay, "days") > 0) currentSeason.live = true
                  return currentSeason
                }, function(err) {
                  console.error(err)
                  return {}
                })
    }
    function _getRaces(season) {
      var season = season || currentSeason
      return races[season.id] ? $q.resolve(races[season.id]) : _initializeRaces(season)
    }
    function _getRace(season, race) {
      return  $q.resolve(_getRaces(season))
                .then(function(res) {
                  var races = res
                  return _.find(races, race)
                }, function(err) {
                  console.error(err)
                  return {}
                })
    }
    function _getCurrentRace(closest) {
      return  $q.resolve(_getRaces())
                .then(function(res) {
                  var races = res
                  var currentRace = _.find(races, { live: true })
                  if (!currentRace && closest.future) currentRace = _.find(races, closest)
                  if (!currentRace && closest.past) currentRace = _.findLast(races, closest)
                  return currentRace
                }, function(err) {
                  console.error(err)
                  return {}
                })
    }
    function _getRaceData(season, race) {
      var dataKey = season.id+race.id
      return racesData[dataKey] ? $q.resolve(racesData[dataKey]) : _initializeRaceData(season, race)
    }
    function _initializeRaceData(season, race) {
      return $http.get('../assets/jsonData/'+season.id+'/history/'+season.id+race.id+'.json')
                  .then(function(res){
                    var dataKey = season.id+race.id
                    racesData[dataKey] = res.data
                    return racesData[dataKey]
                  }, function (err) {
                    return {}
                    console.error(err)
                  })
    }
    function _getRaceWithData(season, race) {
      return $q.all([_getRace(season, race),
                     _getRaceData(season, race)])
                .then(function (res) {
                  return _.assign(res[0], res[1])
                }, function (err) {
                  console.error(err)
                })
    }

    function _initializeSeasons() {
      return $http.get(seasonsUrl)
                  .then(function(res){
                    seasons = res.data.seasons
                    return seasons
                  }, function (err) {
                    console.error(err)
                  })
    }
    function _initializeRaces(season) {
      return $http.get('../assets/jsonData/'+season.id+'/races.json')
                  .then(function(res) {
                    races[season.id] = res.data.races
                    _.forEach(races[season.id], function (r, i) {
                      var today_tz = moment().tz(r.timezone)
                      var r_day = moment(r.date, "DD MMM YYYY").utcOffset('+00:00', true)
                      var diff = r_day.diff(today_tz.clone().utcOffset('+00:00', true), "hours", true)
                      // console.log(r_day.format(), today_tz.format())
                      // console.log(diff, today_tz.clone().add(diff,'hours').format())
                      if (diff <= -24) r.past = true
                      else if (diff >= -5) r.future = true
                      else r.live = true
                    })
                    return races[season.id]
                  }, function(err) {
                    console.error(err)
                  })
    }
  }

}(window.angular));
