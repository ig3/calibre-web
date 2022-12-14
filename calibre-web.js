'use strict';

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
      // paths to Calibre databases
    ]
  }, options);

  return instance;
};

function run (opts = {}) {
  const self = this;

  console.log('port: ' + self.opts.port);

  self.dbs = [];
  self.opts.databases.forEach(dbPath => {
    self.dbs.push({
      path: dbPath
      // dbh: openDatabase(dbPath)
    });
  });
  console.log('OK');

  const express = require('express');
  const app = express();
  const expressHandlebars = require('express-handlebars');
  // const hbs = expressHandlebars.create({});
  app.engine('handlebars', expressHandlebars.engine());
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'handlebars');
  app.use(
    express.static(
      path.join(__dirname, 'public'),
      {
        maxAge: '1 week'
      }
    )
  );

  app.get('/', (req, res) => {
    this.books = this.getBooks();
    const bookList = Object.keys(this.books)
    //    .sort((a, b) => books[a].title.localeCompare(books[b].title))
    //    .sort((a, b) => books[b].id - books[a].id)
    .sort((a, b) => this.books[a].timestamp.localeCompare(
      this.books[b].timestamp))
    .map(key => {
      const book = JSON.parse(JSON.stringify(this.books[key]));
      if (book.title.length > 10) { book.title = book.title.slice(0, 10) + '...'; }
      if (book.author.length > 10) { book.author = book.author.slice(0, 10) + '...'; }
      return book;
    });
    res.render('home', {
      title: 'Calibre Web',
      bookList: bookList
    });
  });

  app.get('/cover/:uuid/cover.jpg', (req, res) => {
    const uuid = req.params.uuid;
    if (!this.books || !this.books[uuid]) {
      this.books = this.getBooks();
    }
    const book = this.books[uuid];
    if (!book) {
      return res.render('404', {
        title: 'Calibre Web',
        uuid: uuid
      });
    }
    const coverPath = path.join(book.path, 'cover.jpg');
    res.sendFile(coverPath, {
      maxAge: '1 week'
    });
  });

  app.get('/book/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    if (!this.books || !this.books[uuid]) {
      this.books = this.getBooks();
    }
    const book = this.books[uuid];
    if (!book) {
      return res.render('404', {
        title: 'Calibre Web',
        uuid: uuid
      });
    }
    res.render('book', {
      title: book.title,
      uuid: uuid
    });
  });

  app.get('/book/:uuid/book.epub', (req, res) => {
    const uuid = req.params.uuid;
    if (!this.books || !this.books[uuid]) {
      this.books = this.getBooks();
    }
    const book = this.books[uuid];
    if (!book) {
      return res.render('404', {
        title: 'Calibre Web',
        uuid: uuid
      });
    }
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

function openDatabase (dbPath) {
  console.log('open: ' + dbPath);
  try {
    const dbh = require('better-sqlite3')(
      path.join(dbPath, 'metadata.db'),
      {
        fileMustExist: true
      }
    );
    return dbh;
  } catch (e) {
    console.error(e.message);
    console.error(dbPath + ' failed to open - ignored');
  }
}

function getBooks () {
  const self = this;
  const books = {};
  self.dbs.forEach(db => {
    const dbh = openDatabase(db.path);
    /*
    if (!db.dbh) {
      console.log('open: ' + db.path);
      db.dbh = openDatabase(db.path);
    }
    */
    if (dbh) {
      console.log('read: ' + db.path);
      try {
        dbh.prepare(`select
            books.id,
            uuid,
            title,
            author_sort as author,
            path,
            name,
            timestamp
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
        dbh.close();
      } catch (err) {
        console.error('read ' + db.path + ': ', err);
      }
    } else {
      console.log(db.path + ': unavailable');
    }
  });
  return books;
}
