#!/usr/bin/python

import sys
import cgi, cgitb
import flaf_tracer
import flaf_db

class ListDao:
  def __init__(self, conn):
    self.conn = conn;
    self.cursor = flaf_db.LoggingCursor(self.conn)

  def createList(self, label):
    self.cursor.execute('INSERT INTO book_lists (label) ' +
        'VALUES ("%s")' % label)
    self.conn.commit()

  def deleteList(self, label):
    listId = self.getListId(label)
    self.cursor.execute('DELETE FROM book_lists ' +
        'WHERE id=%s' % listId)
    self.cursor.execute('DELETE FROM book_list_index ' +
        'WHERE list_id=%s' % listId)
    self.conn.commit()

  def getListId(self, label):
    self.cursor.execute('SELECT id FROM book_lists ' +
        'WHERE label="%s"' % label)

    for row in self.cursor.fetchall():
      return row[0]

    return None

  def addBookIds(self, label, bookIds):
    self.cursor.execute('INSERT INTO book_list_index (list_id, book_id) ' +
        'VALUES ' +
            ', '.join(map(lambda bookId: 
                '(%s, %s)' % (label, bookId), bookIds)))
    self.conn.commit()

  def getBooksInList(self, listId):
    self.cursor.execute('SELECT book_id FROM book_list_index ' +
        'WHERE list_id=%s' % listId)
  
    books = [];
    for row in self.cursor.fetchall():
      books.append(row[0])

    return books



