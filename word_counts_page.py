#!/usr/bin/python

import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import cgi, cgitb
import json
from common import document
from common import flaf_db
from common import flaf_tracer

cgitb.enable()


"""
  The main action for rendering the WordCountsPage (textreader/wordcounts).
  Gets the word counts for the 400 most common words, and renders the wordCounts
  html.

  Expects:
    bookId The book to search in.
"""
tracer = flaf_tracer.Tracer('word counts page')
form = cgi.FieldStorage()
bookId = int(form.getvalue('bookId') or 4)

conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn);

# Get wordcounts data for words 0 through 400
# This is an array of tuples of the form (word, counts)
wordCounts = dbDao.getWordCounts(bookId, 0, 400)

# Package all data into a single data object to pass to the client-side code
data = {
  'bookId': bookId,
  'books': dbDao.getAllBooks(),
  'wordCounts': wordCounts
}

doc = document.Document();
doc.addCommonDeps();

doc.setTitle('Word Counts')
doc.require('word_counts_page.js')

doc.bodyLine('<div id="main-content"></div>')
doc.bodyLine('<script>')
doc.bodyLine('  var page = new WordCountsPage(%s);' % json.dumps(data))
doc.bodyLine('  page.render($(\'#main-content\')[0]);')
doc.bodyLine('  setTimeout(function(){$(\'body\').scrollTop(0);}, 0);')
doc.bodyLine('</script>')

doc.write()

