#!/usr/bin/python

import sys
import cgi, cgitb
import json
from utils import flaf_db
from utils import document
cgitb.enable()


form = cgi.FieldStorage()
position = int(form.getvalue('position'))
numBefore = int(form.getvalue('beforeCount'))
numAfter = int(form.getvalue('afterCount'))
bookId = form.getvalue('bookId')

dbDao = flaf_db.DbDao(flaf_db.newConn(), bookId)

document.writeJsonHeader()
sys.stdout.write(json.dumps(dbDao.getContext(position, numBefore, numAfter)))

