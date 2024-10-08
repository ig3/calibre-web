# calibre-web.js

A simple web server that serves epub books from local
[Calibre](https://github.com/kovidgoyal/calibre) databases.

## Installation
```
$ npm install -g @ig3/calibre-web
```

## Operation
The package provides an executable: `calibre-web`

Run this to start the server:

```
$ calibre-web
```

It listens on port 9000.

Browse to http://localhost:9000.

It can be started by systemd. For example:

```
[Unit]
Description=Calibre Web server

[Service]
Type=simple
Restart=on-failure
WorkingDirectory=/tmp
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=calibre-web
ExecStart=calibre-web

[Install]
WantedBy=default.target
```

This can be installed as a system service or a per-user service. See the
systemd documentation for details of setting up a service.


## Configuration

Configuration may be stored in:

 * /etc/calibre-web.json
 * ~/.calibre-web.json
 * ~/.config/calibre-web.json

For example:

```
{
  "port": 1234,
  "databases": [
    "/usr/local/calibre",
    "/usr/share/calibre1",
    "/usr/share/calibre2"
  ],
  "excludeTags": [
    "hidden",
    "private"
  ],
  "showUntagged": true
}
```
### port

The port the server should listen on.

### databases

An array of paths to Calibre data directories, containing the `metadata.db`
files.

### defaultTags

An array of tags that will be selected by default (i.e. if no other tags
are selected).

### excludeTags

An array of tags for which books having any of these tags will be excluded
from the book list.

### explicitOnly

An array of tags that must be explicitly selected in order for books with
those tags to be presented in the book list.


### showUntagged

Set this to true if books without tags should be shown in the book list.


## Features

This only serves epub files. Other content of the Calibre database will be
ignored.

The home page shows the cover image, title and author of each book, sorted
by timestamp which, I think, is the time the book was added to Calibre.

It can read multiple Calibre databases but they must be local: the Calibre
database is read from a file path. 

Server load is fairly light. Just a node process running an Express
website. When not processing a request it should not consume CPU. 

It uses epub.js in the browser to display the book. Once the book is
downloaded, there is no more load on the server as it is browsed.

## System Requirements

I have only run this on Debian Linux. Not tested on other distributions or
operating systems.

Requires [Node.js](https://nodejs.org). I am running it on v18.13.0. Not
tested on other versions.

When idle, with a couple of Calibre libraries totaling over 500 books, top
reports under 50K physical memory consumed and 0% CPU. It occupies a little
under 25MB disk space. 

## Dependencies

In addition to those listed in package.json, this depends on
[@ig3/epub.js](https://github.com/ig3/epub.js) and
jszip.min.js, included in the public/js directory. 


## Motivation

I used [Calibre-web](https://github.com/janeczku/calibre-web) for a while,
to view epub books in my browser where I use the
[@ig3/zhongwen](https://addons.mozilla.org/en-US/firefox/addon/ig3-zhongwen/)
add-on to look up Chinese characters, to help my study of Chinese. When I
was setting up a new laptop, I wanted something easier to install,
configure and customize. All the books I study are epub format, so I don't
need support for other formats. Calibre makes it easy to convert other
ebook formats to epub, except for PDF, which is difficult no matter what
tools.

I have built calibre-web on
[a fork of epub.js](https://github.com/ig3/epub.js),
modified for better navigation in Chinese texts, which don't have spaces
separating words.

## Changes

### 1.0.8 - 20230410

Update dependencies.

### 1.0.9 - 20240506
 * Up and down arrow keys for prev and next chapter navigation
 * Handle sub-chapters in toc
 * Fix updateToc to handle href with fragment
 * Fix toc / navigation
 * Update dependencies

### 1.0.10 - 20240611
 * Revised tag filtering
 * Add ~/.config/calibre-web.json config file path

### 1.0.11 - 20240705
 * Fix tag list handling
 * Update dependencies
 * Remove dev dependencies on tape and multi-tape
 * Refactor the server implementation
 * Add tests

### 1.0.12 - WIP
 * Restore default port 9000
 * Refactor again
 * Rewrite tests based on @ig3/test
 * Replace `node --test` with multi-tape test runner
 * listen for keydown instead of keypress events
