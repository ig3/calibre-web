'use strict';
const fs = require('fs');
const home = require('os').homedir();

const t = require('@ig3/test');

t.test('getConfig', async t => {
  await t.test('loads configs', t => {
    // mock fs.readFileSync() to record the configuration files read
    // and return test data.
    const filesRead = [];

    const orig = fs.readFileSync;
    fs.readFileSync = (...args) => {
      if (args[0].indexOf('getConfig.js') !== -1) {
        return orig(...args);
      } else {
        filesRead.push(args[0]);
        return '{ "p' + filesRead.length + '": true, "x": ' + filesRead.length + ' }';
      }
    };

    const config = require('../src/getConfig.js');
    t.equal(filesRead[0], '/etc/calibre-web.json', 'first path');
    t.equal(filesRead[1], home + '/.calibre-web.json', 'second path');
    t.equal(filesRead[2], home + '/.config/calibre-web.json', 'third path');
    t.equal(filesRead.length, 3, '3 config files');
    t.deepEqual(
      config,
      {
        p1: true,
        p2: true,
        p3: true,
        x: 3,
        port: 9000,
      },
      'configurations are merged'
    );
    fs.readFileSync = orig;
    t.end();
  });

  await t.test('ignores ENOENT', t => {
    const orig = fs.readFileSync;
    fs.readFileSync = (...args) => {
      if (args[0].indexOf('getConfig.js') !== -1) {
        return orig(...args);
      } else {
        const err = new Error('no such file or directory, open ' + args[0] + '\'');
        err.errno = -2;
        err.code = 'ENOENT';
        err.syscall = 'open';
        err.path = args[0];
        throw err;
      }
    };
    const consoleLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args);
      console.log = consoleLog;
    };
    delete require.cache[require.resolve('../src/getConfig.js')];
    const config = require('../src/getConfig.js');
    t.deepEqual(
      config,
      {
        port: 9000,
      },
      'no config loaded if no config files'
    );
    t.deepEqual(logs, [], 'no console logs');
    fs.readFileSync = orig;
    t.end();
  });

  await t.test('logs non-ENOENT exceptions', t => {
    const orig = fs.readFileSync;
    fs.readFileSync = (...args) => {
      if (args[0].indexOf('getConfig.js') !== -1) {
        return orig(...args);
      } else {
        const err = new Error('permission denied ' + args[0] + '\'');
        err.errno = -2;
        err.code = 'EPERM';
        err.syscall = 'open';
        err.path = args[0];
        throw err;
      }
    };
    const consoleLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args);
    };
    delete require.cache[require.resolve('../src/getConfig.js')];
    const config = require('../src/getConfig.js');
    t.deepEqual(
      config,
      {
        port: 9000,
      },
      'no config loaded if no config files'
    );
    t.equal(logs.length, 3, '3 logs');
    logs.forEach(log => {
      t.equal(log[1].code, 'EPERM', 'logged EPERM exception');
    });

    fs.readFileSync = orig;
    console.log = consoleLog;
    t.end();
  });
  t.end();
});
