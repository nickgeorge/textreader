util.require('list_page.soy');
util.require('common/searchbar.js');
util.require('common/hovercard.js');
util.require('common/menu.js');
util.require('common.soy');
util.useCss('list_page.css');


ListPage = function(data) {
  util.base(this);

  this.bookIds = data.bookIds;
  this.word = data.word;
  this.contexts = data.contexts;
  this.books = data.books;
  this.searchbar = null;
  this.hovercard = new Hovercard();
  this.menu = new Menu([
    {
      text: 'Show Word Index',
      value: 'word-index'
    }
  ]);
};
util.inherits(ListPage, Component);


ListPage.prototype.createDom = function(contentElement) {

  soy.renderElement(this.contentElement, listpage.templates.main, {
    contexts: this.contexts,
    bookIds: this.bookIds,
    word: this.word,
    books: this.books,
  });

  this.searchbar = new Searchbar(this.books);
  this.searchbar.render(this.find('#search-bar-container'));
  this.searchbar.setWord(this.word);
  this.searchbar.setSelectedBookIds(this.bookIds);

  this.listenAll(this.findAll('.context-section-expander'),
      'click', this.onExpanderClicked);

  this.hovercard.initialize();
  this.hovercard.setContent(this.menu);
  this.menu.setHovercard(this.hovercard);
  this.hovercard.setOffset({top: -4, left: 0});
  this.hovercard.showOnHover(this.findAll('.book-title'));

  this.listen(this.menu, Menu.EventType.SELECT, this.onMenuSelect);

  this.loadChunk(100);
};

ListPage.prototype.onMenuSelect = function(event) {
  window.location.href =
      '/wordcounts?bookId=' +
      util.dom.getData(this.hovercard.getAnchor(), 'bookId');
};


ListPage.prototype.loadChunk = function(count) {
  $.ajax({
    url: '/getcontext/index',
    data: {
      startIndex: this.contexts.length,
      count: 100,
      beforeCount: 25,
      afterCount: 25,
      word: this.word,
      bookIds: this.bookIds.join(',')
    },
    success: util.bind(this.onContextsLoaded, this, 100),
    error: function(){console.log(arguments)}
  });
};


ListPage.prototype.onContextsLoaded = function(expect, newContexts) {
  var startIndex = this.contexts.length;
  util.array.pushAll(this.contexts, newContexts);
  var newContextGroup = soy.renderAsElement(
      listpage.templates.contextGroup,
      {
        startIndex: startIndex,
        contexts: newContexts,
        books: this.books
      });
  this.find('#contexts-container').appendChild(newContextGroup);
  this.listenAll(util.dom.findAll('.context-section-expander', newContextGroup),
      'click', this.onExpanderClicked);
  if (newContexts.length == expect) {
    this.loadChunk(100);
  }
};


ListPage.prototype.onExpanderClicked = function(event) {
  var target = event.target;
  var contextIndex = util.dom.getIntData(
      util.dom.getClosest(target, '.context-section'),
      'contextIndex');
  var context = this.contexts[contextIndex];

  var bookId = context.bookId;
  var position = context.token.position;
  var beforeCount = context.before.length;
  var afterCount = context.after.length;
  var isUpExpand = util.dom.hasClass(target, 'expander-top');

  $.ajax({
    url: '/getcontext/position',
    data: {
      positions: position,
      beforeCount: beforeCount + (isUpExpand ? 100 : 0),
      afterCount: afterCount + (isUpExpand ? 0 : 100),
      bookId: bookId
    },
    success: util.bind(this.onGetExpandedContext,
        this, contextIndex, isUpExpand),
    error: function(){console.log(arguments)}
  });
};

ListPage.prototype.shift = function(delta) {
  var contextsContainer = this.find('#cards-container');
  contextsContainer.css('marginTop',
      (parseInt(contextsContainer.css('marginTop')) + delta + 'px'));
}

/**
 * Handles response from the server to a get contexts request,
 * to expand context.
 * n.b. that the server always sends an array of contexts, even when this is
 * only a single context, as in the case of here.
 * @param {boolean} isUpExpand Whether or not this is an "up" direction
 *     expand.
 * @param {Array.<Object>} contexts An array with a single context element.
 */
ListPage.prototype.onGetExpandedContext =
    function(contextIndex, isUpExpand, contexts) {
  var context = util.array.getOnlyElement(contexts);
  this.contexts[contextIndex] = context;
  var containerId = '#context-section-' + contextIndex;
  this.slideTextToFit(containerId,
      listpage.templates.context({
        context: context,
        book: this.books[context.bookId]
      }),
      isUpExpand);

  this.listenAll(this.findAll(containerId + ' .context-section-expander'),
      'click', this.onExpanderClicked);
};


ListPage.prototype.slideTextToFit = function(sectionId, text, isUpExpand) {
  // This is a bunch of assorted hackery for making the smooth exanding cards
  var initialHeight = getComputedStyle(
      this.find(sectionId + ' .context-section-text')).height;

  this.find(sectionId).innerHTML = text;
  // Note that when we reset the html of the section in the line above,
  // we reset the dom.
  var textSection = this.find(sectionId + ' .context-section-text');
  var finalHeight = getComputedStyle(textSection).height;

  textSection.style.height = initialHeight;
  textSection.offsetHeight; // Forces render
  textSection.style.transition = 'height .4s ease-in-out';
  textSection.style.height = finalHeight;

  textSection.addEventListener('transitionend', function transitionEnd(event) {
    if (event.propertyName == 'height') {
      textSection.style.transition = '';
      textSection.style.height = 'auto';
      textSection.removeEventListener('transitionend', transitionEnd, false);
    }
  }, false)

  if (isUpExpand) {
    var delta = parseInt(finalHeight) - parseInt(initialHeight);
    $('html, body').animate({
      scrollTop: $(window).scrollTop() + delta
    }, 400);
  }
};

ListPage.prototype.isOnlyOneBook = function() {
  return this.bookIds.length == 1;
};
