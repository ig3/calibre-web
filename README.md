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

There are only two parameters:

 * port: the port the server should listen on
 * databases: an array of paths to Calibre databases to be read

The database paths are the paths of the directories containing the
`metadata.db` files.

For example:

```
{
  "port": 1234,
  "databases": [
    "/usr/local/calibre",
    "/usr/share/calibre1",
    "/usr/share/calibre2"
  ]
}
```

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


## Motivation

I wrote this because I wanted something I could install easily on my laptop
for viewing epub books in my browser.

I was studying Chinese, in part by reading. I used a browser plugin to
lookup characters. I couldn't do this in Calibre or any PDF reader. I had
installed [Calibre-web](https://github.com/janeczku/calibre-web) on my
home server. It worked well when I was at home, but I wanted something on
my laptop that I could use when I'm offline or away from home. I considered
installing Calibre-Web again but didn't have Python on my laptop and, once
again, I was turned off by the mess of Python versions and installers. Not
a single guide on the Python website or anywhere else I could find in a
couple of hours of searching, described how to install a personal copy of
Python, without root access and with no prior Pyton on the system. Lots of
guidance on setting up virtual environments. All absurdly complicated and
all dependent on already having Python installed.

I had already looked at the Calibre-web code to fix its excessive browser
history production when I looked up Chinese characters (a history event
every time a selection occurred - more than one per character in a book I
read, on average). I knew it used
[epub.js](https://github.com/futurepress/epub.js) to display the epub books
and that's all I needed to read them in my browser.

So, I quickly threw together this server to list the epub books in my
[Calibre](https://github.com/kovidgoyal/calibre) databases and display them
in the browser using epub.js. It wasn't hard.

This is much smaller and easier to install than Calibre-Web. It is based on
[NodeJS](https://nodejs.org/en/) rather than Python. Node is easier to
install than Pyton with simple version control, virtual environments and
non-root installs, although, because it isn't two incompatible languages
with the same name, using it doesn't cause the headaches that using Python
does. And It's all JavaScript which is the language I use for most of my
programming these days, so I don't have to deal with Python's significant
whitespace, opinionated tools and related nonsense. I don't have to deal
with any more PEP talks.

## Changes

It's early days yet. Not published and too unsettled for changes to be
noteworthy. See the git log and code for details.
