#!/usr/bin/python

import cgi, cgitb
import json
from common import flaf_db
from common import flaf_types
from common import flaf_tracer
from common import document

cgitb.enable()
tracer = flaf_tracer.Tracer('WordMapAction')

form = cgi.FieldStorage()
bookIds = map(int, form.getvalue('bookIds').split(','))

conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn)
cursor = conn.cursor()

# tracer.log('Looking for [%s] in book %s' % (word, bookId))

data = {
  'uncommonShared': dbDao.getUncommonShared(bookIds),
  'commonUnsharedMap': dbDao.getCommonUnshared(bookIds, 7)
}

# Package the contexts into a single data object
# to pass down to the client


# Write it out in HTML for the browser.
# This is kept to the bare minimum:
#   creates a single content div
#   creates a single javascript page object with the data from the server
#   ensures the page is scrolled to the top
doc = document.Document()

doc.setTitle('Word Map')
doc.requireJs('word_map_page.js')
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
doc.bodyLine('  var page = new WordMapPage(%s);' % json.dumps(data))
# doc.bodyLine('  page.render($(\'#main-content\')[0]);')
doc.bodyLine('  setTimeout(function(){$(\'body\').scrollTop(0);}, 0);')
doc.bodyLine('</script>')

doc.write()

tracer.log('wrote doc')
