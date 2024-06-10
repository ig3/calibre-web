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

An array of tags. Books with these tags will be included in the book list
if no tags are specified tags cookie of the request.

### excludeTags

An array of tags. Books with these tags will be excluded from the book
list.

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

I used [Calibre-web](https://github.com/janeczku/calibre-web) for a while
but when I was setting up a new laptop I wanted something easier to
install. I had been running a modified version of Calibre-web and wanted an
all JavaScript implementation.

## Changes

### 1.0.8 - 20230410

Update dependencies.

### 1.0.9 - 20240506
 * Up and down arrow keys for prev and next chapter navigation
 * Handle sub-chapters in toc
 * Fix updateToc to handle href with fragment
 * Fix toc / navigation
 * Update dependencies
