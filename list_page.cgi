#!/usr/bin/python

import cgi, cgitb
import json
from utils import flaf_db
from utils import flaf_types
from utils import flaf_tracer
from utils import document

cgitb.enable()
tracer = flaf_tracer.Tracer('ListPageAction')

"""
  The main action for rendering the ListPage (textreader/).
  Gets a list of all instances of a word in a book, and then gets a context for
  the first 25.  The remaining books will be loaded via ajax from the
  client side js.

  Expects:
    word The word to search for.
    bookId The book to search in.
"""
form = cgi.FieldStorage()
word = form.getvalue('word') or 'windmills'
bookId = int(form.getvalue('bookId') or 2)

conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn, bookId)
cursor = conn.cursor()

tracer.log('made conn')

# Get position of all hits.  This should probably be moved into the dao.
cursor.execute('SELECT position FROM word_index ' +
    'WHERE book_id=%s AND word="%s" ' % (bookId, word) +
    'ORDER BY position ASC')

# Package the positions into context requests
contextRequests = []
for row in cursor.fetchall():
  contextRequests.append({
    'position': int(row[0]),
    'numWordsBefore': 25,
    'numWordsAfter': 25
  })
tracer.log('processed hits, reading contexts')

# Dao request for the contexts around the first 25 hits
contexts = dbDao.getContexts(contextRequests[0:25])

# Package it all up into a single data object to pass down to the client
data = {
  'word': word,
  'bookId': bookId,
  'totalHits': len(contextRequests),
  'books': dbDao.getAllBooks(),
  'contexts': contexts
}
tracer.log('read contexts')

# Write it out in HTML for the browser.
# This is kept to the bare minimum:
#   creates a single content div
#   creates a single javascript page object with the data from the server
#   ensures the page is scrolled to the top
doc = document.Document()

doc.setTitle('Text Reader')
doc.requireJs('list_page.js')
doc.requireSoy('list_page.soy')
doc.requireJs('hovercard.js')
doc.requireJs('searchbar.js')
doc.requireJs('menu.js')
doc.requireSoy('menu.soy')
doc.requireSoy('common.soy')
doc.requireJs('utils/soyutils.js')
doc.requireJs('utils/util.js')
doc.requireJs('utils/jquery/1.10.2/jquery.min.js')
doc.addCss('style.css')

doc.bodyLine('<div id="main-content"></div>')
doc.bodyLine('<script>')
doc.bodyLine('  var page = new ListPage(%s);' % json.dumps(data))
doc.bodyLine('  page.render($(\'#main-content\')[0]);')
doc.bodyLine('  setTimeout(function(){$(\'body\').scrollTop(0);}, 0);')
doc.bodyLine('</script>')

doc.write()

tracer.log('wrote doc')
