'use strict';
const assert = require('node:assert/strict');
const t = require('node:test');

const path = require('path');

t.test('app', async t => {
  await t.test('get /', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
    });
    return fetch('http://localhost:' + port + '/')
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      let coverPath;
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
        if (line.indexOf('cover') !== -1) {
          const matches = line.match(/src="(.*?)"/);
          coverPath = matches[1];
        }
      });
      assert(coverPath, 'page includes a cover URL');
      assert.equal(nBooks, 3, '3 books matched');
    });
  });
  // tags=%5B%22BL%22%5D
  await t.test('get / with tags', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22Physics%22%5D',
      },
    })
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      assert.equal(nBooks, 0, 'no books matched');
    });
  });
  await t.test('get / with tag !All', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22!All%22%5D',
      },
    })
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      assert.equal(nBooks, 4, '4 books matched');
    });
  });
  await t.test('get / with tag Fiction', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22Fiction%22%5D',
      },
    })
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      assert.equal(nBooks, 1, 'one book matched');
    });
  });
  await t.test('get / with tag All', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22All%22%5D',
      },
    })
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      assert.equal(nBooks, 1, 'one book matched');
    });
  });
  await t.test('get / with tag All, no excluded tags', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22All%22%5D',
      },
    })
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      assert.equal(nBooks, 2, '2 books matched');
    });
  });
  await t.test('get / with bad tags', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const consoleError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
      errorCount++;
      consoleError(...args);
    };
    t.after(() => {
      console.error = consoleError;
    });
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22All%22%5Dxx',
      },
    })
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      assert.equal(errorCount, 2, 'errors logged');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      assert.equal(nBooks, 1, '1 book matched');
    });
  });
  await t.test('get /tags', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/tags')
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      assert(data.indexOf('General') !== -1, 'test tag');
    });
  });
  await t.test('get /tags with cookies', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/tags', {
      headers: {
        Cookie: 'tags=%5B%22General%22%5D',
      },
    })
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      assert(data.indexOf('Selected: General') !== -1, 'General tag is selected');
    });
  });
  await t.test('get /book', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/book/d3e331de-75a8-4d27-98e3-3024c1c3b710')
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8', 'content type');
      return response.text();
    })
    .then(bodyText => {
      assert(bodyText, 'got a body');
    });
  });
  await t.test('get invalid /book', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/book/no-such-book')
    .then(response => {
      assert.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(bodyText => {
      assert(bodyText, 'got a body');
    });
  });
  await t.test('get /book epub', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/book/d3e331de-75a8-4d27-98e3-3024c1c3b710' + '/book.epub')
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert.equal(response.headers.get('content-type'), 'application/epub+zip', 'content type');
      return response.text();
    })
    .then(bodyText => {
      assert(bodyText, 'got a body');
    });
  });
  await t.test('get invalid /book epub', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/book/no-such-uuid/book.epub')
    .then(response => {
      assert.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(bodyText => {
      assert(bodyText, 'got a body');
    });
  });
  await t.test('get /cover', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/cover/d3e331de-75a8-4d27-98e3-3024c1c3b710/cover.jpg')
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert.equal(response.headers.get('content-type'), 'image/jpeg', 'content type');
      assert.equal(response.headers.get('content-length'), '49123', 'content length');
      return response.blob();
    })
    .then(blob => {
      assert(blob, 'got a blob');
    });
  });
  await t.test('get invalid /cover', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/cover/no-such-book/cover.jpg')
    .then(response => {
      assert.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(bodyText => {
      assert(bodyText, 'got a body');
    });
  });
  await t.test('get /css/main.css', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/css/main.css')
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert.equal(response.headers.get('content-type'), 'text/css; charset=UTF-8', 'content type');
      return response.text();
    })
    .then(data => {
      assert(data, 'got data');
    });
  });
  await t.test('get /bad/path', t => {
    const port = setup(t, {
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    return fetch('http://localhost:' + port + '/bad/path')
    .then(response => {
      assert.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(data => {
      assert(data, 'got data');
    });
  });
});

function setup (t, config) {
  const app = require('../src/app.js')(config);
  const listener = app.listen();
  const port = listener.address().port;
  t.after(() => {
    listener.close();
  });
  return port;
}
