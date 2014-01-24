// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof common == 'undefined') { var common = {}; }
if (typeof common.templates == 'undefined') { common.templates = {}; }


common.templates.searchbar = function(opt_data, opt_ignored) {
  var output = '<div id="search-bar"><select id="search-bar-book-select">';
  var bookIdList4 = soy.$$getMapKeys(opt_data.books);
  var bookIdListLen4 = bookIdList4.length;
  for (var bookIdIndex4 = 0; bookIdIndex4 < bookIdListLen4; bookIdIndex4++) {
    var bookIdData4 = bookIdList4[bookIdIndex4];
    var book__soy5 = opt_data.books[bookIdData4];
    var selected__soy6 = opt_data.initialBookId == book__soy5.id ? 'selected' : '';
    output += '<option value="' + soy.$$escapeHtml(book__soy5.id) + '" ' + soy.$$escapeHtml(selected__soy6) + '>' + soy.$$escapeHtml(book__soy5.title) + '</option>';
  }
  output += '</select><input  id="search-bar-word-input" type=\'text\' value=\'' + soy.$$escapeHtml(opt_data.initialWord) + '\'></input><button id="search-bar-button">Search</button></div>';
  return output;
};


common.templates.titleboard = function(opt_data, opt_ignored) {
  return '<div class="titleboard"><div class="titleboard-text">' + soy.$$filterNoAutoescape(opt_data.contents) + '</div></div>';
};
