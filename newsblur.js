#!/usr/bin/env node
var r = require('request').defaults({jar: true});
var Shuffle = require('shuffle');
var argv = require('minimist')(process.argv.slice(2));
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

function getAllItems(feedID, page, allItemsCallback, allItems) {
  var allItems = allItems || [];
  var allItemsCallback = allItemsCallback || function() {};
  var items_options = {
    url: 'https://www.newsblur.com/reader/feed/' + feedID + '?read_filter=unread&page=' + page + '&include_story_content=false',
    headers: {
      'User-Agent': 'NewsBlur Random Unread Story',
    }
  };
  r.get(items_options, function feeds(error, response, body) {
    stories_obj = JSON.parse(body);
    stories = stories_obj.stories;
    if (typeof(stories) != 'undefined' && stories.length > 1) {
      while (next = stories.pop()) {
        allItems.push(next);
      }
      getAllItems(feedID, page + 1, allItemsCallback, allItems)
    }
    else {
      allItemsCallback(allItems);
    }
  });
}

r.post(login_options, function login(error, response, body) {
  if (argv['_'].length == 0 && argv.length == 1) {
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
            url: 'https://www.newsblur.com/reader/feed/' + feed_id + '?read_filter=unread&include_story_content=false',
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
  }
  else {
    var feed_options = {
      url: 'https://www.newsblur.com/reader/feed/' + process.argv[2] + '?read_filter=unread&include_story_content=false',
      headers: {
        'User-Agent': 'NewsBlur Random Unread Story',
      }
    }
    if (typeof(argv['f']) != 'undefined') {
      items_feed = argv['f'];
    }
    else if (typeof(argv['_']) != 'undefined') {
      items_feed = argv['_'][0];
    }
    else { items_feed = ''; }
    getAllItems(items_feed, 1, function(items) {
      var stories_deck = Shuffle.shuffle({deck: items});
      num_stories = typeof(argv['n'] != 'undefined') ? argv['n'] : 1;
      random_stories = stories_deck.drawRandom(num_stories);
      if (Array.isArray(random_stories)) {
        random_stories.forEach(function (story, index, array) {
          console.log(story.story_permalink);
        });
      }
      else if (typeof(random_stories) != 'undefined') {
        console.log(random_stories.story_permalink);
      }
    });
  }
});
