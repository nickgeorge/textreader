#!/usr/bin/python

# Import modules for CGI handling
import cgi, cgitb
import json
import document
import flaf_db
import flaf_types

cgitb.enable()

form = cgi.FieldStorage()
word = form.getvalue('word') or 'windmills'
bookId = int(form.getvalue('bookId') or 2)

conn = flaf_db.newConn()
cursor = conn.cursor()

cursor.execute('SELECT position,word,raw FROM word_index ' +
    'WHERE book_id=%s AND word="%s"' % (bookId, word))
hitTokens = []
for row in cursor.fetchall():
  hitTokens.append(flaf_types.readToken(row))


dbDao = flaf_db.DbDao(conn, bookId)
unsortedHits = [];
for token in hitTokens:
  unsortedHits.append(dbDao.getContext(token['position'], 25, 25))

data = {
  'word': word,
  'bookId': bookId,
  'books': dbDao.getAllBooks(),
  'contexts': sorted(unsortedHits, key=lambda hit: hit['token']['position'])
}

doc = document.Document()

doc.requireJs('list_page.js')
doc.requireSoy('list_page.soy')
doc.requireJs('hovercard.js')
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
