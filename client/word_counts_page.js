WordCountsPage = function(data) {
  this.contentElement = null;
  this.wordCounts = data.wordCounts;
  this.maxWordCount = this.wordCounts[0][1];
  this.books = data.books;
  this.bookId = data.bookId;
  this.requestInFlight = false;
  this.wordHovercard = new Hovercard();
};

WordCountsPage.prototype.render = function(element) {
  this.contentElement = element;

  this.contentElement.innerHTML = wordcountspage.templates.main({
    wordCounts: this.wordCounts,
    book: this.books[this.bookId]
  });

  Searchbar.init(this.books, this.bookId, '');

  $(this.contentElement).find('.word-count-bar').each(
      Util.bind(this.setBarSize, this));

  this.wordHovercard.setContent(
      new Menu([
        {
          text: 'See in ' + this.books[this.bookId].title,
          action: Util.bind(function(anchor){
            var word = $(anchor).find('.word-count-word')[0];
            window.location.href = '/textreader/?bookId=' + this.bookId +
                '&word=' + this.wordHovercard.anchor.innerHTML;
          }, this)
        }
      ])).showOnHover($(this.contentElement).find('.word-count-word'));

  $(window).scroll(Util.bind(this.maybeGetCounts, this));
};

WordCountsPage.prototype.setBarSize = function(index, elm) {
  elm.style.width = Math.max(1,
      710 * (this.wordCounts[index][1] / this.maxWordCount)) + 'px';
};

WordCountsPage.prototype.maybeGetCounts = function() {
  if ($(window).scrollTop() > $(document).height() - 6 * $(window).height() &&
      !this.requestInFlight) {
    this.getCounts(this.wordCounts.length, 200);
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
    success: Util.bind(this.onGetWordCountsSuccess, this, startIndex),
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

  this.wordCounts = this.wordCounts.concat(countsData);

  $newBars = $(this.contentElement).
      find('.word-count-batch-' + startIndex + ' .word-count-bar');
  this.wordHovercard.showOnHover($newBars);
  Util.forEach($newBars,
      function(barElm, index){
        this.setBarSize(startIndex + index, barElm);
      }, this);
};
