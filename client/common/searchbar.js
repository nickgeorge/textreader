Searchbar = function(books, opt_initialBookId, opt_initialWord) {
  this.books = books;
  this.initialBookId = opt_initialBookId || 0;
  this.initialWord = opt_initialWord || '';
  this.contentElm = null;
};

Searchbar.init = function(books, bookId, word) {
  new Searchbar(books, bookId, word).render($('#search-bar-container')[0]);
}

Searchbar.prototype.render = function(contentElm) {
  this.contentElm = contentElm;
  this.contentElm.innerHTML = common.templates.searchbar({
    books: this.books,
    initialBookId: this.initialBookId,
    initialWord: this.initialWord
  });

  $('#search-bar-button').click(util.bind(this.onSearchButtonClicked, this));


  $('#search-bar-word-input').keypress(util.bind(function(event) {
    if (event.keyCode == 13) {
      this.onSearchButtonClicked();
    }
  }, this));
};

Searchbar.prototype.onSearchButtonClicked = function() {
  var bookId = $('#search-bar-book-select').find(":selected").val();
  var word = $('#search-bar-word-input').val();
  if (word) {
    window.location.href = '/search?bookId=' + bookId + '&word=' + word;
  } else {
    window.location.href = '/search/wordcounts?bookId=' + bookId;
  }
};
