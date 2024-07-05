'use strict';
const assert = require('node:assert/strict');
const t = require('node:test');

const path = require('path');

t.test('getTags.js', async t => {
  const getTags = require('../src/getTags.js')(
    [path.join(__dirname, 'data', 'library')]
  );
  const tags = getTags();
  assert(tags, 'have tags');
  assert.equal(tags[0], 'General', 'first tag is General');
});
