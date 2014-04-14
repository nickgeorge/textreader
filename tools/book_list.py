#!/usr/bin/python

if __name__ == "__main__" and __package__ is None:
    from sys import path
    from os.path import dirname as dir
    path.append(dir(path[0]))

import sys
import argparse
import re
from common import util
from common import flaf_db
from common import list_dao
from common import colors


parser = argparse.ArgumentParser(
    description='Tool manipulating lists of books.')
parser.add_argument('action',
    help='Options: create, add, delete')
parser.add_argument('--book_ids',
    help='Comma-delimited list of book ids to add/remove.', dest="bookIds")
parser.add_argument('--label',
    help='Label of the list to use.', dest="label")

args = parser.parse_args()
listDao = list_dao.ListDao(flaf_db.newConn())

if args.action == 'create':
  label = util.requireFlag(args, 'label')

  util.dieIfNotNone(listDao.getListId(label),
     'Cannot create list [%s], list already exists.' % label)


  listDao.createList(label)

if args.action == 'delete':
  label = util.requireFlag(args, 'label')
  listId = listDao.getListId(label)
  util.dieIfNone(listId, 'Cannot delete list [%s], list does not exist.' % label)
  listDao.deleteList(label)

if args.action == 'add':
  label = util.requireFlag(args, 'label')
  bookIds = util.requireFlag(args, 'bookIds').split(',')

  listId = listDao.getListId(label)
  util.dieIfNone(listId, 'Cannot add to list [%s], list does not exist.' % label)

  listDao.addBookIds(listId, bookIds)


