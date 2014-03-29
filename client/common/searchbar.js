util.require('common/fuzzy_scorer.js');
util.require('common/menu.js');
util.require('common/utils/keycodes.js');
util.require('searchbar.soy');
util.useCss('common/searchbar.css');

Searchbar = function(books) {
  this.books = books;
  this.selectedBookIds = [];
  this.bookInputMenu = new Menu([]);
  this.bookBlockMenu = new Menu([
    {
      text: '',
      value: 'remove'
    }
  ]);
  this.scorer = new FuzzyScorer(util.object.toArray(books, function(book) {
    return {
      value: book.id,
      text: book.title
    }
  }, this));
  this.wordInput = null;
};
util.inherits(Searchbar, Component);

Searchbar.prototype.createDom = function() {
  util.renderSoy(this.getContentElement(), searchbar.templates.main);

  var bookInput = this.find('#search-bar-book-input');
  this.bookInputMenu.initialize();
  this.bookInputMenu.setAnchor(bookInput);
  this.bookInputMenu.hovercard.setOffset({top: 2, left: 0});

  this.bookBlockMenu.initialize();
  this.bookBlockMenu.hovercard.setOffset({top: 2, left: 0});


  this.listen(this.find('#search-bar-button'), 'click',
      this.onSearchButtonClicked);

  this.wordInput = this.find('#search-bar-word-input');
  this.listen(this.wordInput, 'keypress', function(event) {
    if (event.keyCode == util.events.KeyCodes.ENTER) {
      this.onSearchButtonClicked();
    }
  });

  this.listen(bookInput, 'keydown', function(event) {
    if (event.keyCode == util.events.KeyCodes.ENTER &&
        !this.bookInputMenu.isVisible()) {
      this.onSearchButtonClicked();
    }
    switch (event.keyCode) {
      case util.events.KeyCodes.UP:
      case util.events.KeyCodes.DOWN:
        if (!this.bookInputMenu.isVisible()) this.buildMenu();
        break;
    }
  });

  this.listen(document.body, 'click', function(event) {
    if (util.dom.isChild(event.target, bookInput)) {
      bookInput.select();
    }
    if (!util.dom.isChild(event.target, this.bookInputMenu.getContentElement())) {
      this.bookInputMenu.hide();
    }
  });
  this.buildMenu(false);
  this.bookInputMenu.listenForKeys(bookInput, util.bind(this.buildMenu, this));
  this.listen(this.bookInputMenu, Menu.EventType.SELECT, this.handleMenuSelect);
  this.listen(this.bookInputMenu, Menu.EventType.POP, this.handleMenuPop);

  this.listen(this.bookBlockMenu, Menu.EventType.SELECT, this.onBookBlockMenuSelect);
};

Searchbar.prototype.onBookBlockMenuSelect = function(menuEvent) {
  var bookId = Number(util.dom.getData(menuEvent.anchor, 'bookId'));
  util.array.remove(this.selectedBookIds, bookId);
  this.renderSelectedBooks();
};

Searchbar.prototype.updateHover = function(anchor) {
  var bookId = util.dom.getData(anchor, 'bookId');
  this.bookBlockMenu.setOption({
    text: 'Remove' + this.books[bookId].title, 
    value: 'remove'
  }, 0);
};

Searchbar.prototype.handleMenuSelect = function(bookInputMenuEvent) {
  this.selectedBookIds.push(bookInputMenuEvent.value);
  this.resetBookMenu();
};

Searchbar.prototype.handleMenuPop = function(bookInputMenuEvent) {
  this.selectedBookIds.pop();
  this.resetBookMenu();
};

Searchbar.prototype.resetBookMenu = function() {
  this.renderSelectedBooks();
  this.bookInputMenu.getAnchor().value = '';
  this.bookInputMenu.options = [];
  this.bookInputMenu.hide();
};

Searchbar.prototype.renderSelectedBooks = function() {
  var blockData = util.array.map(this.selectedBookIds, function(bookId) {
    return {
      text: 
        util.array.map(this.books[bookId].title.split(' '), function(token) {
          return token[0];
        }).join(''),
      bookId: bookId
    };
  }, this)

  util.renderSoy(this.find('#search-bar-selected-books'),
      searchbar.templates.selectedblocks, 
      {
        blockData: blockData
      });

  this.bookBlockMenu.hovercard.showOnHover(
      this.findAll('.search-bar-selected-block'),
      this.updateHover, this);
};

Searchbar.prototype.buildMenu = function(opt_show) {
  var matches = this.bookInputMenu.getAnchor().value ? 
      this.scorer.match(this.bookInputMenu.getAnchor().value) :
      [];
  matches = matches.slice(0, 5)
  var bookInputMenuOptions = matches.map(util.bind(function(match) {
    var book = this.books[match.option.value];
    return {
      text: book.title,
      value: book.id,
      value: book.id,
      indices: match.indices
    };
  }, this));
  this.bookInputMenu.setOptions(bookInputMenuOptions);
  this.bookInputMenu.highlightSelected();
  if (opt_show !== false && this.bookInputMenu.options.length > 0) {
    this.bookInputMenu.show();
  }
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