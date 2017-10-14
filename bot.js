const HTTPS = require('https');
const scraper = require('./espn-api');

const botID = process.env.BOT_ID;

function respond() {
  let request = JSON.parse(this.req.chunks[0]);
  let message = request.text;
  
  let commandRegex = {
    "team": /^\/teams$/,
    "scores": /^\/scores$/,
    "highestTeam": /^\/high-team/,
    "highestPlayer": /^\/high-player/
  };

  if(message && commandRegex.team.test(message)) {
    this.res.writeHead(200);
    getTeam(1).then((result) => {
      console.log(result);
    });
    this.res.end();
  } else if (request.text && commandRegex.scores.test(request.text)) {
    this.res.writeHead(200);
    scraper.getBoxScore().then((result) => {
      var team1HighestPlayer = result.team1.players.reduce(function(l, e) {
        return parseFloat(e.points)  > parseFloat(l.points)  ? e : l;
      });

      console.log(team1HighestPlayer);
    });
    this.res.end();
  } else if (request.text && commandRegex.highestTeam.test(request.text)) {
    scraper.getHighestScoringTeam(1504618, 5).then((result) => {
      console.log(result);
    });
  } else if (request.text && commandRegex.highestPlayer.test(request.text)) {
    Promise.all([
      scraper.getHighestScoringPlayer(1504618, 5, 1, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 2, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 3, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 6, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 8, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 9, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 10, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 12, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 13, 2017),
      scraper.getHighestScoringPlayer(1504618, 5, 14, 2017)
    ]).then((result) => {
      console.log(result);
      let highestScoringPlayers = [];

      result.forEach((matchup) => {
        highestScoringPlayers.push(matchup.team1.players.reduce(function(l, e) {
          return parseFloat(e.points)  > parseFloat(l.points)  ? e : l;
        }));

        highestScoringPlayers.push(matchup.team2.players.reduce(function(l, e) {
          return parseFloat(e.points)  > parseFloat(l.points)  ? e : l;
        }));
      });

      let highestPlayer = highestScoringPlayers.reduce(function(l, e) {
        return parseFloat(e.points)  > parseFloat(l.points)  ? e : l;
      });
      console.log(highestPlayer);
    });
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage(response) {
  var botResponse, options, body, botReq;

  botResponse = response;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;