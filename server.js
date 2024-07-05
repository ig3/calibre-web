#!/usr/bin/env node

'use strict';

const config = require('./src/getConfig.js');
console.log('config: ', JSON.stringify(config, null, 2));

const app = require('./src/app.js')(config);

const server = app.listen(config.port, (err) => {
  if (err) {
    throw err;
  }
  const host = server.address().address;
  const port = server.address().port;
  console.log('Listening on https://%s:%s', host, port);
});
