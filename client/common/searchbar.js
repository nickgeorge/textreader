util.require('common/fuzzy_scorer.js');
util.require('common/hovercard.js');
util.require('common/utils/keycodes.js');
util.require('searchbar.soy');
util.useCss('common/searchbar.css');

Searchbar = function(books) {
  this.books = books;
  this.initialWord = '';
  this.menu = new Menu([]);
  this.hovercard = new Hovercard();
  this.scorer = new FuzzyScorer(util.object.toArray(books, function(book) {
    return {
      value: book.id,
      text: book.title
    }
  }, this));
  this.bookInput = null;
  this.wordInput = null;
};
util.inherits(Searchbar, Component);

Searchbar.prototype.createDom = function() {
  util.renderSoy(this.getContentElement(), searchbar.templates.main);

  this.bookInput = this.find('#search-bar-book-input');
  this.wordInput = this.find('#search-bar-word-input');
  this.hovercard.initialize();
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
      this.bookInput.select();
    } else {
      this.hovercard.hide();
    }
  });
  this.buildMenu(false);
  this.menu.listenForKeys(this.bookInput, util.bind(this.buildMenu, this));
  this.listen(this.menu, Menu.EventType.SELECT, this.handleMenuKey);
};

Searchbar.prototype.handleMenuKey = function(menuEvent) {
  this.bookInput.value = '';
  util.array.forEach(menuEvent.values, function(value) {
    this.find('#search-bar-selected-books').appendChild(
        soy.renderAsElement(searchbar.templates.selectedblock, {
          text: this.books[value].title
        }));
  }, this);
  this.hovercard.hide();
};

Searchbar.prototype.buildMenu = function(opt_show) {
  var matches = this.scorer.match(this.bookInput.value);
  var menuOptions = matches.map(util.bind(function(match) {
    var book = this.books[match.option.value];
    return {
      text: book.title,
      value: book.id,
      indices: match.indices
    };
  }, this));
  this.menu.setOptions(menuOptions);
  this.menu.highlightSelected();
  if (opt_show !== false) this.hovercard.show();
};

Searchbar.prototype.onSearchButtonClicked = function() {
  var word = this.wordInput.value;
  if (word) {
    window.location.href = '/search?bookIds=' +
        this.menu.getSelected().join(',') + '&word=' + word;
  } else {
    window.location.href = '/wordcounts?bookId=' + this.bookId;
  }
};

Searchbar.prototype.setWord = function(word) {
  this.wordInput.value = word;
};
