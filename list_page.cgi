#!/usr/bin/python

import cgi, cgitb
import json
from common import flaf_db
from common import flaf_types
from common import flaf_tracer
from common import document

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

tracer.log('Looking for [%s] in book %s' % (word, bookId))

contexts = dbDao.getContextsByIndex(word, count=25)

# Package the contexts into a single data object
# to pass down to the client
data = {
  'word': word,
  'bookId': bookId,
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
doc.requireJs('common/hovercard.js')
doc.requireJs('common/searchbar.js')
doc.requireJs('common/menu.js')
doc.requireSoy('menu.soy')
doc.requireSoy('common.soy')
doc.requireJs('common/utils/soyutils.js')
doc.requireJs('common/utils/util.js')
doc.requireJs('common/utils/extensions.js')
doc.requireJs('common/utils/jquery/1.10.2/jquery.min.js')
doc.addCss('style.css')
doc.addCss('common/common.css')

doc.bodyLine('<div id="main-content"></div>')
doc.bodyLine('<script>')
doc.bodyLine('  var page = new ListPage(%s);' % json.dumps(data))
doc.bodyLine('  page.render($(\'#main-content\')[0]);')
doc.bodyLine('  setTimeout(function(){$(\'body\').scrollTop(0);}, 0);')
doc.bodyLine('</script>')

doc.write()

tracer.log('wrote doc')
