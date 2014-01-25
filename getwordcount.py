#!/usr/bin/python

import cgi, cgitb
import json
import sys
from common import document
from common import flaf_db

cgitb.enable()

"""
  Ajax action for getting a chunk of wordcounts data.

  Expects:
    bookId The id of the book to search
    startIndex How far down the list in frequency to start
        (nth most common word)
    count How many words to select

  Returns:
    Array of counts data.  This is an array of tuples of the form (word, counts)
"""
form = cgi.FieldStorage()
bookId = int(form.getvalue('bookId'))
startIndex = int(form.getvalue('startIndex'))
count = int(form.getvalue('count'))

conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn)

document.writeJsonHeader()
wordCounts = dbDao.getWordCounts(bookId, startIndex, count)
sys.stdout.write(json.dumps(wordCounts))
