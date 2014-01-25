import sys
import json

def writeHeader():
  print("Content-type:text/html\r\n\r\n")
def writeJsonHeader():
  print("Content-type:application/json\r\n\r\n")

def writeJson(obj):
  writeJsonHeader()
  print(json.dumps(obj))


class Document:
  def __init__(self):
    self.requiredFiles = []
    self.css = []
    self.bodyLines = []
    self.title = ''
  def require(self, filename):
    if filename not in self.requiredFiles:
      self.requiredFiles.append(filename)
  def addCss(self, filename):
    self.css.append(filename)
  def bodyLine(self, line):
    self.bodyLines.append(line)
  def setTitle(self, title):
    self.title = title;

  def addCommonDeps(self):
    self.require('common/utils/soyutils.js')
    self.require('common/utils/util.js')
    self.require('common/utils/extensions.js')
    self.require('common/utils/jquery/1.10.2/jquery.min.js')
    self.addCss('common/common.css')


  def write(self):
    writeHeader()
    print('<!DOCTYPE html>')
    print('<html>')
    print('  <head>')
    print('    <title>' + self.title + '</title>')
    print('    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico">')
    for filename in self.css:
      print('    <link rel="stylesheet" type="text/css" href="/' + filename + '">')
    for filename in self.requiredFiles:
      print('    <script src="/' + filename + '"></script>')
    print('  </head>')
    print('  <body>')
    for line in self.bodyLines:
      print('    ' + line)
    print('  </body>')
    print('</html>')