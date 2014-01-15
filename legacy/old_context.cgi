#!/usr/bin/python

# Import modules for CGI handling
import sys
import cgi, cgitb
import MySQLdb

form = cgi.FieldStorage()
word = form.getvalue('word')
word = 'scrivener' if not bool(word) else word
title = form.getvalue('title')
title = 'Bartleby the Scrivener' if not bool(title) else title

db = MySQLdb.connect(host="localhost", # your host, usually localhost
    user="root", # your username
    passwd="fd360", # your password
    db="first_test") # name of the data base

cur = db.cursor()

cur.execute('SELECT position FROM word_index WHERE title="' + title + '"' +
    'AND word="' + word + '"')

positions = [];
for row in cur.fetchall():
  positions.append(int(row[0]))

print "Content-type:text/html\r\n\r\n"

for position in positions:
  print('...')
  cur.execute('SELECT position,raw FROM word_index ' +
      'WHERE position>=%s and position<%s AND raw IS NOT NULL ' % (max(0, position - 25), position + 25) +
      'AND title="' + title + '" ' +
      'ORDER BY position')
  for row in cur.fetchall():
    if int(row[0]) == position:
      sys.stdout.write('<strong style="color: red;">' + row[1] + '</strong>')
    else:
      sys.stdout.write(row[1])
    sys.stdout.write(' ');
  print('...')
  print('<hr>')
