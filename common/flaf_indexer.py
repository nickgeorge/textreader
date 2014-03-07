#!/usr/bin/python

import sys
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
    self.tracer = flaf_tracer.Tracer('Indexer')


  def addToBooksByPath(self, title, author, path):
    self.cursor.execute('INSERT INTO books (title, author, text) ' +
        'VALUES ("%s", "%s", LOAD_FILE("%s"))' % (
            self.conn.escape_string(title),
            self.conn.escape_string(author),
            self.conn.escape_string(path)
        ))
    self.conn.commit()
    return int(self.cursor.lastrowid)


  def addToBooksByText(self, title, author, text):
    self.cursor.execute('INSERT INTO books (title, author, text) ' +
        'VALUES ("%s", "%s", "%s")' % (
            self.conn.escape_string(title),
            self.conn.escape_string(author),
            self.conn.escape_string(text)
        ))
    self.conn.commit()
    return int(self.cursor.lastrowid)


  def deleteFromIndexes(self, bookId, deleteFromBooks=False):
    self.cursor.execute('DELETE FROM word_index WHERE book_id = %s' % bookId);
    self.cursor.execute('DELETE FROM word_counts WHERE book_id = %s' % bookId);
    if deleteFromBooks:
      self.cursor.execute('DELETE FROM books WHERE book_id = %s' % bookId)
    self.conn.commit()

  # def deleteBookByTitleAndAuthor(self, title, author):
  #   self.cursor.execute(

  def addToIndexes(self, bookId):
    self.cursor.execute('SELECT text FROM books WHERE book_id=' + str(bookId))

    rawtext = ''

    for row in self.cursor.fetchall():
      rawtext = row[0]

    # find all 'tokens', where a token is defined to be a consecutive string of
    # non-hyphen non-whitespace characters.  Hyphens (and groups of hyphens must
    # be treated as separate tokens because some authors-I won't name names-use
    # hyphens like that.
    tokens =  re.findall('-+|[^\s-]+', rawtext)

    # build pattern for 'words' where a word is defined to be a consecutive string
    # of letters, numbers, and single-quotes, not counting initial or trailing
    # single quotes
    wordlikePattern = re.compile('[A-Za-z0-9]+([\'\.]+[A-Za-z0-9]+)*')

    counts = {}
    indexArray = [];
    for position, token in enumerate(tokens):
      wordMatch = wordlikePattern.search(token)
      word = token if not bool(wordMatch) else wordMatch.group(0).lower()
      word = word

      if word in counts:
        counts[word] += 1
      else:
        counts[word] = 1

      indexArray.append((
          word,
          bookId,
          position,
          token
      ))

    countsArray = []
    for word in counts:
      if (len(word) > 30):
        print('Too long: ' + word)
      countsArray.append(
          (bookId, word, counts[word]))

    wordCountsInsertCommand = ('INSERT INTO word_counts (book_id, word, count) ' +
        'VALUES ' +
            ', '.join(map(str, countsArray)))

    # self.tracer.log(wordCountsInsertCommand)

    self.cursor.execute(wordCountsInsertCommand)

    totalWords = len(indexArray)
    for i in range(0, totalWords, 100000):
      self.cursor.execute(
          'INSERT INTO word_index (word, book_id, position, raw) ' +
          'VALUES ' +
              ', '.join(map(str, indexArray[i:min(i + 100000, totalWords)])))

    self.conn.commit()


  def indexByGutenbergId(self, gutId, title, author):
    self.cursor.execute('SELECT book_id FROM books WHERE ' +
        'title=\'%s\' AND author=\'%s\'' % (title, author))

    for row in self.cursor.fetchall():
      self.deleteFromIndexes(row[0], deleteFromBooks=True)
      self.tracer.log(str(row[0]))

    gutenbergUrl = 'http://www.gutenberg.org/cache/epub/%s/pg%s.txt';

    opener = urllib2.build_opener(urllib2.ProxyHandler({}))
    urllib2.install_opener(opener)

    text = urllib2.urlopen(gutenbergUrl % (gutId, gutId)).read()

    startIndex = re.search('^\*\*\* START [^\*]*\*\*\*', text, re.MULTILINE).end()
    endIndex = re.search('^\*\*\* END [^\*]*\*\*\*', text, re.MULTILINE).start()

    text = text[startIndex:endIndex]

    producedMatch = re.search('^Produced by.*', text, re.MULTILINE)
    if producedMatch and producedMatch.start() < 20:
      text = text[producedMatch.end():]


    secondEndMatch = re.search('^End of (the )?Project Gutenberg',
        text, re.MULTILINE)
    if secondEndMatch:
      text = text[:secondEndMatch.start()]
    bookId = self.addToBooksByText(title, author, text)
    self.addToIndexes(bookId)




