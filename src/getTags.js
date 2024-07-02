'use strict';

const config = require('./getConfig.js');
const dbs = [];
config.databases.forEach(dbPath => {
  dbs.push({
    path: dbPath,
    // dbh: openDatabase(dbPath)
  });
});
const openDatabase = require('./openDatabase.js');

// getTags returns the union of tags across all databases, as an array
function getTags () {
  const tags = {};
  dbs.forEach(db => {
    const dbh = openDatabase(db.path);
    if (dbh) {
      try {
        dbh.prepare('select name from tags')
        .all()
        .forEach(record => {
          tags[record.name] = true;
        });
        dbh.close();
      } catch (err) {
        console.error('read ' + db.path + ': ', err);
      }
    } else {
      console.log(db.path + ': unavailable');
    }
  });
  return Object.keys(tags);
}

module.exports = getTags;
