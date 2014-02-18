#!/usr/bin/python

if __name__ == "__main__" and __package__ is None:
    from sys import path
    from os.path import dirname as dir
    path.append(dir(path[0]))

import sys
import argparse
import urllib2
import re
from common import flaf_db
from common import flaf_indexer

parser = argparse.ArgumentParser(
    description='Tool for indexing/reindexing books.')
parser.add_argument('action',
    help='The action to take.')
parser.add_argument('--book_id',
    help='The book to index.', type=int, dest='bookId')
parser.add_argument('--author',
    help='The author of the book to add.')
parser.add_argument('--title',
    help='The title of the book to add.')
parser.add_argument('--gut_id',
    help='The path of the book to add.', type=int, dest='gutId')

args = parser.parse_args()
indexer = flaf_indexer.Indexer(flaf_db.newConn())

if args.action == 'reindex':
  if args.bookId is None:
    print('Error: --book_id must be set to reindex.')
    sys.exit(1)

  indexer.deleteFromIndexes(args.bookId)
  indexer.addToIndexes(args.bookId)

if args.action == 'add':
  if args.gutId is None or args.author is None or args.title is None:
    print('Error: --gut_id, --author, --title must be set to add book.')
    sys.exit(1)

  gutenbergUrl = 'http://www.gutenberg.org/cache/epub/%s/pg%s.txt';

  opener = urllib2.build_opener(urllib2.ProxyHandler({}))
  urllib2.install_opener(opener)

  text = urllib2.urlopen(gutenbergUrl % (args.gutId, args.gutId)).read()

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
  # print(text)
  bookId = indexer.addToBooksByText(args.title, args.author, text)
  indexer.addToIndexes(bookId)

