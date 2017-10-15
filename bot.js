const HTTPS = require('https');
const scraper = require('./espn-api');
const weekParser = require('./nfl-weeks');

const botID = process.env.BOT_ID;

function respond() {
  let request = JSON.parse(this.req.chunks[0]);
  let message = request.text;
  
  let commandRegex = {
    "team": /^\/teams$/,
    "highestTeam": /^\/high-team/,
    "highestTeamWithWeek": /^\/high-team(\s\d+$)/,
    "highestPlayer": /^\/high-player/,
    "highestPlayerWithWeek": /^\/high-player(\s\d+$)/,
    "commands": /^\/commands/
  };

  if (message && (commandRegex.highestTeam.test(message) || commandRegex.highestTeamWithWeek.test(message))) {
    let week = weekParser.getCurrentWeek();
    if (commandRegex.highestTeamWithWeek.test(message)) {
      week = parseInt(message.match(/\d+$/)[0]);
    }

    if (week > weekParser.getCurrentWeek()) {
      postMessage('This is in the future ya dummy!');
      this.res.end();
      return;
    }

    scraper.getHighestScoringTeam(1504618, week).then((result) => {
      postMessage(`Highest Scoring Team\nWeek: ${week}\n----------------------\n${result.name}\n(${result.points})`);
      this.res.end();
    });
  } else if (message && (commandRegex.highestPlayer.test(message) || commandRegex.highestPlayerWithWeek.test(message))) {
    let week = weekParser.getCurrentWeek();
    if (commandRegex.highestPlayerWithWeek.test(message)) {
      week = parseInt(message.match(/\d+$/)[0]);
    }

    if (week > weekParser.getCurrentWeek()) {
      postMessage('This is in the future ya dummy!');
      this.res.end();
      return;
    }

    Promise.all([
      scraper.getHighestScoringPlayer(1504618, week, 1, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 2, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 3, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 6, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 8, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 9, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 10, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 12, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 13, 2017),
      scraper.getHighestScoringPlayer(1504618, week, 14, 2017)
    ]).then((result) => {
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
      postMessage(`Highest Scoring Player\nWeek: ${week}\n----------------------\n${highestPlayer.name} (${highestPlayer.points})\n${highestPlayer.owner}`);
      this.res.end();
    });
  } else if (message && (commandRegex.commands.test(message))) {
    const commandHeader = `Commands\n----------------------\n`,
      highTeam = `/high-team n\n`,
      highPlayer = `/high-player n\n`,
      weekOptional = `(n is optional for week number)`;



    postMessage(`${commandHeader}${highTeam}${highPlayer}${weekOptional}`);
    this.res.end();
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