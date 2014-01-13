#!/usr/bin/python

import cgi, cgitb
import flaf_util
import word_description
cgitb.enable()

conn = flaf_util.newConn()
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
