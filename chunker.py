import flaftypes
import cgitb
cgitb.enable()

class Chunker:
  def __init__(self, conn, bookId):
    self.conn = conn
    self.cursor = conn.cursor()
    self.bookId  = bookId
  def chunk(self, start, end):
    self.cursor.execute('SELECT position,word,raw FROM word_index ' +
        'WHERE position BETWEEN %s AND %s ' % (start, end) +
        'AND raw IS NOT NULL ' +
        'AND book_id ="%s" ' % self.bookId +
        'ORDER BY position')
    tokens = []
    for row in self.cursor.fetchall():
      tokens.append(flaftypes.readToken(row))

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

