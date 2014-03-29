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
parser.add_argument('--text_path',
    help='The path of the book to add.', dest='textPath')

args = parser.parse_args()
indexer = flaf_indexer.Indexer(flaf_db.newConn())

if args.action == 'delete':
  if args.bookId is None:
    print('Error: --book_id must be set to delete.')
    sys.exit(1)
  indexer.deleteFromIndexes(args.bookId)


if args.action == 'reindex':
  if args.bookId is None:
    print('Error: --book_id must be set to reindex.')
    sys.exit(1)

  indexer.deleteFromIndexes(args.bookId)
  indexer.addToIndexes(args.bookId)

if args.action == 'add':
  if args.textPath is None or args.author is None or args.title is None:
    print('Error: --text_path, --author, --title must be set to add book.')
    sys.exit(1)

  textFile = open(args.textPath, 'r')
  text = textFile.read()
  bookId = indexer.addToBooksByText(args.title, args.author, text)
  indexer.addToIndexes(bookId);
  

