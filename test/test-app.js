'use strict';
const t = require('@ig3/test');

const path = require('path');

t.test('app', t => {
  t.test('get /', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/')
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
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
      t.ok(coverPath, 'page includes a cover URL');
      t.equal(nBooks, 3, '3 books matched');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  // tags=%5B%22BL%22%5D
  t.test('get / with tags', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22Physics%22%5D',
      },
    })
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      t.equal(nBooks, 0, 'no books matched');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get / with tag !All', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22!All%22%5D',
      },
    })
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      t.equal(nBooks, 4, '4 books matched');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get / with tag Fiction', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22Fiction%22%5D',
      },
    })
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      t.equal(nBooks, 1, 'one book matched');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get / with tag All', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22All%22%5D',
      },
    })
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      t.equal(nBooks, 1, 'one book matched');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get / with tag All, no excluded tags', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22All%22%5D',
      },
    })
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      t.equal(nBooks, 2, '2 books matched');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get / with bad tags', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    const consoleError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
      errorCount++;
      consoleError(...args);
    };
    return fetch('http://localhost:' + port + '/', {
      headers: {
        Cookie: 'tags=%5B%22All%22%5Dxx',
      },
    })
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      t.equal(errorCount, 2, 'errors logged');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      let nBooks = 0;
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('class="book"') !== -1) {
          nBooks++;
        }
      });
      t.equal(nBooks, 1, '1 book matched');
    })
    .finally(() => {
      console.error = consoleError;
      listener.close();
      t.end();
    });
  });
  t.test('get /tags', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/tags')
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      t.ok(data.indexOf('General') !== -1, 'test tag');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get /tags with cookies', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/tags', {
      headers: {
        Cookie: 'tags=%5B%22General%22%5D',
      },
    })
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.ok(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data.indexOf('html') !== -1, 'html document');
      t.ok(data.indexOf('Selected: General') !== -1, 'General tag is selected');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get /book', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/book/d3e331de-75a8-4d27-98e3-3024c1c3b710')
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.equal(response.headers.get('content-type'), 'text/html; charset=utf-8', 'content type');
      return response.text();
    })
    .then(bodyText => {
      t.ok(bodyText, 'got a body');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get invalid /book', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/book/no-such-book')
    .then(response => {
      t.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(bodyText => {
      t.ok(bodyText, 'got a body');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get /book epub', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/book/d3e331de-75a8-4d27-98e3-3024c1c3b710' + '/book.epub')
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.equal(response.headers.get('content-type'), 'application/epub+zip', 'content type');
      return response.text();
    })
    .then(bodyText => {
      t.ok(bodyText, 'got a body');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get invalid /book epub', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/book/no-such-uuid/book.epub')
    .then(response => {
      t.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(bodyText => {
      t.ok(bodyText, 'got a body');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get /cover', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/cover/d3e331de-75a8-4d27-98e3-3024c1c3b710/cover.jpg')
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.equal(response.headers.get('content-type'), 'image/jpeg', 'content type');
      t.equal(response.headers.get('content-length'), '49123', 'content length');
      return response.blob();
    })
    .then(blob => {
      t.ok(blob, 'got a blob');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get invalid /cover', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/cover/no-such-book/cover.jpg')
    .then(response => {
      t.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(bodyText => {
      t.ok(bodyText, 'got a body');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get /css/main.css', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/css/main.css')
    .then(response => {
      t.equal(response.status, 200, 'Response status is 200');
      t.equal(response.headers.get('content-type'), 'text/css; charset=UTF-8', 'content type');
      return response.text();
    })
    .then(data => {
      t.ok(data, 'got data');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.test('get /bad/path', t => {
    const app = require('../src/app.js')({
      databases: [path.join(__dirname, 'data', 'library')],
      excludeTags: ['A', 'X'],
      explicitOnly: ['B', 'Y'],
    });
    const listener = app.listen();
    const port = listener.address().port;
    return fetch('http://localhost:' + port + '/bad/path')
    .then(response => {
      t.equal(response.status, 404, 'Response status is 404');
      return response.text();
    })
    .then(data => {
      t.ok(data, 'got data');
    })
    .finally(() => {
      listener.close();
      t.end();
    });
  });
  t.end();
});
