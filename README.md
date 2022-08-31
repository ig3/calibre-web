# calibre-web.js

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

## Installation & operation

Thus far, I just run it from the command line, but it would be easy to
install it globally and run it from systemd. I'll do that some day. For
now:

```
$ npm install
$ node calibre-web.js
```

It lostens on port 9000. Browse to http://localhost:9000.

I can access multiple Calibre databases. I have one local to my laptop with
what I want to have available when I'm offline or away from home and
another on my home server, accessed by NFS.

Most of the activity / load is in the browser, so the server doesn't have
to be efficient. But it runs all the time. Most of all, when it's not
processing a request I want it to be idle - not using system resources.
Node is fairly good at that. The server uses negligible resources compared
to the browser, though a few seconds of load when reloading the home page
with the list of books. I would change it if I had thousands of books, but
for a few hundred books, the simplicity is more important than performance
optimization. It works well enough.

Once the book is loaded, it works as well as Calibre-Web because they are
both running epub.js in the browser to display the book.

There is no provision for uploading books, editing them or their meta-data
or anything else. I do all that in Calibre. Calibre works well.
