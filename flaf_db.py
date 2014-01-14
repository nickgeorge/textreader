import flaf_types
import cgitb
import MySQLdb
import flaf_tracer
cgitb.enable()

def newConn():
  return MySQLdb.connect(host="localhost",
    user="root",
    passwd="fd360",
    db="flaf")

class DbDao:
  def __init__(self, conn, bookId):
    self.conn = conn
    self.cursor = conn.cursor()
    self.bookId  = bookId
    self.tracer = flaf_tracer.Tracer('DbDao')

  def getAllBooks(self):
    books = {};
    self.cursor.execute('SELECT book_id, title, author FROM books')
    for row in self.cursor.fetchall():
      books[row[0]] = flaf_types.readBook(row)
    return books

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

  def getContexts(self, requests):
    self.tracer.log('starting getContexts')
    self.cursor.execute('SELECT position,word,raw FROM word_index WHERE (' +
        'OR '.join(map(lambda request:
            '(position BETWEEN %s AND %s) ' % (
              request['position'] - request['numWordsBefore'],
              request['position'] + request['numWordsAfter']
            ), requests)) +
        ') ' +
        'AND book_id ="%s" ' % self.bookId +
        'ORDER BY position')
    self.tracer.log('done executing')

    tokenMap = {}
    for row in self.cursor.fetchall():
      token = flaf_types.readToken(row)
      tokenMap[token['position']] = token

    contexts = []
    for request in requests:
      context = {
        'position': request['position'],
        'token': tokenMap[request['position']],
        'before': [],
        'after': []
      }
      for i in range(1, request['numWordsBefore']):
        tokenPosition = request['position'] - i;
        if (tokenPosition > 0):
          context['before'].append(tokenMap[tokenPosition])
      context['before'].reverse()
      for i in range(1, request['numWordsAfter']):
        context['after'].append(tokenMap[request['position'] + i])
      contexts.append(context)

    return contexts;

  def getWordCounts(self, startIndex, count):
    self.cursor.execute('SELECT word_counts.word, count ' +
        'FROM word_counts LEFT JOIN word_description ' +
            'ON word_counts.word=word_description.word ' +
        'WHERE COALESCE(common, FALSE) IS FALSE ' +
            'AND COALESCE(pronoun, FALSE) IS FALSE ' +
            'AND book_id = %s ' % self.bookId +
        'ORDER BY count DESC LIMIT %s, %s' % (startIndex + 1, count))

    wordCounts = [];
    for row in self.cursor.fetchall():
      word = row[0]
      count = int(row[1])
      wordCounts.append([word, count])
    return wordCounts;

