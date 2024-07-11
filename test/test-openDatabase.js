'use strict';
const t = require('zora');

const openDatabase = require('../src/openDatabase.js');
const path = require('path');

t.test('openDatabase.js', t => {
  t.test('returns database handle', t => {
    const databaseDir = path.join(__dirname, 'data');
    const dbh = openDatabase(databaseDir);
    t.ok(dbh, 'database handle is defined');
    t.equal(dbh.name, path.join(__dirname, 'data', 'metadata.db'), 'database name');
    t.ok(dbh.prepare, 'prepare method exists');
    t.ok(typeof dbh.prepare, 'function', 'prepare method is a function');
  });

  t.test('error on non-existing database', t => {
    const consoleError = console.error;
    let logs = false;
    console.error = (...args) => {
      logs = true;
    };
    const databaseDir = path.join(__dirname, 'data', 'does-not-exist');
    const dbh = openDatabase(databaseDir);
    t.equal(dbh, undefined, 'does not return a database handle');
    t.ok(logs, 'logs produced');
    console.error = consoleError;
  });
});
