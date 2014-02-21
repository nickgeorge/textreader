// This file was automatically generated from list_page.soy.
// Please don't edit this file by hand.

if (typeof listpage == 'undefined') { var listpage = {}; }
if (typeof listpage.templates == 'undefined') { listpage.templates = {}; }


listpage.templates.main = function(opt_data, opt_ignored) {
  return '<div id="search-bar-container"></div><div id="cards-container">' + ((opt_data.bookIds.length > 0) ? listpage.templates.titleboard(opt_data) : '') + '<div id="contexts-container">' + listpage.templates.contextGroup({startIndex: 0, contexts: opt_data.contexts, books: opt_data.books}) + '</div></div><div id="hovercards"></div>';
};


listpage.templates.titleboard = function(opt_data, opt_ignored) {
  var param23 = 'Showing [<span class="keyword">' + soy.$$escapeHtml(opt_data.word) + '</span>] in ';
  var bookIdList27 = opt_data.bookIds;
  var bookIdListLen27 = bookIdList27.length;
  for (var bookIdIndex27 = 0; bookIdIndex27 < bookIdListLen27; bookIdIndex27++) {
    var bookIdData27 = bookIdList27[bookIdIndex27];
    var book__soy28 = opt_data.books[bookIdData27];
    param23 += '<span class="hoverable book-title" data-title="' + soy.$$escapeHtml(book__soy28.title) + '" data-book-id="' + soy.$$escapeHtml(bookIdData27) + '">' + soy.$$escapeHtml(book__soy28.title) + '</span>, by ' + soy.$$escapeHtml(book__soy28.author) + ((! (bookIdIndex27 == bookIdListLen27 - 1)) ? ', and<div class=\'clear\'></div>' : '');
  }
  var output = common.templates.titleboard({contents: param23});
  return output;
};


listpage.templates.contextGroup = function(opt_data, opt_ignored) {
  var output = '<div class="context-group">';
  var contextList44 = opt_data.contexts;
  var contextListLen44 = contextList44.length;
  for (var contextIndex44 = 0; contextIndex44 < contextListLen44; contextIndex44++) {
    var contextData44 = contextList44[contextIndex44];
    var index__soy45 = opt_data.startIndex + contextIndex44;
    output += '<div class="context-section card" id="context-section-' + soy.$$escapeHtml(index__soy45) + '" data-context-index="' + soy.$$escapeHtml(index__soy45) + '" >' + listpage.templates.context({context: contextData44, book: opt_data.books[contextData44.bookId]}) + '</div>';
  }
  output += '</div>';
  return output;
};


listpage.templates.context = function(opt_data, opt_ignored) {
  var output = '';
  var position__soy58 = opt_data.context.token.position;
  output += '<div class="context-section-expander expander-top"></div><div class="context-section-title">' + soy.$$escapeHtml(opt_data.book.title) + ' - Word ' + soy.$$escapeHtml(position__soy58) + '</div><div class="context-section-text">' + ((position__soy58 - opt_data.context.before.length > 1) ? '...' : '');
  var tokenList67 = opt_data.context.before;
  var tokenListLen67 = tokenList67.length;
  for (var tokenIndex67 = 0; tokenIndex67 < tokenListLen67; tokenIndex67++) {
    var tokenData67 = tokenList67[tokenIndex67];
    output += soy.$$escapeHtml(tokenData67.raw) + ' ';
  }
  output += '<span class="keyword">' + soy.$$escapeHtml(opt_data.context.token.raw) + '</span>  ';
  var tokenList74 = opt_data.context.after;
  var tokenListLen74 = tokenList74.length;
  for (var tokenIndex74 = 0; tokenIndex74 < tokenListLen74; tokenIndex74++) {
    var tokenData74 = tokenList74[tokenIndex74];
    output += soy.$$escapeHtml(tokenData74.raw) + ' ';
  }
  output += '...</div><div class="context-section-expander expander-bottom"></div>';
  return output;
};
