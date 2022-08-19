'use strict';

const fs = require('fs');
const path = require('path');

const api = {
  run,
  getBooks
};

module.exports = (options = {}) => {
  const instance = Object.create(api);
  instance.opts = Object.assign({}, {
    port: 9000,
    databases: [
      '/mnt/calibre/Calibre Library',
      '/usr/local/data/calibrexxx'
    ]
  }, options);

  return instance;
};

function run (opts = {}) {
  const self = this;

  console.log('port: ' + self.opts.port);

  self.dbs = [];
  self.opts.databases.forEach(dbPath => {
    console.log('open: ' + dbPath);
    self.dbs.push({
      path: dbPath,
      dbh: require('better-sqlite3')(
        path.join(dbPath, 'metadata.db'),
        {
          fileMustExist: true
        }
      )
    });
  });
  console.log('OK');

  const express = require('express');
  const app = express();
  const expressHandlebars = require('express-handlebars');
  const hbs = expressHandlebars.create({});
  app.engine('handlebars', expressHandlebars.engine());
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'handlebars');
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => {
    console.log('get /');
    const books = this.getBooks();
    const bookList = Object.keys(books)
    .sort((a, b) => books[a].title.localeCompare(books[b].title))
    .map(key => {
      const book = JSON.parse(JSON.stringify(books[key]));
      if (book.title.length > 10)
        book.title = book.title.slice(0,10) + '...'
      if (book.author.length > 10)
        book.author = book.author.slice(0,10) + '...'
      return book;
    });
    res.render('home', {
      bookList: bookList
    });
  });

  app.get('/cover/:uuid/cover.jpg', (req, res) => {
    console.log('get cover');
    const uuid = req.params.uuid;
    const books = this.getBooks();
    const book = books[uuid];
    console.log('book: ' + JSON.stringify(book, null, 2));
    const coverPath = path.join(book.path, 'cover.jpg');
    res.sendFile(coverPath);
  });

  app.get('/book/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const books = this.getBooks();
    const book = books[uuid];
    res.render('book', {
      title: book.title,
      uuid: uuid
    });
  });

  app.get('/book/:uuid/book.epub', (req, res) => {
    const uuid = req.params.uuid;
    const books = this.getBooks();
    const book = books[uuid];
    console.log('book: ' + JSON.stringify(book, null, 2));
    const epubPath = path.join(book.path, book.name + '.epub');
    console.log('epubPath: ', epubPath);
    res.sendFile(epubPath, {
      headers: {
        'content-type': 'application/epub+zip'
      }
    });
  });

  const server = app.listen(this.opts.port, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Listening on http://%s:%s', host, port);
  });
}

function getBooks () {
  const self = this;
  const books = {};
  self.dbs.forEach(db => {
    db.dbh.prepare(`select
        books.id,
        uuid,
        title,
        author_sort as author,
        path,
        name
      from books
      join data on
        data.book = books.id
      where
        data.format = 'EPUB'
    `).all()
    .forEach(record => {
      record.path = path.join(db.path, record.path);
      books[record.uuid] = record;
    });
  });
  return books;
}
