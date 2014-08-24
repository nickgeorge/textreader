#!/usr/bin/python

import cgi, cgitb
import json
from common import flaf_db
from common import flaf_tracer
from common import flaf_types
from common import list_dao
from common import document

cgitb.enable()
tracer = flaf_tracer.Tracer('ListPageAction')

"""
  The main action for rendering the ListPage (textreader/).
  Gets a list of all instances of a word in a book, and then gets a context for
  the first 30.  The remaining contexts will be loaded via ajax from the
  client side js.

  Expects:
    word The word to search for.
    bookId The book to search in.
"""
form = cgi.FieldStorage()
word = form.getvalue('word') or 'windmills'
bookIdsString = form.getvalue('bookIds')
bookIds = map(int, bookIdsString.split(',')) if bookIdsString else [2]
listId = form.getvalue('listId')


conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn)

word = word.strip(' .\'')

if listId is not None:
  listDao = list_dao.ListDao(conn)
  bookIds = listDao.getBooksInList(listId)

tracer.log('Looking for [%s] in book %s' % (word, str(bookIds)))

# Package the contexts into a single data object
# to pass down to the client
data = {
  'word': word,
  'bookIds': bookIds,
  'contexts': dbDao.getContextsByIndex(bookIds, word, count=30),
  'books': dbDao.getAllBooks()
}
tracer.log('read contexts')

# Write it out in HTML for the browser.
# This is kept to the bare minimum:
#   creates a single content div
#   creates a single javascript page object with the data from the server
#   ensures the page is scrolled to the top
doc = document.Document()
doc.addCommonDeps();

doc.setTitle('Text Reader')
doc.require('list_page.js')

doc.bodyLine('<div id="main-content"></div>')
doc.bodyLine('<script>')
doc.bodyLine('  var page = new ListPage(%s);' % json.dumps(data))
doc.bodyLine('  page.render($(\'#main-content\')[0]);')
doc.bodyLine('  setTimeout(function(){$(\'body\').scrollTop(0);}, 0);')
doc.bodyLine('</script>')

doc.write()

tracer.log('wrote doc')
