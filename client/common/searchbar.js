util.require('common/fuzzy_scorer.js');
util.require('common/hovercard.js');
util.require('common/utils/keycodes.js');
util.require('searchbar.soy');
util.useCss('common/searchbar.css');

Searchbar = function(books, opt_initialBookId, opt_initialWord) {
  this.books = books;
  this.bookId = opt_initialBookId || 0;
  this.initialWord = opt_initialWord || '';
  this.menu = new Menu([]);
  this.hovercard = new Hovercard();
  this.scorer = new FuzzyScorer(util.object.toArray(books, function(book) {
    return {
      value: book,
      text: book.title
    }
  }, this));
  this.bookInput = null;
  this.wordInput = null;
};
util.inherits(Searchbar, Component);

Searchbar.init = function(books, bookId, word) {
  var searchbar = new Searchbar(books, bookId, word);
  searchbar.render($('#search-bar-container')[0]);
  return searchbar;
};

Searchbar.prototype.createDom = function() {
  util.renderSoy(this.getContentElement(), searchbar.templates.main, {
    initialBook: this.books[this.bookId].title,
    initialWord: this.initialWord
  });

  this.bookInput = this.find('#search-bar-book-input');
  this.wordInput = this.find('#search-bar-word-input');
  this.hovercard.setContent(this.menu);
  this.hovercard.setAnchor(this.bookInput);
  this.hovercard.setOffset({top: 2, left: 0});

  this.listen(this.find('#search-bar-button'), 'click',
      this.onSearchButtonClicked);

  this.listen(this.wordInput, 'keypress', function(event) {
    if (event.keyCode == util.events.KeyCodes.ENTER) {
      this.onSearchButtonClicked();
    }
  });

  this.listen(this.bookInput, 'keydown', function(event) {
    if (event.keyCode == util.events.KeyCodes.ENTER &&
        !this.hovercard.isVisible()) {
      this.onSearchButtonClicked();
    }
    if (event.keyCode == util.events.KeyCodes.ESC &&
        this.hovercard.isVisible()) {
      this.hovercard.hide();
    }
    switch (event.keyCode) {
      case util.events.KeyCodes.UP:
      case util.events.KeyCodes.DOWN:
        if (!this.hovercard.isVisible()) this.buildMenu();
        break;
    }
  });

  this.listen(document.body, 'click', function(event) {
    if (util.dom.isChild(event.target, this.bookInput)) {
      // this.buildMenu();
      this.bookInput.select();
    } else {
      this.hovercard.hide();
    }
  });
  this.buildMenu(false);
  this.menu.listenForKeys(this.bookInput, util.bind(this.buildMenu, this));
};

Searchbar.prototype.buildMenu = function(opt_show) {
  var matches = this.scorer.match(this.bookInput.value);
  var menuOptions = matches.map(util.bind(function(match) {
    return {
      text: match.option.text,
      indices: match.indices,
      action: util.bind(this.selectBook, this, match.option.value)
    };
  }, this));
  this.menu.setOptions(menuOptions);
  this.menu.highlightSelected();
  if (opt_show !== false) this.hovercard.show();
};

Searchbar.prototype.onSearchButtonClicked = function() {
  var word = this.wordInput.value;
  if (word) {
    window.location.href = '/search?bookId=' + this.bookId + '&word=' + word;
  } else {
    window.location.href = '/wordcounts?bookId=' + this.bookId;
  }
};

Searchbar.prototype.selectBook = function(book) {
  this.bookInput.value = book.title;
  this.bookId = book.id;
  this.hovercard.hide();
};
