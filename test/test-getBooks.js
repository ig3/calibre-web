'use strict';
const assert = require('node:assert/strict');
const t = require('node:test');

const path = require('path');
const config = require('../src/getConfig.js');
config.databases = [path.join(__dirname, 'data', 'library')];
const getBooks = require('../src/getBooks.js');

t.test('getBooks.js', async t => {
  const books = getBooks();
  assert(books, 'returns books');
  assert.equal(Object.keys(books).length, 4, 'there should be 4 books');
  const book = books[Object.keys(books)[0]];
  assert.equal(book.id, 2, 'book id is 2');
});
