'use strict';
const assert = require('node:assert/strict');
const t = require('node:test');

const path = require('path');
const config = require('../src/getConfig.js');
config.databases = [path.join(__dirname, 'data', 'library')];
const getTags = require('../src/getTags.js');

t.test('getTags.js', async t => {
  const tags = getTags();
  assert(tags, 'have tags');
  assert.equal(tags[0], 'General', 'first tag is General');
});
