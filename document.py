import sys

def writeHeader():
  print "Content-type:text/html\r\n\r\n"
def writeJsonHeader():
  print "Content-type:application/json\r\n\r\n"

class Document:
  def __init__(self):
    self.requiredFiles = []
    self.css = []
    self.bodyLines = []
  def require(self, filename):
    if filename not in self.requiredFiles:
      self.requiredFiles.append(filename)
  def requireSoy(self, filename):
    self.require('bin/' + filename + '.js')
  def addCss(self, filename):
    self.css.append(filename)
  def bodyLine(self, line):
      self.bodyLines.append(line)

  def write(self):
    writeHeader()
    print('<html>')
    print('  <head>')
    for filename in self.css:
      print('    <link rel="stylesheet" type="text/css" href="' + filename + '">')
    for filename in self.requiredFiles:
      print('    <script src="' + filename + '"></script>')
    print('  </head>')
    print('  <body>')
    for line in self.bodyLines:
      print('    ' + line)
    print('  </body>')
    print('</html>')
