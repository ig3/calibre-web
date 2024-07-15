'use strict';
const t = require('@ig3/test');

const path = require('path');

t.test('getBooks.js', t => {
  const getBooks = require('../src/getBooks.js')(
    [
      path.join(__dirname, 'data', 'no_such_library'),
      path.join(__dirname, 'data', 'bad_library'),
      path.join(__dirname, 'data', 'library'),
    ]
  );
  const books = getBooks();
  t.ok(books, 'returns books');
  t.equal(Object.keys(books).length, 4, 'there should be 4 books');
  const book = books[Object.keys(books)[0]];
  t.equal(book.id, 2, 'book id is 2');
  t.end();
});
