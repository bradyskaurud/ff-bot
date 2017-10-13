var request = require('request');
var cheerio = require('cheerio');

function getTeams() {
  let allTeams = [];
  let teams = [1, 2, 3, 6, 8, 9, 10, 12, 13, 14]
  for(let i=0; i<teams.length; i++) {
    request(`http://games.espn.com/ffl/clubhouse?leagueId=1504618&teamId=${teams[i]}&seasonId=2017`, function(err, resp, html) {
      if (!err){
        $ = cheerio.load(html);
        allTeams.push($('.team-name').text());
        //console.log($('.team-name').text());
      }
    });
  }

  console.log(allTeams);

  return allTeams;
}

function getTeam(id) {
  let teams = [1, 2, 3, 6, 8, 9, 10, 12, 13, 14]

  request(`http://games.espn.com/ffl/clubhouse?leagueId=1504618&teamId=${id}&seasonId=2017`, function(err, resp, html) {
    if (!err){
      $ = cheerio.load(html);
      //console.log($('.team-name').text());
      return $('.team-name').text();
    }
  });
}

exports.getTeam = getTeam;


