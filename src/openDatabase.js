'use strict';

const path = require('path');

module.exports = function openDatabase (dbPath) {
  try {
    const dbh = require('better-sqlite3')(
      path.join(dbPath, 'metadata.db'),
      {
        fileMustExist: true,
      }
    );
    return dbh;
  } catch (e) {
    console.error(e.message);
    console.error(dbPath + ' failed to open - ignored');
  }
};
