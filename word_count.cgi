#!/usr/bin/python

import cgi, cgitb
import json
import document
import chunker
import flaf_types
import flaf_util
cgitb.enable()

form = cgi.FieldStorage()
bookId = int(form.getvalue('bookId') or 4)

conn = flaf_util.newConn()
cursor = conn.cursor()

data = {}


sqlCommand = ('SELECT word_counts.word, count ' +
    'FROM word_counts LEFT JOIN word_description ' +
        'ON word_counts.word=word_description.word ' +
    'WHERE COALESCE(common, FALSE) IS FALSE ' +
        'AND COALESCE(pronoun, FALSE) IS FALSE ' +
        'AND book_id = %s ' % bookId +
    'ORDER BY count DESC');
cursor.execute(sqlCommand)

data['wordCounts'] = []

for row in cursor.fetchall():
  word = row[0]
  count = int(row[1])
  data['wordCounts'].append([word, count])

doc = document.Document();

doc.requireJs('word_count_page.js')
doc.requireSoy('word_count_page.soy')
doc.requireJs('hovercard.js')
doc.requireJs('menu.js')
doc.requireSoy('menu.soy')
doc.requireJs('soy/soyutils.js')
doc.requireJs('utils/util.js')
doc.requireJs('utils/jquery/1.10.2/jquery.min.js')
doc.addCss('style.css')

doc.bodyLine('<div id="main-content"></div>')
doc.bodyLine('<script>')
doc.bodyLine('  var page = new WordCountPage(%s);' % json.dumps(data))
doc.bodyLine('  page.render($(\'#main-content\')[0]);')
doc.bodyLine('  setTimeout(function(){$(\'body\').scrollTop(0);}, 0);')
doc.bodyLine('//' + sqlCommand)
doc.bodyLine('</script>')

doc.write()
