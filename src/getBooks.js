'use strict';

const path = require('path');
const config = require('./getConfig.js');
const dbs = [];
config.databases.forEach(dbPath => {
  dbs.push({
    path: dbPath,
    // dbh: openDatabase(dbPath)
  });
});
const books = {};
let lastLoadTime = 0;
const openDatabase = require('./openDatabase.js');

function getBooks () {
  const now = new Date();
  if (now - lastLoadTime > 60000) {
    lastLoadTime = now;
    dbs.forEach(db => {
      const dbh = openDatabase(db.path);
      if (dbh) {
        console.log('read: ' + db.path);
        try {
          dbh.prepare(`select
              books.id,
              uuid,
              title,
              author_sort as author,
              path,
              data.name,
              timestamp,
              GROUP_CONCAT(tags.name) as tags
            from books
            join data on
              data.book = books.id
            left join books_tags_link on
              books_tags_link.book = books.id
            left join tags on
              tags.id = books_tags_link.tag
            where
              data.format = 'EPUB'
            group by
              books.id
          `).all()
          .forEach(record => {
            record.path = path.join(db.path, record.path);
            books[record.uuid] = record;
          });
          dbh.close();
        } catch (err) {
          console.error('read ' + db.path + ': ', err);
        }
      } else {
        console.log(db.path + ': unavailable');
      }
    });
  }
  return books;
}

module.exports = getBooks;
