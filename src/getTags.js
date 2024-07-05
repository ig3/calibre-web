'use strict';

module.exports = (databases = []) => {
  const dbs = [];
  databases.forEach(dbPath => {
    dbs.push({
      path: dbPath,
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
      }
    });
    return Object.keys(tags);
  }

  return getTags;
};
