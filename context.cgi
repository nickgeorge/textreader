#!/usr/bin/python

# Import modules for CGI handling
import cgi, cgitb
import json
import document
import chunker
import flaf_types
import flaf_util
cgitb.enable()

form = cgi.FieldStorage()
word = form.getvalue('word') or 'windmills'
bookId = int(form.getvalue('bookId') or 2)

conn = flaf_util.newConn()
cursor = conn.cursor()

cursor.execute('SELECT position,word,raw FROM word_index ' +
    'WHERE book_id=%s AND word="%s"' % (bookId, word))
hitTokens = []
for row in cursor.fetchall():
  hitTokens.append(flaf_types.readToken(row))

data = {}

chunker = chunker.Chunker(conn, bookId)

unsortedHits = [];
for token in hitTokens:
  unsortedHits.append(chunker.getContext(token['position'], 25, 25))

data['contexts'] = sorted(unsortedHits,
    key=lambda hit: hit['token']['position'])
data['word'] = word
data['bookId'] = bookId
data['books'] = {};

cursor.execute('SELECT book_id, title, author FROM books')
for row in cursor.fetchall():
  book = flaf_types.readBook(row)
  data['books'][row[0]] = book

doc = document.Document()

doc.requireJs('list_page.js')
doc.requireSoy('list_page.soy')
doc.requireJs('hovercard.js')
doc.requireJs('menu.js')
doc.requireSoy('menu.soy')
doc.requireJs('soy/soyutils.js')
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
