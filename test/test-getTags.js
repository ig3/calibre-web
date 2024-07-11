'use strict';
const t = require('zora');

const path = require('path');

t.test('getTags.js', t => {
  const getTags = require('../src/getTags.js')([
    path.join(__dirname, 'data', 'no_such_library'),
    path.join(__dirname, 'data', 'bad_library'),
    path.join(__dirname, 'data', 'library'),
  ]);
  const tags = getTags();
  t.ok(tags, 'have tags');
  t.equal(tags[0], 'General', 'first tag is General');
});
