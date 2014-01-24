#!/usr/bin/python

import sys
import cgi, cgitb
import json
from common import flaf_db
from common import document
from common import flaf_tracer

cgitb.enable()
tracer = flaf_tracer.Tracer('getcontext cgi')

"""
  Ajax action for getting the context around one or more positions.

  Expects:
    positions Comma-delimited list of positions
    beforeCount How many words before the position to read
    afterCount How many words after the position to read

  Returns:
    Array of context objects, each of which contains the word position,
    an array of words before and an array of words after
"""
form = cgi.FieldStorage()
positions = map(int, form.getvalue('positions').split(','))
numBefore = int(form.getvalue('beforeCount'))
numAfter = int(form.getvalue('afterCount'))
bookId = form.getvalue('bookId')


# Turn each position into a "request" object that can be passed to the dao
requests = map(lambda position: {
    'position': positions[0],
    'numWordsBefore': numBefore,
    'numWordsAfter': numAfter
  }, positions)

dbDao = flaf_db.DbDao(flaf_db.newConn(), bookId)
contexts = dbDao.getContexts(requests)

tracer.log('got data')

document.writeJsonHeader()
sys.stdout.write(json.dumps(contexts))

tracer.log("wrote doc")
