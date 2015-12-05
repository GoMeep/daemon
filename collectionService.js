'use strict';

const express = require('express');
const app = express();
const trustedAddresses = require('./trustedConnections.js');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { authKey } = require('./hawkConfig');

mongoose.connect('mongodb://localhost/test');

let Nest = mongoose.Schema({
    name: String,
    id: Number,
    instanceType: String,
    cpu: Object,
    mem: Object,
    hdd: Object
});
let Nest = mongoose.model('Nest', Nest);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get('/', function (req, res) {
  res.send('Do you belong here?'); // No routes on this url yet
});

app.post('/feed', function (req, res) {
  // accepts data from the servers (also itself if alloud)
  let address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  address = address
    .match(/\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g)[0];
  let payload = req.body;
  
  // If they pass the correct authKey and they are on the trusted address list..
  // ..then save the newly created data to the database for later use.
  if(payload.authKey === authKey && trustedAddresses.indexOf(address) > -1) {
    console.log(payload);
    console.log(address);
    
    // Find a nest by IP address, if none exist, create one in the DB.
    Nest.findOne({ 'address': address }, function (err, nest) {
      if (err) return console.log(err);
      
      if( nest ) {
        console.log(nest);
      }else {
        nest = new Nest({
          
        });
      }
    });
    
    res.jsonp({
      success: true
    });
  }else {
    res.status(500).jsonp({ 
      error: "Payload rejected. This either means your connection address has changed or was never added to the trusted connections list." 
    });
  }
});

const server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('meep-hawk collection service listening at http://%s:%s', host, port);
});