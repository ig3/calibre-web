'use strict';
const assert = require('node:assert/strict');
const t = require('node:test');

const path = require('path');
const config = require('../src/getConfig.js');
config.databases = [path.join(__dirname, 'data', 'library')];
// config.defaultTags = ['A', 'B', 'General'];
config.excludeTags = ['A', 'X'];
config.explicitOnly = ['B', 'Y'];
const app = require('../src/app.js');

let bookPath;
let coverPath;

t.test('app', async t => {
  const listener = app.listen();
  const port = listener.address().port;
  console.log('listening on port: ' + port);
  t.after(() => {
    listener.close();
  });
  await t.test('get /', t => {
    return fetch('http://localhost:' + port + '/')
    .then(response => {
      assert.equal(response.status, 200, 'Response status is 200');
      assert(response.headers.get('content-type').indexOf('text/html') !== -1, 'content type');
      return response.text();
    })
    .then(data => {
      assert(data.indexOf('html') !== -1, 'html document');
      data.split('\n')
      .forEach(line => {
        if (line.indexOf('cover') !== -1) {
          const matches = line.match(/src="(.*?)"/);
          coverPath = matches[1];
        }
        if (line.indexOf('href=') !== -1) {
          const matches = line.match(/href="(.*?)"/);
          bookPath = matches[1];
        }
      });
      assert(coverPath, 'page includes a cover URL');
    });
  });
  // tags=%5B%22BL%22%5D
  await t.test('get / with tags', t => {
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
    delete config.excludeTags;
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
      assert.equal(nBooks, 2, '2 books matched');
    });
  });
  await t.test('get /tags', t => {
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
    return fetch('http://localhost:' + port + bookPath)
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
    return fetch('http://localhost:' + port + bookPath + '/book.epub')
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
    return fetch('http://localhost:' + port + coverPath)
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
