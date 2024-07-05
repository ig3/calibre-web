'use strict';

const path = require('path');
const express = require('express');
const expressHandlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');

module.exports = (opts = {}) => {
  const databases = [...opts.databases];
  const defaultTags = [...(opts.defaultTags || ['All'])];
  const excludeTags = [...(opts.excludeTags || [])];
  const explicitOnly = [...(opts.explicitOnly || [])];
  const showTagless = opts.showTagless || false;

  const getBooks = require('./getBooks.js')(databases);
  const getTags = require('./getTags.js')(databases);

  const app = express();

  app.use(cookieParser());

  // const hbs = expressHandlebars.create({});
  app.engine('handlebars', expressHandlebars.engine());
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'handlebars');
  app.use(
    express.static(
      path.join(__dirname, '..', 'public'),
      {
        maxAge: '1 week',
      }
    )
  );

  app.get('/', (req, res) => {
    const tags = (() => {
      const cookieTags = (() => {
        if (req.cookies && req.cookies.tags) {
          try {
            return JSON.parse(req.cookies.tags);
          } catch (e) {
            console.error('Unparsable cookie tags: ' + req.cookies.tags);
            console.error(e);
          }
        }
      })();
      if (cookieTags && cookieTags.length > 0) return cookieTags;
      return defaultTags;
    })();
    const books = getBooks();
    const bookList = Object.keys(books)
    //    .sort((a, b) => books[a].title.localeCompare(books[b].title))
    //    .sort((a, b) => books[b].id - books[a].id)
    .filter(key => {
      const book = books[key];
      if (book.tags) {
        if (tags.includes('!All')) return true;
        if (excludeTags) {
          const intersection =
            excludeTags
            .filter(tag => book.tags.includes(tag));
          if (intersection.length !== 0) return false;
        }
        if (explicitOnly) {
          const intersection =
            explicitOnly
            .filter(
              tag =>
                book.tags.includes(tag) &&
                !tags.includes(tag)
            );
          if (intersection.length !== 0) return false;
        }
        if (tags.includes('All')) {
          return true;
        }
        const intersection = tags.filter(tag => book.tags.includes(tag));
        return (intersection.length > 0);
      } else {
        return tags.includes('!All') || showTagless;
      }
    })
    .sort((a, b) => books[a].timestamp.localeCompare(
      books[b].timestamp))
    .map(key => {
      // console.log('book: ' + JSON.stringify(this.books[key], null, 2));
      const book = JSON.parse(JSON.stringify(books[key]));
      // if (book.title.length > 10) { book.title = book.title.slice(0, 10) + '...'; }
      // if (book.author.length > 10) { book.author = book.author.slice(0, 10) + '...'; }
      return book;
    });
    res.render('home', {
      title: 'Calibre Web',
      tags: tags,
      bookList: bookList,
      refresh: true,
      shortcuts: true,
    });
  });

  app.get('/tags', (req, res) => {
    const selectedTags = req.cookies && req.cookies.tags
      ? JSON.parse(req.cookies.tags)
      : defaultTags;
    const availableTags = getTags();
    res.render('tags', {
      title: 'Calibre Web',
      selectedTags: selectedTags,
      availableTags: availableTags.sort(),
      shortcuts: true,
    });
  });

  app.get('/cover/:uuid/cover.jpg', (req, res) => {
    const uuid = req.params.uuid;
    const books = getBooks();
    const book = books[uuid];
    if (!book) {
      return res.status(404).send('Not found: ' + req.url);
    }
    const coverPath = path.join(book.path, 'cover.jpg');
    res.sendFile(coverPath, {
      maxAge: '1 week',
    });
  });

  app.get('/book/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const books = getBooks();
    const book = books[uuid];
    if (!book) {
      return res.status(404).send('Not found: ' + req.url);
    }
    res.render('book', {
      title: book.title,
      uuid: uuid,
    });
  });

  app.get('/book/:uuid/book.epub', (req, res) => {
    const uuid = req.params.uuid;
    const books = getBooks();
    const book = books[uuid];
    if (!book) {
      return res.status(404).send('Not found: ' + req.url);
    }
    const epubPath = path.join(book.path, book.name + '.epub');
    res.sendFile(epubPath, {
      headers: {
        'content-type': 'application/epub+zip',
      },
    });
  });

  app.use((req, res, next) => {
    console.log('unmatched request: ', req.url);
    res.status(404).send('Not found: ' + req.url);
  });

  return app;
};
