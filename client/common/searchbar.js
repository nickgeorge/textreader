util.require('searchbar.soy');

Searchbar = function(books, opt_initialBookId, opt_initialWord) {
  this.books = books;
  this.initialBookId = opt_initialBookId || 0;
  this.initialWord = opt_initialWord || '';
};
util.inherits(Searchbar, Component);

Searchbar.init = function(books, bookId, word) {
  new Searchbar(books, bookId, word).render($('#search-bar-container')[0]);
}

Searchbar.prototype.createDom = function() {
  util.renderSoy(this.getContentElement(), searchbar.templates.main, {
    initialBook: this.books[this.initialBookId].title,
    initialWord: this.initialWord
  });

  $(this.find('#search-bar-button')).click(
      util.bind(this.onSearchButtonClicked, this));

  $(this.find('#search-bar-word-input')).keypress(util.bind(function(event) {
    if (event.keyCode == 13) {
      this.onSearchButtonClicked();
    }
  }, this));

  $(this.find('#search-bar-book-input')).keypress(util.bind(function(event) {
    if (event.keyCode == 13) {
      this.onSearchButtonClicked();
      return;
    }

  }, this));


};

Searchbar.prototype.onSearchButtonClicked = function() {
  var bookId = $('#search-bar-book-select').find(":selected").val();
  var word = $('#search-bar-word-input').val();
  if (word) {
    window.location.href = '/search?bookId=' + bookId + '&word=' + word;
  } else {
    window.location.href = '/wordcounts?bookId=' + bookId;
  }
};
