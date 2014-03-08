util.require('common/fuzzy_scorer.js');
util.require('common/hovercard.js');
util.require('common/utils/keycodes.js');
util.require('searchbar.soy');
util.useCss('common/searchbar.css');

Searchbar = function(books) {
  this.books = books;
  this.menu = new Menu([]);
  this.hovercard = new Hovercard();
  this.scorer = new FuzzyScorer(util.object.toArray(books, function(book) {
    return {
      value: book.id,
      text: book.title
    }
  }, this));
  this.selectedBookIds = [];
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
    }
    if (!util.dom.isChild(event.target, this.menu.getContentElement())) {
      this.hovercard.hide();
    }
  });
  this.buildMenu(false);
  this.menu.listenForKeys(this.bookInput, util.bind(this.buildMenu, this));
  this.listen(this.menu, Menu.EventType.SELECT, this.handleMenuSelect);
  this.listen(this.menu, Menu.EventType.POP, this.handleMenuPop);
};

Searchbar.prototype.handleMenuSelect = function(menuEvent) {
  this.selectedBookIds.push(menuEvent.value);

  this.renderSelectedBooks();
  this.bookInput.value = '';
  this.menu.options = [];
  this.hovercard.hide();
};

Searchbar.prototype.handleMenuPop = function(menuEvent) {
  this.selectedBookIds.pop();

  this.renderSelectedBooks();
  this.bookInput.value = '';
  this.menu.options = [];
  this.hovercard.hide();
};

Searchbar.prototype.renderSelectedBooks = function() {
  var  titles = util.array.map(this.selectedBookIds, function(bookId) {
    return this.books[bookId].title; 
  }, this)

  util.renderSoy(this.find('#search-bar-selected-books'),
      searchbar.templates.selectedblocks, 
      {
        titles: titles
      });

};

Searchbar.prototype.buildMenu = function(opt_show) {
  var matches = this.bookInput.value ? 
      this.scorer.match(this.bookInput.value) :
      [];
  matches = matches.slice(0, 5)
  var menuOptions = matches.map(util.bind(function(match) {
    var book = this.books[match.option.value];
    return {
      text: book.title,
      value: book.id,
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
        this.selectedBookIds.join(',') + '&word=' + word;
  } else if (this.selectedBookIds.length == 1) {
    window.location.href = '/wordcounts?bookId=' +
        util.array.getOnlyElement(this.selectedBookIds);
  } else if (this.selectedBookIds.length > 0) {
    window.location.href = '/wordmap?bookIds=' +
        this.selectedBookIds.join(',');
  }
};

Searchbar.prototype.setWord = function(word) {
  this.wordInput.value = word;
};

Searchbar.prototype.setSelectedBookIds = function(bookIds) {
  this.selectedBookIds = bookIds;
  this.renderSelectedBooks();
};