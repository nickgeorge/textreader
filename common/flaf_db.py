#!/usr/bin/python3

import flaf_types
import cgitb,sys
import MySQLdb
import flaf_tracer
cgitb.enable()


"""
  Creates a database connection.  I *think* this should be limited to one per
  thread, but I'm not sure how much it matters.
"""
def newConn():

  with file('/Users/nickgeorge/pwd/password.txt', 'r') as f:
      pw = f.read()

  return MySQLdb.connect(host='www.biologicalspeculation.com',
    user='textreader',
    passwd= pw.strip(' \n'),
    db='flaf')

"""
  Data-access object (dao) for accessing mysql database.
  All complicated/common (all period?) mysql operations should be done through
  this object.
"""
class DbDao:
  def __init__(self, conn):
    self.conn = conn
    self.cursor = conn.cursor()
    self.tracer = flaf_tracer.Tracer('DbDao')

    #self.cursor.execute('SET NAMES utf8')

  """
    Returns an array of all books (see flaf_types)
  """
  def getAllBooks(self):
    books = {};
    self.cursor.execute('SELECT book_id, title, author FROM books')
    for row in self.cursor.fetchall():
      books[row[0]] = flaf_types.readBook(row)
    return books

  """
    Takes a start and end position, and returns an array of tokens between them
    (see flaf_types)
  """
  def chunk(self, bookId, start, end):
    self.cursor.execute('SELECT book_id, position, word, raw FROM word_index ' +
        'WHERE position BETWEEN %s AND %s ' % (start, end) +
        'AND raw IS NOT NULL ' +
        'AND book_id ="%s" ' % bookId +
        'ORDER BY position')
    tokens = []
    for row in self.cursor.fetchall():
      tokens.append(flaf_types.readToken(row))
    return tokens

  """
    Gets the surrounding context of a position.
    Returns an array of tokens starting at position - numWordsBefore,
      and ending at position + numWordsAfter
  """
  def getContext(self, bookId, position, numWordsBefore, numWordsAfter):
    tokens = self.chunk(bookId,
        position - numWordsBefore, position + numWordsAfter)
    context = {
      'bookId': bookId,
      'token': None,
      'before': [],
      'after': []
    }
    for token in tokens:
      if token['position'] < position:
        context['before'].append(token)
      if token['position'] > position:
        context['after'].append(token)
      if token['position'] == position:
        context['token'] = token

    return context;

  """
    Gets an array of contexts, based on an array of requests.
    The requests are the arguments that would have been passed to getContext,
    e.g.,
      request = {
        position: number,
        numWordsBefore: number,
        numWordsAfter: number
      }

    This is preferable to calling getContext once per request, as it packages
    all the requests into a single mysql request (big win).

    This works by appending a condition to the boolean in the sql query
    for each request.
    Thus, a sql command for a with two requests would be of the form

    SELECT position,word,raw FROM word_index WHERE
      (position BETWEEN 30 AND 60) OR
      (position BETWEEN 95 and 130)
      AND
        book_id=47 OR book_id=74
      ORDER BY position

    It stores the result of this query to a map from position to token.

    Then, for each request, it gets the tokens it needs from the map,
    and packages it into a context object.

    Returns an array of contexts
  """
  def getContexts(self, requests):
    if not requests:
      return [];
    self.cursor.execute('SELECT position, word, raw, book_id FROM word_index ' +
        ' WHERE ' +
            '(' +
              'OR '.join(map(lambda request:
                  '(position BETWEEN %s AND %s AND book_id=%s) ' % (
                    request['position'] - request['numWordsBefore'],
                    request['position'] + request['numWordsAfter'] + 1,
                    request['bookId']
                  ), requests)) +
            ') ' +
        'ORDER BY position')

    # build map from position to token
    tokenMap = {}
    for row in self.cursor.fetchall():
      token = flaf_types.readToken(row)
      bookId = row[3]
      if bookId not in tokenMap:
        tokenMap[bookId] = {};
      tokenMap[bookId][token['position']] = token

    # build an array of contexts from the map, with one context object
    # per request.
    contexts = []
    for request in requests:
      tokenMapForBook = tokenMap[request['bookId']];
      context = {
        'bookId': request['bookId'],
        'token': tokenMapForBook[request['position']],
        'before': [],
        'after': []
      }
      # for each request, build an array from the words before and after
      for i in range(1, request['numWordsBefore'] + 1):
        tokenPosition = request['position'] - i;
        if (tokenPosition > 0):
          context['before'].append(tokenMapForBook[tokenPosition])
      context['before'].reverse()
      for i in range(1, request['numWordsAfter'] + 1):
        tokenPosition = request['position'] + i;
        if (tokenPosition in tokenMapForBook):
          context['after'].append(tokenMapForBook[tokenPosition])

      contexts.append(context)

    return contexts

  def getContextsByIndex(self, bookIds=[], word='', startIndex=0,
      count=18446744073709551615,
      numWordsBefore=25, numWordsAfter=25):
    cmd = ('SELECT book_id, position FROM word_index ' +
        'WHERE ' +
            '(%s) ' % ' OR '.join(map(lambda bookId: 'book_id=%s' % bookId, bookIds)) +
        'AND ' +
            'word="%s" ' % word +
        'ORDER BY position ASC ');
    # Get location of all hits.
    cmd += 'LIMIT %s,%s' % (startIndex, count)
    self.cursor.execute(cmd)

    contextRequests = [];
    for row in self.cursor.fetchall():
      contextRequests.append({
        'bookId': row[0],
        'position': row[1],
        'numWordsBefore': numWordsBefore,
        'numWordsAfter': numWordsAfter
      });

    return self.getContexts(contextRequests)

  """
    Gets a chunk of word counts data, starting with the (startIndex)th most
    common word, and getting count word counts.

    Returns array of wordcounts, which are tuples of (word, count)
  """
  def getWordCounts(self, bookId, startIndex, count):
    self.cursor.execute('SELECT word_counts.word, count ' +
        'FROM word_counts LEFT JOIN word_description ' +
            'ON word_counts.word=word_description.word ' +
        'WHERE COALESCE(common, FALSE) IS FALSE ' +
            'AND COALESCE(pronoun, FALSE) IS FALSE ' +
            'AND book_id = %s ' % bookId +
        'ORDER BY count DESC, word ASC LIMIT %s, %s' % (startIndex, count))

    wordCounts = [];
    for row in self.cursor.fetchall():
      word = row[0]
      count = int(row[1])
      wordCounts.append((word, count))
    return wordCounts;

  def getUncommonShared(self, bookIds):
    cmd = ('' +
        'SELECT ' +
            'word, ' +
            'COUNT(word) AS number_of_books, ' +
            ', '.join(map(lambda bookId:
                'BIT_OR(book_id=%s) AS in_%s' % (bookId, bookId), bookIds)) +
            ' ' +
        'FROM word_counts ' +
        'GROUP BY word ' +
        'HAVING ' +
            '(' +
                ' + '.join(map(lambda bookId: 'in_%s ' % bookId, bookIds)) +
            ') <= 2 ' +
        'ORDER BY number_of_books ASC, word ASC;')
    self.cursor.execute(cmd)
    words = {};
    for row in self.cursor.fetchall():
      key = 0;
      for index in range(len(bookIds)):
        key += pow(2, index) * row[index + 2]
      if str(key) not in words:
        words[str(key)] = []
      words[str(key)].append((row[0], row[1]))
    return words;

  def getCommonUnshared(self, bookIds, threshold):
    # for now, assume 2 books
    self.cursor.execute('' +
        'SELECT ' +
            'word, ' +
            'COUNT(word) AS number_of_books, ' +
            'BIT_OR(book_id=%s) AS in_first, ' % bookIds[0] +
            'BIT_OR(book_id=%s) AS in_second ' % bookIds[1] +
        'FROM word_counts ' +
        'GROUP BY word ' +
        'HAVING ' +
            '(in_first XOR in_second) AND number_of_books > 6 ' +
        'ORDER BY number_of_books ASC, word ASC;')

    words = {}
    for bookId in bookIds:
      words[str(bookId)] = []

    for row in self.cursor.fetchall():
      words[row[3] and str(bookIds[0]) or str(bookIds[1])].append(row[0])
    return words;




