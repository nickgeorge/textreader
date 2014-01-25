util.require('word_counts_page.soy');
util.require('common/searchbar.js');
util.require('common/hovercard.js');
util.require('common/menu.js');
util.require('common.soy');
util.useCss('word_counts_page.css');


WordCountsPage = function(data) {
  this.contentElement = null;
  this.wordCounts = data.wordCounts;
  this.maxWordCount = this.wordCounts[0][1];
  this.books = data.books;
  this.bookId = data.bookId;
  this.requestInFlight = false;
  this.wordHovercard = new Hovercard();
  this.graphTypeHovercard = new Hovercard();
};

WordCountsPage.prototype.render = function(element) {
  this.contentElement = element;

  this.contentElement.innerHTML = wordcountspage.templates.main({
    wordCounts: this.wordCounts,
    book: this.books[this.bookId]
  });

  Searchbar.init(this.books, this.bookId, '');

  $(this.contentElement).find('.word-count-bar:lt(50)').css('transition',
      'width .6s cubic-bezier(.4,.1,.46,.1)')
  this.contentElement.offsetHeight; // Forces render


  $(this.contentElement).find('.word-count-bar')[0].addEventListener(
      'transitionend',
      util.bind(function transitionEnd(event) {
        if (event.propertyName == 'width') {
          this.getCounts(this.wordCounts.length, 1600);
        }
      }, this), false)

  $(this.contentElement).find('.word-count-bar').each(
       util.bind(this.setBarSize, this));

  this.wordHovercard.setContent(
      new Menu([
        {
          text: 'See in ' + this.books[this.bookId].title,
          action: util.bind(function(anchor){
            var word = $(anchor).find('.word-count-word')[0];
            window.location.href = '/search?bookId=' + this.bookId +
                '&word=' + this.wordHovercard.anchor.innerHTML;
          }, this)
        }
      ]));
  this.wordHovercard.showOnHover(
      $(this.contentElement).find('.word-count-word'));

  $(window).scroll(util.bind(this.maybeGetCounts, this));
};

WordCountsPage.prototype.setBarSize = function(index, elm) {
  elm.style.width = Math.max(1,
      710 * (this.wordCounts[index][1] / this.maxWordCount)) + 'px';
};

WordCountsPage.prototype.maybeGetCounts = function() {
  if ($(window).scrollTop() > $(document).height() - 6 * $(window).height() &&
      !this.requestInFlight) {
    this.getCounts(this.wordCounts.length, 3200);
  }
};

WordCountsPage.prototype.getCounts = function(startIndex, count) {
  this.requestInFlight = true;
  $.ajax({
    url: '/getwordcount.cgi',
    data: {
      startIndex: startIndex,
      count: count,
      bookId: this.bookId
    },
    success: util.bind(this.onGetWordCountsSuccess, this, startIndex),
    error: function(){console.log(arguments)}
  });
};

WordCountsPage.prototype.onGetWordCountsSuccess =
    function(startIndex, countsData) {
  this.requestInFlight = false;
  var newBatchContainer = document.createElement('div');
  newBatchContainer.innerHTML = wordcountspage.templates.wordCountGroup({
        wordCounts: countsData,
        startIndex: startIndex
  });
  $(this.contentElement).find('.word-counts-container').
      append(newBatchContainer);

  this.wordCounts = this.wordCounts.slice(0, startIndex).
      concat(countsData);

  $newBars = $(this.contentElement).
      find('.word-count-batch-' + startIndex + ' .word-count-bar');
  this.wordHovercard.showOnHover($newBars);
  util.forEach($newBars,
      function(barElm, index){
        this.setBarSize(startIndex + index, barElm);
      }, this);
};


WordCountsPage.prototype.collapse = function() {
  var barSelector = '.word-count-container:lt(50)';

  $(this.contentElement).find(barSelector).css('transition', '' +
      'top 1s cubic-bezier(.4,.1,.46,.1), ' +
      'left 1s cubic-bezier(.4,.1,.46,.1), ' +
      '-webkit-transform 1s ease-in ');

  this.contentElement.offsetHeight; // Forces render

  $(barSelector).each(function(index, element) {
    element.style.top = 2000 + Math.random() * 1000 + 'px';
    element.style.left = Math.random() * 1000 - 500 + 'px';
    element.style['-webkit-transform'] = 'rotate(' + (Math.random() * 50 - 25) + 'deg)';
  });
  $(this.contentElement).find('.word-counts-container').css('background', 'rgba(1, 1, 1, 0)');
};
