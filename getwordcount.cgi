#!/usr/bin/python

import cgi, cgitb
import json
import document
import flaf_db
import sys
cgitb.enable()

form = cgi.FieldStorage()
startIndex = int(form.getvalue('startIndex'))
count = int(form.getvalue('count'))
bookId = int(form.getvalue('bookId'))

conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn, bookId);

document.writeJsonHeader()
sys.stdout.write(json.dumps(dbDao.getWordCounts(startIndex, count)))
