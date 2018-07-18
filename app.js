const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Twit = require('twit');
const moment = require('moment');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const config = require('./config/config.js');
const T = new Twit({
  consumer_key:         config.consumer_key,
  consumer_secret:      config.consumer_secret,
  access_token:         config.access_token,
  access_token_secret:  config.access_token_secret
});

io.origins(['*:*']);

app.use(bodyParser.urlencoded({ extended: true}));
app.use('/static', express.static('public'));

app.set('view engine', 'pug');

//an array of all get promises
const dataPromises = [
  T.get('statuses/user_timeline', { count: 6 }),
  T.get('account/verify_credentials', { skip_status: true}),
  T.get('direct_messages/events/list', { count: 5}),
  T.get('friends/list', { count: 5 })
];

// T.get('users/show', { screen_name: `${userID}`}),
//a function to create a new object for tweet data
function tweetObj(name,scrName, imgUrl, retweet, likes, tweetText, date) {
  this.name = name;
  this.scrName = scrName;
  this.imgUrl = imgUrl;
  this.retweet = retweet;
  this.likes = likes;
  this.tweetText = tweetText;
  this.date = date;
};

// moment(date).format("ddd, MMM Do");

//a function to create a new object for direct message data
function dmObj(sender, message, date) {
  this.sender = sender;
  this.message = message;
  this.date = date;
};

// moment(Number(date)).format("ddd, hA")

//a function to create a new object for direct message data
function followObj(name, scrName, imgUrl) {
  this.name = name;
  this.scrName = scrName;
  this.imgUrl = imgUrl;
};

//rendering index page 
app.get('/', (req, res, next) => {
  let tweets =[];
  let user;
  let directMessages = []
  let followers = []; 
  //gettin tweet data and creating an array of objects
  dataPromises[0].then(result => {
    result.data.map(tweet => {
      tweetCur = new tweetObj(tweet.user.name, tweet.user.screen_name,
        tweet.user.profile_image_url,
        tweet.retweet_count, tweet.favorite_count,
        tweet.text, tweet.created_at);
        tweets.push(tweetCur);
    });
  })
  //gettin user data
  dataPromises[1].then(result => {
    user = result.data;
  })
  //gettin direct message data
  dataPromises[2].then(result => {
    result.data.events.map(event => {
      const dm = new dmObj(event.message_create.sender_id, 
        event.message_create.message_data.text,
        event.created_timestamp)
      directMessages.push(dm);
    });
  })
  //gettin follower data
  dataPromises[3].then(result => {
    result.data.users.map(follower => {
      const followerCur = new followObj(follower.name, 
        follower.screen_name,
        follower.profile_image_url)
        followers.push(followerCur);
    });
  })
  //resolving all promises before rendering index page
  Promise.all([dataPromises[0],
    dataPromises[1],
    dataPromises[2],
    dataPromises[3]
  ])
    .then(response => {
    res.render('index', {tweets, user, directMessages, followers});
  }).catch(next)
})

//sending tweet bost back to client to be rendered in tweet list.
io.on('connection', function(socket){
  socket.on('tweet', function(msg){
    T.post('statuses/update', { status: `${msg.status}`, count: 5 }, function(err, data, response) {
      io.emit('update_tweets', data);
    })
  })
})

app.get('/data', (req, res, next) => {
  T.get('account/verify_credentials', { skip_status: true}, function(err, data, response) {
    res.send(data);
  })
})

// handling errors
app.use((err, req, res, next) => {
    err.message = 'Houston, we have a problem';
    res.render('error', {error: err});
})

server.listen(3000, () => {
  console.log('App is running on port 3000.')
})
