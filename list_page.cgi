#!/usr/bin/python

import cgi, cgitb
import json
from utils import flaf_db
from utils import flaf_types
from utils import flaf_tracer
from utils import document
cgitb.enable()

tracer = flaf_tracer.Tracer('ListPageAction')

form = cgi.FieldStorage()
word = form.getvalue('word') or 'windmills'
bookId = int(form.getvalue('bookId') or 2)

conn = flaf_db.newConn()
cursor = conn.cursor()

tracer.log('made conn')

cursor.execute('SELECT position FROM word_index ' +
    'WHERE book_id=%s AND word="%s" ' % (bookId, word) +
    'ORDER BY position ASC')

contextRequests = []
for row in cursor.fetchall():
  contextRequests.append({
    'position': int(row[0]),
    'numWordsBefore': 25,
    'numWordsAfter': 25
  })

tracer.log(contextRequests)

tracer.log('processed hits, reading contexts')

dbDao = flaf_db.DbDao(conn, bookId)

data = {
  'word': word,
  'bookId': bookId,
  'books': dbDao.getAllBooks(),
  'contexts': dbDao.getContexts(contextRequests)
}
tracer.log('read contexts')

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
