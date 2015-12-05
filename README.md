# Meep Hawk
The hawk monitors server resources and reports them. One hawk instance is tasked with storage of this data.


## Setup

Install mongodb, mongodb-server, nodejs 5.x.

Begin by setting name, id, and instanceType in `hawkConfig.js` to properly report data,
as well as the correct master server address. You will also need to accept the reporting 
machines connection requests by adding it to the `trustedConnections.js` array on the 
master instace.

## /report
To start reporting to the master hawk instance (master can report to itself) simply
run the reportingService.js with `-harmony-destructuring` enabled.

> node -harmony-destructuring reportingService.js

you are now reporting.

## /prey/:id
To get information about yourself simply specify the id that you'd like to prey on 
and it will return the latest data from the database. (note: during early alpha anyone
on the trustedConnections list can prey on any server. This will not be true during beta.
future requests will only be aloud from the specified address, to the specified address.)

