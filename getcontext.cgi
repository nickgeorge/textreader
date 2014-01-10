#!/usr/bin/python

import sys
import cgi, cgitb
import json
import chunker
import document
import flaf_util
cgitb.enable()


form = cgi.FieldStorage()
position = int(form.getvalue('position'))
numBefore = int(form.getvalue('beforeCount'))
numAfter = int(form.getvalue('afterCount'))
bookId = form.getvalue('bookId')

chunker = chunker.Chunker(flaf_util.newConn(), bookId)

document.writeJsonHeader()
sys.stdout.write(json.dumps(chunker.getContext(position, numBefore, numAfter)))


