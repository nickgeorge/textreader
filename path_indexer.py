#!/usr/bin/python

import cgi, cgitb
import sys
from common import document
from common import flaf_db
from common import flaf_indexer
cgitb.enable()

form = cgi.FieldStorage()
gutId = form.getvalue('gutId')
title = form.getvalue('title')
author = form.getvalue('author')

conn = flaf_db.newConn()
indexer = flaf_indexer.Indexer(conn)
bookId = indexer.addToBooksByGutId(title, author, gutId)
# indexer.addToWordIndex(13)


document.writeHeader()
sys.stdout.write("Done")

