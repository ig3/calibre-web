'use strict';

const path = require('path');
const fs = require('fs');

module.exports = (databases = []) => {
  const dbs = [];
  databases.forEach(dbPath => {
    dbs.push({
      path: dbPath,
      // dbh: openDatabase(dbPath)
    });
  });
  let books = {};
  let lastLoadTime = 0;
  const openDatabase = require('./openDatabase.js');

  function getLastChangeTime () {
    let lastChangeTime = 0;
    dbs.forEach(db => {
      try {
        const mtime = fs.statSync(path.join(db.path, 'metadata.db')).mtime;
        if (mtime > lastChangeTime) lastChangeTime = mtime;
      } catch (e) {
        // Ignore errors
      }
    });
    return lastChangeTime;
  }

  function getBooks () {
    const now = new Date();
    const lastChangeTime = getLastChangeTime();
    if (lastChangeTime > lastLoadTime) {
      lastLoadTime = now;
      books = {};
      dbs.forEach(db => {
        const dbh = openDatabase(db.path);
        if (dbh) {
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
        }
      });
    }
    return books;
  }

  return getBooks;
};
