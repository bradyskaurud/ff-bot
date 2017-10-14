const request = require('request');
const cheerio = require('cheerio');

module.exports = {
  getTeams: function () {
    return new Promise((resolve, reject) => {
      let allTeams = [];
      let teams = [1, 2, 3, 6, 8, 9, 10, 12, 13, 14];
      for (let i = 0; i < teams.length; i++) {
        request(`http://games.espn.com/ffl/clubhouse?leagueId=1504618&teamId=${teams[i]}&seasonId=2017`, function (err, resp, html) {
          if (!err) {
            $ = cheerio.load(html);
            allTeams.push($('.team-name').text());
          }
        });
      }
      resolve(allTeams);
    });
  },

  getTeam: function (id) {
    return new Promise((resolve, reject) => {
      request(`http://games.espn.com/ffl/clubhouse?leagueId=1504618&teamId=${id}&seasonId=2017`, function (err, resp, html) {
        if (!err) {
          $ = cheerio.load(html);
          resolve($('.team-name').text());
        }
      });
    });
  },

  getHighestScoringTeam: function(leagueId, matchupPeriodId) {
    return new Promise((resolve, reject) => {
      request(`http://games.espn.com/ffl/scoreboard?leagueId=${leagueId}&matchupPeriodId=${matchupPeriodId}`, function (err, resp, html) {
        if (!err) {
          $ = cheerio.load(html);
          let teams = [];
          let teamIds = [1, 2, 3, 6, 8, 9, 10, 12, 13, 14];

          for(let i = 0; i < teamIds.length; i++) {
            let team = $(`#teamscrg_${teamIds[i]}_activeteamrow`);
            teams.push({
              name: team.find('.owners').text(),
              points: team.find('.score').text(),
              id: teamIds[i]
            });
          }
          let highestTeam = teams.reduce(function(l, e) {
            return parseFloat(e.points)  > parseFloat(l.points)  ? e : l;
          });

          resolve(highestTeam);
        }
      });
    });
  },

  getHighestScoringPlayer: function(leagueId, scoringPeriod, teamId, year) {
    return new Promise((resolve, reject) => {
      request(`http://games.espn.com/ffl/boxscorequick?leagueId=${leagueId}&teamId=${teamId}&scoringPeriodId=${scoringPeriod}&seasonId=${year}&view=scoringperiod&version=quick`, function (err, resp, html) {
        if(err) {
          reject(err);
        }
        if (!err) {
          $ = cheerio.load(html);
          const team1Name = $('.teamInfoOwnerData')[0].children().text();
          const team2Name = $('.teamInfoOwnerData')[1].children().text();

          const team1 = {
            name: $('.teamInfoOwnerData').text(),
            players: []
          };
          const team2 = {
            name: $('.teamInfoOwnerData').text(),
            players: []
          };

          const team1PlayerObjects = $('#playertable_0').find('.pncPlayerRow');
          const team2PlayerObjects = $('#playertable_2').find('.pncPlayerRow');

          team1PlayerObjects.each(function(i, elemn) {
            team1.players.push({
              position: $(this).find('.playerSlot').text(),
              name: $(this).find('.playertablePlayerName').children().text(),
              points: $(this).find('.appliedPoints').text()
            })
          });

          team2PlayerObjects.each(function(i, elemn) {
            team2.players.push({
              position: $(this).find('.playerSlot').text(),
              name: $(this).find('.playertablePlayerName').children().text(),
              points: $(this).find('.appliedPoints').text()
            })
          });

          resolve({ team1, team2 });
        }
      });
    });
  },

  getBoxScore: function() {
    return new Promise((resolve, reject) => {
      request(`http://games.espn.com/ffl/boxscorequick?leagueId=1504618&teamId=6&scoringPeriodId=5&seasonId=2017&view=scoringperiod&version=quick`, function (err, resp, html) {
        if (!err) {
          $ = cheerio.load(html);
          const team1 = {
            name: $('.teamInfoOwnerData').text(),
            players: []
          };
          const team2 = {
            name: $('.teamInfoOwnerData').text(),
            players: []
          };

          const team1PlayerObjects = $('#playertable_0').find('.pncPlayerRow');
          const team2PlayerObjects = $('#playertable_2').find('.pncPlayerRow');

          team1PlayerObjects.each(function(i, elemn) {
            team1.players.push({
              position: $(this).find('.playerSlot').text(),
              name: $(this).find('.playertablePlayerName').children().text(),
              points: $(this).find('.appliedPoints').text()
            })
          });

          team2PlayerObjects.each(function(i, elemn) {
            team2.players.push({
              position: $(this).find('.playerSlot').text(),
              name: $(this).find('.playertablePlayerName').children().text(),
              points: $(this).find('.appliedPoints').text()
            })
          });


          resolve({ team1, team2 });
        }
      });
    });
  }


}




