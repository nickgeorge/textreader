import flaf_types
import cgitb
import MySQLdb
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

  def getAllBooks(self):
    books = {};
    self.cursor.execute('SELECT book_id, title, author FROM books')
    for row in self.cursor.fetchall():
      books[row[0]] = flaf_types.readBook(row)
    return books

  def chunk(self, start, end):
    self.cursor.execute('SELECT position,word,raw FROM word_index ' +
        'WHERE position BETWEEN %s AND %s ' % (start, end) +
        'AND raw IS NOT NULL ' +
        'AND book_id ="%s" ' % self.bookId +
        'ORDER BY position')
    tokens = []
    for row in self.cursor.fetchall():
      tokens.append(flaf_types.readToken(row))

    return tokens

  def getContext(self, position, numWordsBefore, numWordsAfter):
    context = {
      'position': position,
      'before': [],
      'after': []
    }
    tokens = self.chunk(position - numWordsBefore, position + numWordsAfter + 1)
    for token in tokens:
      if token['position'] < position:
        context['before'].append(token)
      if token['position'] > position:
        context['after'].append(token)
      if token['position'] == position:
        context['token'] = token

    return context;

  def getWordCounts(self, startIndex, count):
    self.cursor.execute('SELECT word_counts.word, count ' +
        'FROM word_counts LEFT JOIN word_description ' +
            'ON word_counts.word=word_description.word ' +
        'WHERE COALESCE(common, FALSE) IS FALSE ' +
            'AND COALESCE(pronoun, FALSE) IS FALSE ' +
            'AND book_id = %s ' % self.bookId +
        'ORDER BY count DESC LIMIT %s, %s' % (startIndex, count))

    wordCounts = [];
    for row in self.cursor.fetchall():
      word = row[0]
      count = int(row[1])
      wordCounts.append([word, count])
    return wordCounts;

