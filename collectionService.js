'use strict';

const express = require('express');
const app = express();
const trustedAddresses = require('./trustedConnections.js');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { authKey } = require('./hawkConfig');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get('/', function (req, res) {
  res.send('Do you belong here?');
});

app.post('/feed', function (req, res) {
  let address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  address = address
    .match(/\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g)[0];
  let payload = req.body;
  if(payload.authKey === authKey && trustedAddresses.indexOf(address) > -1) {
    console.log(payload);
    console.log(address);
    
    // write it to mongodb
    
    res.jsonp({
      success: true
    });
  }else {
    res.status(500).jsonp({ error: "Sorry kid, you're not on the list." });
  }
});

const server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});