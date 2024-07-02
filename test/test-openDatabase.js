'use strict';
const assert = require('node:assert/strict');
const t = require('node:test');

const openDatabase = require('../src/openDatabase.js');
const path = require('path');

t.test('openDatabase.js', async t => {
  await t.test('returns database handle', t => {
    const databaseDir = path.join(__dirname, 'data');
    const dbh = openDatabase(databaseDir);
    assert(dbh, 'database handle is defined');
    assert.equal(dbh.name, path.join(__dirname, 'data', 'metadata.db'), 'database name');
    assert(dbh.prepare, 'prepare method exists');
    assert(typeof dbh.prepare, 'function', 'prepare method is a function');
  });

  await t.test('error on non-existing database', t => {
    const consoleError = console.error;
    let logs = false;
    console.error = (...args) => {
      logs = true;
    };
    t.after(() => {
      console.error = consoleError;
    });
    const databaseDir = path.join(__dirname, 'data', 'does-not-exist');
    const dbh = openDatabase(databaseDir);
    assert.equal(dbh, undefined, 'does not return a database handle');
    assert(logs, 'logs produced');
  });
});
