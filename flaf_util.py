#!/usr/bin/python

import MySQLdb

def newConn():
  return MySQLdb.connect(host="localhost",
    user="root",
    passwd="fd360",
    db="flaf")
