# Treehouse-FSJS-Project-7


*To set up your config file

Create config.js file in js folder

In config file create an object literal 

    exports.auth = {
      consumer_key:         '...',
      consumer_secret:      '...',
      access_token:         '...',
      access_token_secret:  '...'
    }


Make sure in your app.js file that you include config file

    const { auth } = require('./js/config.js');