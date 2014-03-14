#!/usr/bin/env node
var r = require('request').defaults({jar: true});

var options = require(__dirname + '/newsblur_options.js');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var login_options = {
  url: 'https://www.newsblur.com/api/login',
  headers: {
    'User-Agent': 'NewsBlur Random Unread Story',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: "username=" + options.username + '&password=' + options.password
}
r.post(login_options, function login(error, response, body) {
  var hashes_options = {
    url: 'https://www.newsblur.com/reader/unread_story_hashes',
    headers: {
      'User-Agent': 'NewsBlur Random Unread Story',
    }
  };
  r.get(hashes_options, function feeds(error, response, body) {
    var unread_feed_story_hashes_obj = JSON.parse(body);
    var feed_ids = Object.keys(unread_feed_story_hashes_obj.unread_feed_story_hashes);
    var random_feed = getRandomInt(0, feed_ids.length - 1);
    for (var feed_id_key in feed_ids) {
      if (feed_id_key == random_feed) {
        feed_id = feed_ids[random_feed];
        var feed_options = {
          url: 'https://www.newsblur.com/reader/feed/' + feed_id,
          headers: {
            'User-Agent': 'NewsBlur Random Unread Story',
          }
        }
        r.get(feed_options, function story(error, response, body) {
          stories_obj = JSON.parse(body);
          stories = stories_obj.stories;
          story_id = getRandomInt(0, stories.length - 1);
          console.log(stories[story_id].story_permalink);
        });
      }
    } // for in
  });
});
