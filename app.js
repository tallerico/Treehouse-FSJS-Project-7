const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Twit = require('twit');
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




app.get('/', (req, res) => {
  T.get('statuses/user_timeline', { screen_name: 'mtallerico1', count: 6 }, (err, data, response) => {
    const tweetData = data;
    res.render('index', {tweetData});
  });
});

app.get('/json', (req, res) => {
  T.get('statuses/user_timeline', { screen_name: 'mtallerico1', count: 6 }, (err, data, response) => {
    const tweetData = data;
    res.send(tweetData);
  });
});



app.listen(3000, () => {
  console.log('App is running on port 3000.')
});