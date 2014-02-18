#!/usr/bin/python

import sys
import cgi, cgitb
import json
from common import flaf_db
from common import document
from common import flaf_tracer

cgitb.enable()
dbDao = flaf_db.DbDao(flaf_db.newConn())
form = cgi.FieldStorage()
action = form.getvalue('action') or 'position'

if action == 'position':
  '''
    Ajax action for getting the context around one or more positions.

    Expects:
      positions Comma-delimited list of positions
      beforeCount How many words before the position to read
      afterCount How many words after the position to read

    Returns:
      Array of context objects (see flaf_types)
  '''
  tracer = flaf_tracer.Tracer('getcontext/position')
  positions = map(int, form.getvalue('positions').split(','))
  numBefore = int(form.getvalue('beforeCount'))
  numAfter = int(form.getvalue('afterCount'))
  bookId = int(form.getvalue('bookId'))

  # Turn each position into a request object that can be passed to the dao
  requests = map(lambda position: {
      'bookId': bookId,
      'position': position,
      'numWordsBefore': numBefore,
      'numWordsAfter': numAfter
    }, positions)

  document.writeJson(dbDao.getContexts(requests))
  tracer.log('finished request')

elif action == 'index':
  tracer = flaf_tracer.Tracer('getcontext/index')
  request = {
    'bookIds': map(int, form.getvalue('bookIds').split(',')),
    'word': form.getvalue('word'),
    'numWordsBefore': int(form.getvalue('beforeCount')),
    'numWordsAfter': int(form.getvalue('afterCount'))
  }

  if form.getvalue('startIndex'):
    request['startIndex'] = form.getvalue('startIndex')
  if form.getvalue('count'):
    request['count'] = form.getvalue('count')

  document.writeJson(dbDao.getContextsByIndex(**request))

  tracer.log('finished request')
