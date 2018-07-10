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

//can be any users screen name
const userID = 'mtallerico1';

io.origins(['*:*']);

app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use('/static', express.static('public'));

app.set('view engine', 'pug');

const dataPromises = [
  T.get('statuses/user_timeline', { screen_name: `${userID}`, count: 6 }),
  T.get('users/show', { screen_name: `${userID}`}),
  T.get('direct_messages/events/list', { screen_name: `${userID}`, count: 5}),
  T.get('followers/list', { screen_name: `${userID}`, count: 5})
];

function getData(array, template) {

}

app.get('/', (req, res) => {
  Promise.all([dataPromises])
    .then(response => {
      return response[0];
  }).then(response => {
    const tweets = response[0].fulfillmentValue.data;
    const userData = response[1].fulfillmentValue.data;
    const directMessages = response[2].fulfillmentValue.data;
    const followers = response[3].fulfillmentValue.data;
    res.render('index', {tweets, userData, directMessages, followers});
  }).catch(err => {
    res.send(err.stack);
  })
})

app.get('/data', (req, res) => {
  Promise.all([dataPromises])
    .then(response => {
      return response[0];
  }).then(response => {
    
    res.send(response);
  })
})


// app.get('/json', (req, res) => {
//   T.get('statuses/user_timeline', { screen_name: 'mtallerico1', count: 6 }, (err, data, response) => { 
//     res.send(data);
//   });
// });

// io.on('connection', function(socket){
//   socket.on('tweet', function(msg){
//     T.post('statuses/update', { status: `${msg.status}`, count: 5 }, function(err, data, response) {
//       io.emit('update_tweets', data);
//     })
//   })
// })

// app.use((err, req, res, next) => {
//   res.locals.error = err;
//   res.status(err.status);
//   res.render('error', err);
// })

server.listen(3000, () => {
  console.log('App is running on port 3000.')
})
