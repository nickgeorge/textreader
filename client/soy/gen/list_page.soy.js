// This file was automatically generated from list_page.soy.
// Please don't edit this file by hand.

if (typeof listpage == 'undefined') { var listpage = {}; }
if (typeof listpage.templates == 'undefined') { listpage.templates = {}; }


listpage.templates.main = function(opt_data, opt_ignored) {
  return '<div id="search-bar-container"></div><div id="cards-container">' + listpage.templates.titleboard({book: opt_data.books[opt_data.bookId], word: opt_data.word}) + '<div id="contexts-container">' + listpage.templates.contextGroup(opt_data) + '</div></div><div id="hovercards"></div>';
};


listpage.templates.titleboard = function(opt_data, opt_ignored) {
  return common.templates.titleboard({contents: 'Showing [<span class="keyword">' + soy.$$escapeHtml(opt_data.word) + '</span>] in <span class="hoverable book-title" data-title="' + soy.$$escapeHtml(opt_data.book.title) + '">' + soy.$$escapeHtml(opt_data.book.title) + '</span>, by ' + soy.$$escapeHtml(opt_data.book.author)});
};


listpage.templates.contextGroup = function(opt_data, opt_ignored) {
  var output = '';
  var contextList45 = opt_data.contexts;
  var contextListLen45 = contextList45.length;
  for (var contextIndex45 = 0; contextIndex45 < contextListLen45; contextIndex45++) {
    var contextData45 = contextList45[contextIndex45];
    output += '<div class="context-section" id="context-section-' + soy.$$escapeHtml(contextData45.token.position) + '" data-position="' + soy.$$escapeHtml(contextData45.token.position) + '" >' + listpage.templates.context({context: contextData45}) + '</div>';
  }
  return output;
};


listpage.templates.context = function(opt_data, opt_ignored) {
  var output = '<div class="context-section-expander expander-top" data-position="' + soy.$$escapeHtml(opt_data.context.token.position) + '" data-before="' + soy.$$escapeHtml(opt_data.context.before.length) + '" data-after="' + soy.$$escapeHtml(opt_data.context.after.length) + '"></div><div class="context-section-text">...';
  var tokenList63 = opt_data.context.before;
  var tokenListLen63 = tokenList63.length;
  for (var tokenIndex63 = 0; tokenIndex63 < tokenListLen63; tokenIndex63++) {
    var tokenData63 = tokenList63[tokenIndex63];
    output += soy.$$escapeHtml(tokenData63.raw) + ' ';
  }
  output += '<span class="keyword">' + soy.$$escapeHtml(opt_data.context.token.raw) + '</span>  ';
  var tokenList70 = opt_data.context.after;
  var tokenListLen70 = tokenList70.length;
  for (var tokenIndex70 = 0; tokenIndex70 < tokenListLen70; tokenIndex70++) {
    var tokenData70 = tokenList70[tokenIndex70];
    output += soy.$$escapeHtml(tokenData70.raw) + ' ';
  }
  output += '...</div><div class="context-section-expander expander-bottom" data-position="' + soy.$$escapeHtml(opt_data.context.token.position) + '" data-before="' + soy.$$escapeHtml(opt_data.context.before.length) + '" data-after="' + soy.$$escapeHtml(opt_data.context.after.length) + '"></div>';
  return output;
};
