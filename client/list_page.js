ListPage = function(data) {
  this.bookId = data.bookId;
  this.word = data.word;
  this.contexts = data.contexts;
  this.books = data.books;
  this.contentElm = null;
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
      Util.bind(this.onExpanderClicked, this));

  var page = this;
  new Hovercard().setContent(new Menu([
    {
      text: 'Show Word Index',
      action: Util.bind(function(){
        window.location.href =
            '/textreader/wordcounts?bookId=' + this.bookId;
      }, this),
    }
  ])).showOnHover($('.book-title'));
};

ListPage.prototype.onExpanderClicked = function(event) {
  var $target = $(event.target);
  var position = parseInt($target.attr('data-position'));
  var beforeCount = parseInt($target.attr('data-before'));
  var afterCount = parseInt($target.attr('data-after'));
  var isUpExpand = $target.hasClass('expander-top');


  $.ajax({
    url: '/getcontext.cgi',
    data: {
      position: position,
      beforeCount: beforeCount + (isUpExpand ? 100 : 0),
      afterCount: afterCount + (isUpExpand ? 0 : 100),
      word: this.word,
      bookId: this.bookId
    },
    success: Util.bind(this.onGetContext, this, isUpExpand),
    error: function(){console.log(arguments)}
  });
};

ListPage.prototype.onGetContext = function(isUpExpand, data) {
  var containerId = '#context-section-' + data.token.position;

  var initialHeight =
      getComputedStyle($(containerId + ' .context-section-text')[0]).height;

  $(containerId)[0].innerHTML = listpage.templates.context({context: data});
  var textSection = $(containerId + ' .context-section-text')[0];
  textSection.style.height = 'auto';
  var finalHeight = getComputedStyle(textSection).height;

  textSection.style.height = initialHeight;
  textSection.offsetHeight;
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

  $(containerId + ' .context-section-expander').click(
      Util.bind(this.onExpanderClicked, this));
};

ListPage.prototype.shift = function(delta) {
  var contextsContainer = $('#contexts-container');
  contextsContainer.css('marginTop',
      (parseInt(contextsContainer.css('marginTop')) + delta + 'px'));
}
