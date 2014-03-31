#!/usr/bin/python

import cgi, cgitb

import word_description
from ..utils import flaf_db
cgitb.enable()

conn = flaf_db.newConn()
cursor = conn.cursor()
cursor.execute('DELETE FROM word_description')

cursor.execute('INSERT INTO word_description (word, common, pronoun) VALUES ' +
    ', '.join(map(
        lambda word: '("' + conn.escape_string(word) + '", TRUE, FALSE)',
        word_description.common)) + ', ' +
    ', '.join(map(
        lambda pronoun: '("' + conn.escape_string(pronoun) + '", FALSE, TRUE)',
        word_description.pronouns)))

conn.commit()
