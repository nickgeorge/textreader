#!/usr/bin/python

import cgi, cgitb
import json
from utils import document
from utils import flaf_db
cgitb.enable()

form = cgi.FieldStorage()
bookId = int(form.getvalue('bookId') or 4)

conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn, bookId);

data = {
  'bookId': bookId,
  'books': dbDao.getAllBooks(),
  'wordCounts': dbDao.getWordCounts(0, 400)
}

doc = document.Document();

doc.setTitle('Word Counts')
doc.requireJs('word_counts_page.js')
doc.requireSoy('word_counts_page.soy')
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
doc.bodyLine('  var page = new WordCountsPage(%s);' % json.dumps(data))
doc.bodyLine('  page.render($(\'#main-content\')[0]);')
doc.bodyLine('  setTimeout(function(){$(\'body\').scrollTop(0);}, 0);')
doc.bodyLine('</script>')

doc.write()

