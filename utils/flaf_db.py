import flaf_types
import cgitb
import MySQLdb
import flaf_tracer
cgitb.enable()

"""
  Creates a database connection.  I *think* this should be limited to one per
  thread, but I'm not sure how much it matters.
"""
def newConn():
  return MySQLdb.connect(host="localhost",
    user="root",
    passwd="fd360",
    db="flaf")

"""
  Data-access object (dao) for accessing mysql database.
  All complicated/common (all period?) mysql operations should be done through
  this object.
"""
class DbDao:
  def __init__(self, conn, bookId):
    self.conn = conn
    self.cursor = conn.cursor()
    self.bookId  = bookId
    self.tracer = flaf_tracer.Tracer('DbDao')

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
  def chunk(self, start, end):
    self.tracer.log('Getting chunk %s : %s' % (start, end))
    self.cursor.execute('SELECT position,word,raw FROM word_index ' +
        'WHERE position BETWEEN %s AND %s ' % (start, end) +
        'AND raw IS NOT NULL ' +
        'AND book_id ="%s" ' % self.bookId +
        'ORDER BY position')
    tokens = []
    for row in self.cursor.fetchall():
      tokens.append(flaf_types.readToken(row))

    self.tracer.log('done chunking')
    return tokens

  """
    Gets the surrounding context of a position.
    Returns an array of tokens starting at position - numWordsBefore,
      and ending at position + numWordsAfter
  """
  def getContext(self, position, numWordsBefore, numWordsAfter):
    tokens = self.chunk(position - numWordsBefore, position + numWordsAfter)
    context = {
      'position': position,
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
      AND bookId=47
      ORDER BY position

    It stores the result of this query to a map from position to token.

    Then, for each request, it gets the tokens it needs from the map,
    and packages it into a context object.

    Returns an array of contexts
  """
  def getContexts(self, requests):
    if not requests:
      return [];

    self.tracer.log(len(requests))
    self.tracer.log('starting getContexts')
    self.cursor.execute('SELECT position,word,raw FROM word_index WHERE (' +
        'OR '.join(map(lambda request:
            '(position BETWEEN %s AND %s) ' % (
              request['position'] - request['numWordsBefore'],
              request['position'] + request['numWordsAfter'] + 1
            ), requests)) +
        ') ' +
        'AND book_id ="%s" ' % self.bookId +
        'ORDER BY position')

    # build map from position to token
    tokenMap = {}
    for row in self.cursor.fetchall():
      token = flaf_types.readToken(row)
      tokenMap[token['position']] = token

    # build an array of contexts from the map, with one context object
    # per request.
    contexts = []
    for request in requests:
      context = {
        'position': request['position'],
        'token': tokenMap[request['position']],
        'before': [],
        'after': []
      }
      # for each request, build an array from the words before and after
      for i in range(1, request['numWordsBefore'] + 1):
        tokenPosition = request['position'] - i;
        if (tokenPosition > 0):
          context['before'].append(tokenMap[tokenPosition])
      context['before'].reverse()
      for i in range(1, request['numWordsAfter'] + 1):
        tokenPosition = request['position'] + i;
        if (tokenPosition in tokenMap):
          context['after'].append(tokenMap[tokenPosition])

      contexts.append(context)

    return contexts

  """
    Gets a chunk of word counts data, starting with the (startIndex)th most
    common word, and getting count word counts.

    Returns array of wordcounts, which are tuples of (word, count)
  """
  def getWordCounts(self, startIndex, count):
    self.cursor.execute('SELECT word_counts.word, count ' +
        'FROM word_counts LEFT JOIN word_description ' +
            'ON word_counts.word=word_description.word ' +
        'WHERE COALESCE(common, FALSE) IS FALSE ' +
            'AND COALESCE(pronoun, FALSE) IS FALSE ' +
            'AND book_id = %s ' % self.bookId +
        'ORDER BY count DESC, word ASC LIMIT %s, %s' % (startIndex + 1, count))

    wordCounts = [];
    for row in self.cursor.fetchall():
      word = row[0]
      count = int(row[1])
      wordCounts.append((word, count))
    return wordCounts;

