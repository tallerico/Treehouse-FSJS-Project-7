const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Twit = require('twit');
const moment = require('moment');
const { auth } = require('./js/config.js');
const app = express();
const T = new Twit({
  consumer_key:         auth.consumer_key,
  consumer_secret:      auth.consumer_secret,
  access_token:         auth.access_token,
  access_token_secret:  auth.access_token_secret
})


app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use('/static', express.static('public'));

app.set('view engine', 'pug');

function tweetObj(name,scrName, imgUrl, retweet, likes, tweetText) {
  this.name = name;
  this.scrName = scrName;
  this.imgUrl = imgUrl;
  this.retweet = retweet;
  this.likes = likes;
  this.tweetText = tweetText;
};

function dmObj(message, date) {
  this.message = message;
  this.date = moment().unix(date);
};


app.get('/', (req, res) => {
  const tweets = [];
  const dms = [];
  const tweetProm = new Promise( (resolve, reject) => {
    T.get('statuses/user_timeline', { screen_name: 'mtallerico1', count: 6 }, 
      (err, data, response) => {
      resolve(data.map(i => {
        const tweetItem = new tweetObj(`${i.user.name}`, `${i.user.screen_name}`,
          `${i.user.profile_image_url}`, `${i.retweet_count}`, 
          `${i.favorite_count}`, `${i.text}`);
          tweets.push(tweetItem);
        }));
      });
  });

  // const userData = new Promise( (resolve, reject) => {
  //   T.get('users/show', { screen_name: 'mtallerico1'}, 
  //     (err, data, response) => {
  //     resolve(newData.push(data));
  //   })
  // });

  const directMessages = new Promise( (resolve, reject) => {
    T.get('direct_messages/events/list', { screen_name: 'mtallerico1', count: 5}, 
      (err, data, response) => {
      resolve(data.events.map(i => {
        const messageItem = new dmObj(`${i.message_create.message_data.text}`, `${i.created_timestamp}`);
        dms.push(messageItem);
      }));
    });
  });
  
  Promise
    .all([tweetProm, directMessages])
    .then(responses => {
      res.render('index', {tweets, dms});
    })
});

app.get('/json', (req, res) => {
  T.get('direct_messages/events/list', { screen_name: 'mtallerico1' }, (err, data, response) => {
    
    res.send(data);
  });
});



app.listen(3000, () => {
  console.log('App is running on port 3000.')
});