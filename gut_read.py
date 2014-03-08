#!/usr/bin/python

import sys
import cgi, cgitb
import re
import urllib2
from common import document
from common import flaf_tracer
from common import flaf_db
from common import flaf_indexer
cgitb.enable()


tracer = flaf_tracer.Tracer('gut_read')

form = cgi.FieldStorage()
action = form.getvalue('action') or ''

conn = flaf_db.newConn()
dbDao = flaf_db.DbDao(conn)

doc = document.Document()
doc.addCommonDeps();

if not action:
  doc.setTitle('Add Book')
  doc.bodyLine('''
      <form action="gut_read/crawl">
        <div>Gutenberg Id: <input type="text" name="gutId" /></div>
        <input type="submit" />
      </form>
      <div><a href='/'>Home</a></div>
      ''')
  doc.write()
  sys.exit(1)

elif action == 'crawl':
  gutId = form.getvalue('gutId')
  if gutId is None:
    errMsg = 'Error: Gutenberg Id must be set to add book. <br />' % gutId
    tracer.log(errMsg)
    doc.bodyLine(errMsg)
    doc.write()
    sys.exit(1)

  indexer = flaf_indexer.Indexer(conn)
 

  gutenbergUrl = 'http://www.gutenberg.org/cache/epub/%s/pg%s.txt'

  opener = urllib2.build_opener(urllib2.ProxyHandler({}))
  urllib2.install_opener(opener)

  rawText = urllib2.urlopen(gutenbergUrl % (gutId, gutId)).read()

  startIndex = re.search('^\*\*\* START [^\*]*\*\*', rawText, re.MULTILINE).end()
  endIndex = re.search('^\*\*\* END [^\*]*\*\*', rawText, re.MULTILINE).start()

  preamble = rawText[:startIndex]
  text = rawText[startIndex:endIndex]

  producedMatch = re.search('^Produced by.*', text, re.MULTILINE)
  if producedMatch and producedMatch.start() < 20:
    text = text[producedMatch.end():]


  secondEndMatch = re.search('^End of (the )?Project Gutenberg',
      text, re.MULTILINE)
  if secondEndMatch:
    text = text[:secondEndMatch.start()]

  titleMatch = re.search('Title: (.*)', preamble, re.MULTILINE)
  title = titleMatch.group(1)

  authorMatch = re.search('Author: (.*)', preamble, re.MULTILINE)
  author = authorMatch.group(1)

  tmpId = indexer.addBookToTmp(gutId, text)

  doc.setTitle('Add Book')
  doc.bodyLine('''
      <h2>Found:</h2>
      <form action="save">
        <div>Title: <input type="text" name="title" value="%s" style="width: 300px"/></div>
        <div>Author: <input type="text" name="author" value="%s" style="width: 300px"/></div>
        <input type="hidden" name="tmpId" value="%s" />
        <input type="submit" value="Confirm"/>
      </form>
      ''' % (title, author, tmpId))
  doc.bodyLine('''
    <div><a href='/gut_read'>Start Over</a>
    <div><a href='/'>Home</a></div>
    ''')
  doc.write()
  sys.exit(1)

elif action == 'save':
  tmpId = form.getvalue('tmpId') or ''
  title = form.getvalue('title') or ''
  author = form.getvalue('author') or ''

  indexer = flaf_indexer.Indexer(conn)
  indexer.deleteFromBooks(title, author)
  indexer.saveBookFromTmp(tmpId, title, author)

  doc.bodyLine('''
    <h2>Success!</h2>
    <div><a href='/gut_read'>Add Another</a>
    <div><a href='/'>Home</a></div>
    ''')
  doc.write()
  sys.exit(1)

  
