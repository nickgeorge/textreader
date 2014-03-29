#!/usr/bin/python

import cgitb
import sys, time
cgitb.enable()

class Tracer:
  startTime = time.time()

  def __init__(self, name):
    self.name = name
    self.log('Started')

  def log(self, msg):
    sys.stderr.write('%s:\t%s - %s\n' % (
      int((time.time() - Tracer.startTime) * 1000),
      self.name,
      msg.encode('ascii', 'replace')
    ))
