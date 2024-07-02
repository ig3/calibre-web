#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const home = require('os').homedir();

/**
 * getConfig loads configuration from any of:
 *  /etc/calibre-web.json
 *  ~/.calibre-web.json
 */
function getConfig () {
  const config = {};

  [
    '/etc/calibre-web.json',
    path.join(home, '.calibre-web.json'),
    path.join(home, '.config', 'calibre-web.json'),
  ].forEach(configPath => {
    try {
      const conf = JSON.parse(fs.readFileSync(configPath));
      Object.assign(config, conf);
    } catch (e) {
      if (e.code !== 'ENOENT') console.log(configPath, e);
    }
  });

  return config;
}

const config = getConfig();
module.exports = config;
