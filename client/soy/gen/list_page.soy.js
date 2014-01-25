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
  var contextList29 = opt_data.contexts;
  var contextListLen29 = contextList29.length;
  for (var contextIndex29 = 0; contextIndex29 < contextListLen29; contextIndex29++) {
    var contextData29 = contextList29[contextIndex29];
    output += '<div class="context-section card" id="context-section-' + soy.$$escapeHtml(contextData29.token.position) + '" data-position="' + soy.$$escapeHtml(contextData29.token.position) + '" >' + listpage.templates.context({context: contextData29}) + '</div>';
  }
  return output;
};


listpage.templates.context = function(opt_data, opt_ignored) {
  var output = '<div class="context-section-expander expander-top" data-position="' + soy.$$escapeHtml(opt_data.context.token.position) + '" data-before="' + soy.$$escapeHtml(opt_data.context.before.length) + '" data-after="' + soy.$$escapeHtml(opt_data.context.after.length) + '"></div><div class="context-section-text">...';
  var tokenList47 = opt_data.context.before;
  var tokenListLen47 = tokenList47.length;
  for (var tokenIndex47 = 0; tokenIndex47 < tokenListLen47; tokenIndex47++) {
    var tokenData47 = tokenList47[tokenIndex47];
    output += soy.$$escapeHtml(tokenData47.raw) + ' ';
  }
  output += '<span class="keyword">' + soy.$$escapeHtml(opt_data.context.token.raw) + '</span>  ';
  var tokenList54 = opt_data.context.after;
  var tokenListLen54 = tokenList54.length;
  for (var tokenIndex54 = 0; tokenIndex54 < tokenListLen54; tokenIndex54++) {
    var tokenData54 = tokenList54[tokenIndex54];
    output += soy.$$escapeHtml(tokenData54.raw) + ' ';
  }
  output += '...</div><div class="context-section-expander expander-bottom" data-position="' + soy.$$escapeHtml(opt_data.context.token.position) + '" data-before="' + soy.$$escapeHtml(opt_data.context.before.length) + '" data-after="' + soy.$$escapeHtml(opt_data.context.after.length) + '"></div>';
  return output;
};
