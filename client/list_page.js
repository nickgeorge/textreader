util.require('list_page.soy');
util.require('common/searchbar.js');
util.require('common/hovercard.js');
util.require('common/menu.js');
util.require('common.soy');
util.useCss('list_page.css');


ListPage = function(data) {
  this.bookId = data.bookId;
  this.word = data.word;
  this.contexts = data.contexts;
  this.books = data.books;
  this.contentElm = null;
  this.hoverCard = null;
};

ListPage.prototype.render = function(contentElm) {
  this.contentElm = contentElm;
  this.contentElm.innerHTML = listpage.templates.main({
    contexts: this.contexts,
    bookId: this.bookId,
    word: this.word,
    books: this.books
  });

  Searchbar.init(this.books, this.bookId, this.word);

  $('.context-section-expander').click(
      util.bind(this.onExpanderClicked, this));

  this.hoverCard = new Hovercard().setContent(new Menu([
    {
      text: 'Show Word Index',
      action: util.bind(function(){
        window.location.href =
            '/wordcounts?bookId=' + this.bookId;
      }, this),
    }
  ]));
  this.hoverCard.showOnHover($('.book-title'));
  this.loadChunk();
};

ListPage.prototype.loadChunk = function() {
  $.ajax({
    url: '/getcontext/index',
    data: {
      startIndex: this.contexts.length,
      beforeCount: 25,
      afterCount: 25,
      word: this.word,
      bookId: this.bookId
    },
    success: util.bind(this.onContextsLoaded, this),
    error: function(){console.log(arguments)}
  });
};

ListPage.prototype.onContextsLoaded = function(newContexts) {
  $('#contexts-container')[0].innerHTML += listpage.templates.contextGroup({
    contexts: newContexts
  });
  $('.context-section-expander').click(
      util.bind(this.onExpanderClicked, this));
};


ListPage.prototype.onExpanderClicked = function(event) {
  var $target = $(event.target);
  var position = parseInt($target.attr('data-position'));
  var beforeCount = parseInt($target.attr('data-before'));
  var afterCount = parseInt($target.attr('data-after'));
  var isUpExpand = $target.hasClass('expander-top');

  $.ajax({
    url: '/getcontext/position',
    data: {
      positions: position,
      beforeCount: beforeCount + (isUpExpand ? 100 : 0),
      afterCount: afterCount + (isUpExpand ? 0 : 100),
      bookId: this.bookId
    },
    success: util.bind(this.onGetExpandedContext, this, isUpExpand),
    error: function(){console.log(arguments)}
  });
};

ListPage.prototype.shift = function(delta) {
  var contextsContainer = $('#cards-container');
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
ListPage.prototype.onGetExpandedContext = function(isUpExpand, contexts) {
  var context = contexts[0];
  var containerId = '#context-section-' + context.token.position;
  this.slideTextToFit(containerId,
      listpage.templates.context({context: context}),
      isUpExpand);

  $(containerId + ' .context-section-expander').click(
      util.bind(this.onExpanderClicked, this));
};


ListPage.prototype.slideTextToFit = function(sectionId, text, isUpExpand) {
  // This is a bunch of assorted hackery for making the smooth exanding cards
  var initialHeight = getComputedStyle(
      $(sectionId + ' .context-section-text')[0]).height;

  $(sectionId)[0].innerHTML = text;
  // Note that when we reset the html of the section in the line above,
  // we reset the dom.
  var textSection = $(sectionId + ' .context-section-text')[0];
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
