'use strict';

const path = require('path');

const api = {
  run,
  getBooks,
  getTags
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

  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

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
    console.log('Cookie header: ' + req.get('Cookie'));
    console.log('tags cookie: ', req.cookies.tags);
    console.log(typeof req.cookies.tags);
    const tags = req.cookies && req.cookies.tags
      ? JSON.parse(req.cookies.tags)
      : [ 'General' ];
    if (tags.length === 0) tags.push('General');
    console.log('tags: ' + JSON.stringify(tags));
    this.books = this.getBooks();
    const bookList = Object.keys(this.books)
    //    .sort((a, b) => books[a].title.localeCompare(books[b].title))
    //    .sort((a, b) => books[b].id - books[a].id)
    .filter(key => {
      const book = this.books[key];
      if (tags.includes('All')) return true;
      if (book.tags) {
        const intersection = tags.filter(tag => book.tags.includes(tag));
        if (intersection.length > 0) return true;
      }
      return false;
    })
    .sort((a, b) => this.books[a].timestamp.localeCompare(
      this.books[b].timestamp))
    .map(key => {
      // console.log('book: ' + JSON.stringify(this.books[key], null, 2));
      const book = JSON.parse(JSON.stringify(this.books[key]));
      // if (book.title.length > 10) { book.title = book.title.slice(0, 10) + '...'; }
      // if (book.author.length > 10) { book.author = book.author.slice(0, 10) + '...'; }
      return book;
    });
    res.render('home', {
      title: 'Calibre Web',
      tags: tags,
      bookList: bookList
    });
  });

  app.get('/tags', (req, res) => {
    console.log('Cookie header: ' + req.get('Cookie'));
    const selectedTags = req.cookies && req.cookies.tags
      ? JSON.parse(req.cookies.tags)
      : [ 'General' ];
    console.log('typeof selectedTags: ' + typeof selectedTags);
    console.log('selectedTags: ', JSON.stringify(selectedTags, null, 2));
    const availableTags = this.getTags();
    res.render('tags', {
      title: 'Calibre Web',
      selectedTags: selectedTags,
      availableTags: availableTags.sort()
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

  app.use((req, res, next) => {
    console.log('unmatched request: ', req.url);
    res.status(404).send('Not found: ' + req.url);
  });

  const server = app.listen(this.opts.port, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log('Listening on http://%s:%s', host, port);
  });
}

function openDatabase (dbPath) {
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
  return books;
}

// getTags returns the union of tags across all databases, as an array
function getTags () {
  const self = this;
  const tags = {}
  self.dbs.forEach(db => {
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
