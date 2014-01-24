#!/usr/bin/python

"""
 token = {
    position: number,
    word: string,
    raw: string
  }
"""
def newToken(position, word, raw):
  return {
    'position': int(position),
    'word': unicode(word, errors='replace'),
    'raw': unicode(raw, errors='replace')
  }

def readToken(row):
  return newToken(row[0], row[1], row[2])


"""
 book = {
    id: number,
    title: string,
    author: string
  }
"""
def newBook(id, title, author):
  return {
    'id': int(id),
    'title': unicode(title, errors='replace'),
    'author': unicode(author, errors='replace')
  }

def readBook(row):
  return newBook(row[0], row[1], row[2])


"""
  context = {
    token: token,
    before: Array.<token>,
    after: Array.<token>
  }
"""

