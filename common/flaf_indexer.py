#!/usr/bin/python

import sys,getopt
import cgi, cgitb
import json
import re
import urllib2
import flaf_tracer
import flaf_db

cgitb.enable()

class Indexer:
  def __init__(self, conn):
    self.conn = conn
    self.cursor = conn.cursor()

  def addToBooksByPath(self, title, author, path):
    self.cursor.execute('INSERT INTO books (title, author, text) ' +
        'VALUES ("%s", "%s", LOAD_FILE("%s"))' % (
            self.conn.escape_string(title),
            self.conn.escape_string(author),
            self.conn.escape_string(path)
        ))
    self.conn.commit()
    return int(self.cursor.lastrowid)

  def addToWordIndex(self, bookId):
    self.cursor.execute('SELECT text FROM books WHERE book_id=' + str(bookId))

    rawtext = ''

    for row in self.cursor.fetchall():
      rawtext = row[0]

    # find all 'tokens', where a token is defined to be a consecutive string of
    # non-whitespace characters, OR a consecutive string of hyphens.
    # The hypens are necessary because-and this is a demonstration-use hypens
    # w
    tokens =  re.findall('-+|[^\s-]+', rawtext)

    # build pattern for 'words' where a word is defined to be a consecutive string
    # of letters,
    wordlikePattern = re.compile('[A-Za-z\']+')

    counts = {}
    indexArray = [];
    for position, token in enumerate(tokens):
      wordMatch = wordlikePattern.search(token)
      word = token if not bool(wordMatch) else wordMatch.group(0).lower()
      escapedWord = self.conn.escape_string(word)

      if escapedWord in counts:
        counts[escapedWord] += 1
      else:
        counts[escapedWord] = 1


      indexArray.append((
          escapedWord,
          bookId,
          position,
          self.conn.escape_string(token)
      ))

    countsArray = []
    for word in counts:
      if (len(word) > 30):
        print(word)
      countsArray.append(
          (bookId, self.conn.escape_string(word), counts[word]))

    self.cursor.execute('INSERT INTO word_counts (book_id, word, count) VALUES ' +
        ', '.join(map(str, countsArray)))

    totalWords = len(indexArray)
    for i in range(0, totalWords, 100000):
      self.cursor.execute('INSERT INTO word_index (word, book_id, position, raw) VALUES ' +
          ', '.join(map(str, indexArray[i:min(i + 100000, totalWords)])))

    self.conn.commit()

def main(argv):
  optsList = getopt.getopt(argv, [], ['title=' ,'author=', 'path='])[0]
  opts = dict(optsList)
  indexer = Indexer(flaf_db.newConn())
  bookId = indexer.addToBooks(opts['--title'], opts['--author'], opts['--path'])
  indexer.addToWordIndex(13)

if __name__ == "__main__":
   main(sys.argv[1:])
