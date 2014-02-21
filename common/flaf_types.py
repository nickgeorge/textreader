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
    'word': word,
    'raw': raw
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
    'title': title,
    'author': author
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

