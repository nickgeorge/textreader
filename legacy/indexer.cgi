#!/usr/bin/python

import cgi, cgitb
import re


form = cgi.FieldStorage()
title = form.getvalue('title')
title = 'Bartleby the Scrivener' if not bool(title) else title

cur = flaf_db.newConn().cursor()
cur.execute('DELETE FROM word_index WHERE title="' + title + '"')
db.commit()
cur.execute('SELECT text FROM rawtext where title="' + title + '"')

rawtext = ''

for row in cur.fetchall():
  rawtext = row[0]

# find all 'tokens', where a token is defined to be a consecutive string of
# non-whitespace characters, OR a consecutive string of hyphens
tokens =  re.findall('-+|[^\s-]+', rawtext)

# build pattern for 'words' where a word is defined to be a consecutive string
# of letters,
wordlikePattern = re.compile('[A-Za-z\']+')

for position, token in enumerate(tokens):
  wordMatch = wordlikePattern.search(token)
  word = token if not bool(wordMatch) else wordMatch.group(0).lower()
  cur.execute('INSERT INTO word_index (word, title, position, raw) VALUES ' +
      '(' +
          '"' + db.escape_string(word) + '", ' +
          '"' + title + '", ' +
          str(position) + ', ' +
          '"' + db.escape_string(token) + '"' +
      ')')
db.commit()

print 'Content-type:text/html\r\n\r\n'
print '<pre>done</pre>'
