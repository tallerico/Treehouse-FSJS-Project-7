const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Twit = require('twit');
const moment = require('moment');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { auth } = require('./js/config.js');
const T = new Twit({
  consumer_key:         auth.consumer_key,
  consumer_secret:      auth.consumer_secret,
  access_token:         auth.access_token,
  access_token_secret:  auth.access_token_secret
});

io.origins(['*:*']);

app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use('/static', express.static('public'));

app.set('view engine', 'pug');

//a function to create a new object for tweet data
function tweetObj(name,scrName, imgUrl, retweet, likes, tweetText) {
  this.name = name;
  this.scrName = scrName;
  this.imgUrl = imgUrl;
  this.retweet = retweet;
  this.likes = likes;
  this.tweetText = tweetText;
};

//a function to create a new object for direct message data
function dmObj(message, date) {
  this.message = message;
  this.date = moment(Number(date)).format("ddd, hA");
};

//a function to create a new object for direct message data
function followObj(name, scrName, imgUrl) {
  this.name = name;
  this.scrName = scrName;
  this.imgUrl = imgUrl;
};

// setting route for the index page
app.get('/', (req, res) => {
  const tweets = [];
  const dms = [];
  const followers = [];

  
  //promise to get tweet data
  const tweetProm = new Promise( (resolve, reject) => {
    T.get('statuses/user_timeline', { screen_name: 'mtallerico1', count: 6 }, 
      (err, data, response) => {
      //pushing tweet data to variable that will be scoped to res.render
      resolve(data.map(i => {
        const tweetItem = new tweetObj(`${i.user.name}`, `${i.user.screen_name}`,
          `${i.user.profile_image_url}`, `${i.retweet_count}`, 
          `${i.favorite_count}`, `${i.text}`);
          tweets.push(tweetItem);
        }));
      });
  });
  // promise to get followers data
  const followerProm = new Promise( (resolve, reject) => {
    T.get('followers/list', { screen_name: 'mtallerico1', count: 5}, 
      (err, data, response) => {
      resolve(data.users.map(i => {
        const followerItem = new followObj(`${i.name}`, `${i.screen_name}`, `${i.profile_image_url}`);
        followers.push(followerItem);
      }));
    })
  });

  //promise to get directMessages
  const directMessages = new Promise( (resolve, reject) => {
    T.get('direct_messages/events/list', 
      { screen_name: 'mtallerico1', count: 5}, 
      (err, data, response) => {
      resolve(data.events.map(i => {
        const messageItem = new dmObj(`${i.message_create.message_data.text}`, `${i.created_timestamp}`);
        dms.push(messageItem);
      }));
    });
  });
  
  Promise
    .all([tweetProm, directMessages, followerProm])
    .then(responses => {
      res.render('index', {tweets, dms, followers});
    })
});

app.get('/json', (req, res) => {
  T.get('followers/list', { screen_name: 'mtallerico1', count: 5 }, (err, data, response) => { 
    res.send(data);
  });
});

app.get("/results", (req,res) => {
  const tweets = [];
  const tweetProm = new Promise( (resolve, reject) => {
    T.get('statuses/user_timeline', { screen_name: 'mtallerico1', count: 6 }, 
     (err, data, response) => {
      //pushing tweet data to variable that will be scoped to res.render
      resolve(data.map(i => {
        const tweetItem = new tweetObj(`${i.user.name}`, `${i.user.screen_name}`,
          `${i.user.profile_image_url}`, `${i.retweet_count}`, 
          `${i.favorite_count}`, `${i.text}`);
          tweets.push(tweetItem);
        }));
     });
  });

  Promise.all([tweetProm])
    .then( response => {
      io.emit('update_tweets', tweets);
    })
});

io.on('connection', function(socket){
  socket.on('tweet', function(msg){
    T.post('statuses/update', { status: `${msg.status}` }, function(err, data, response) {
      console.log(data);
    })
  });
});



server.listen(3000, () => {
  console.log('App is running on port 3000.')
});

