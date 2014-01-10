#!/usr/bin/python

def newToken(position, word, raw):
  return {
    'position': int(position),
    'word': unicode(word, errors='replace'),
    'raw': unicode(raw, errors='replace')
  }

def readToken(row):
  return newToken(row[0], row[1], row[2])

def newBook(id, title, author):
  return {
    'id': int(id),
    'title': unicode(title, errors='replace'),
    'author': unicode(author, errors='replace')
  }

def readBook(row):
  return newBook(row[0], row[1], row[2])
