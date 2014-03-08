// This file was automatically generated from word_counts_page.soy.
// Please don't edit this file by hand.

if (typeof wordcountspage == 'undefined') { var wordcountspage = {}; }
if (typeof wordcountspage.templates == 'undefined') { wordcountspage.templates = {}; }


wordcountspage.templates.main = function(opt_data, opt_ignored) {
  return '<div id="search-bar-container"></div>' + wordcountspage.templates.titleboard(opt_data) + '<div class="word-counts-container card">' + wordcountspage.templates.wordCountGroup(opt_data) + '</div>';
};


wordcountspage.templates.wordCountGroup = function(opt_data, opt_ignored) {
  var output = '';
  var wordCountList119 = opt_data.wordCounts;
  var wordCountListLen119 = wordCountList119.length;
  for (var wordCountIndex119 = 0; wordCountIndex119 < wordCountListLen119; wordCountIndex119++) {
    var wordCountData119 = wordCountList119[wordCountIndex119];
    output += wordcountspage.templates.wordCount({word: wordCountData119[0], count: wordCountData119[1], startIndex: opt_data.startIndex});
  }
  return output;
};


wordcountspage.templates.wordCount = function(opt_data, opt_ignored) {
  return '<div class="word-count-container word-count-batch-' + soy.$$escapeHtml(opt_data.startIndex != null ? opt_data.startIndex : 0) + '"><span class="word-count-ruler"></span><span class="word-count-bar"><span class="word-count-word">' + soy.$$escapeHtml(opt_data.word) + '</span></span><span class="word-count-count">' + soy.$$escapeHtml(opt_data.count) + '</span></div>';
};


wordcountspage.templates.titleboard = function(opt_data, opt_ignored) {
  return common.templates.titleboard({contents: 'Showing <span class="hoverable word-counts-anchor">word counts</span> for <span class="book-title" data-title="' + soy.$$escapeHtml(opt_data.book.title) + '">' + soy.$$escapeHtml(opt_data.book.title) + '</span>, by ' + soy.$$escapeHtml(opt_data.book.author)});
};
