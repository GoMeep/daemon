'use strict';

const express = require('express');
const app = express();
const trustedAddresses = require('./trustedConnections.js');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const request = require('request');

const { authKey, roosterAddr } = require('../meepConfig.js').hawk;

mongoose.connect('mongodb://localhost/hawk');

let NestSchema = mongoose.Schema({
    name: String,
    id: Number,
    instanceType: String,
    address: String,
    cpu: Object,
    mem: Object,
    hdd: Object
});

let Nest = mongoose.model('Nest', NestSchema);

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function (req, res) {
  res.send('Do you belong here?'); // No routes on this url yet
});

app.get('/status', function(req, res) {
  res.status(200).jsonp({
    status: 'healthy'
  });
});

// Prey looks up a servers info by id
app.get('/prey/:address', function (req, res) {
  let address =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  address = address
    .match(/\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
   if ( address ) {
     address = address[0]
   }
   request(roosterAddr, function (error, response, body) {
    if (error) {
      console.log(error);
    } else{
      if(JSON.parse(body).error){
        console.log(body);
        res.jsonp(JSON.parse(body));
      }else{
        if(JSON.parse(body)['trusted_connections'].indexOf(address) > -1) {
          let query = Nest.findOne({ 'address': req.params.address });
          query.find(function (err, nest) {
            if (err) return console.log(err);
            if (nest.length >= 1) {
              res.jsonp(nest[0]);
            }else {
              res.status(404).jsonp({
                error: "Nest not found. If you belive this is an error, please contact Matt."
              });
            }
          });
        }else {
          res.status(500).jsonp({
            error: "Prey rejected. You are not authorized to view this link. If you belive this is an error, please contact Matt.",
            address: address
          });
        }
      }
    }
   });
});

app.post('/feed', function (req, res) {
  // accepts data from the servers (also itself if alloud)
  let address = req.body.address;
  let payload = req.body;

  // If they pass the correct authKey and they are on the trusted address list..
  // ..then save the newly created data to the database for later use.
  request(roosterAddr, function (error, response, body) {
    if (error) {
      console.log(error);
    } else{
      if(JSON.parse(body).error){
        console.log(body);
      }else{
        if(payload.authKey === authKey && JSON.parse(body)['trusted_connections'].indexOf(address) > -1) {
          // Find a nest by IP address, if none exist, create one in the DB.
          let query = Nest.findOne({ 'address': address });
          query.find(function (err, nest) {
            if (err) return console.log(err);
            if( nest.length >= 1 ) {
              // If a nest is found update and save it.
              let activeNest = nest[0];
              activeNest.cpu = payload.payload.cpu;
              activeNest.hdd = payload.payload.hdd;
              activeNest.mem = payload.payload.mem;
              activeNest.save(function(err) {
                if (err) console.log(err);
              });
            }else {
              // if no nest is found, create one and save it.
              nest = new Nest({
                cpu: payload.payload.cpu,
                mem: payload.payload.mem,
                hdd: payload.payload.hdd,
                name: payload.name,
                address: address,
                id: payload.id,
                instanceType: payload.instanceType
              });
              nest.save(function(err){
                if (err) console.log(err);
                console.log(`new nest created for address: ${address}`);
              })
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
      }
    }
  });

});

const server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('meep-hawk collection service listening at http://%s:%s', host, port);
});
